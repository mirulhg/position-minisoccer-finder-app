import { dbDelete, dbGetAll, dbPut } from './db';

const ANONYMOUS_ID_STORAGE_KEY = 'msf-anonymous-id';

interface AnalyticsRecord {
  anonymous_id: string;
  player_id: string | null;
  event_name: string;
  event_data: Record<string, unknown> | null;
}

interface QueuedAnalyticsEvent {
  id: string;
  record: AnalyticsRecord;
}

/**
 * ID acak per perangkat, sengaja di localStorage (bukan IndexedDB) — dibaca
 * sinkron sebelum `db.ts` (async, butuh `openDB`) selesai siap, jadi event
 * paling awal (mis. `onboarding_step_viewed` pertama) tetap bisa dikirim.
 */
function getAnonymousId(): string {
  try {
    const existing = localStorage.getItem(ANONYMOUS_ID_STORAGE_KEY);
    if (existing) return existing;
    const created = crypto.randomUUID();
    localStorage.setItem(ANONYMOUS_ID_STORAGE_KEY, created);
    return created;
  } catch {
    // localStorage bisa diblokir (mode privat ketat) — id acak per pemanggilan,
    // funnel tetap tercatat, hanya tidak bisa disatukan antar-event kali ini.
    return crypto.randomUUID();
  }
}

/**
 * Kirim langsung lewat `fetch()` ke REST PostgREST, BUKAN `@supabase/supabase-js`
 * — supaya modul ini tidak menarik SDK penuh (dan `auth` chunk) ke bundle
 * awal yang dimuat semua pengunjung sebelum login (lihat perbaikan
 * code-splitting sebelumnya).
 */
async function sendEvent(record: AnalyticsRecord): Promise<boolean> {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !publishableKey) return false;

  try {
    const response = await fetch(`${url}/rest/v1/analytics_events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: publishableKey,
        Authorization: `Bearer ${publishableKey}`,
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(record),
      keepalive: true,
    });
    return response.ok;
  } catch {
    return false;
  }
}

async function enqueue(record: AnalyticsRecord): Promise<void> {
  const id = crypto.randomUUID();
  await dbPut('analyticsQueue', id, { id, record } satisfies QueuedAnalyticsEvent);
}

/** Mencoba kirim ulang semua event yang tertunda (offline saat dicatat). */
export async function flushAnalyticsQueue(): Promise<void> {
  const queued = await dbGetAll<QueuedAnalyticsEvent>('analyticsQueue');
  for (const item of queued) {
    const sent = await sendEvent(item.record);
    if (sent) await dbDelete('analyticsQueue', item.id);
  }
}

/**
 * Fire-and-forget: TIDAK PERNAH di-`await` oleh pemanggil, TIDAK PERNAH
 * melempar, dan gagal kirim (offline dsb.) diam-diam diantrekan ke
 * IndexedDB untuk dicoba lagi nanti — instrumentasi funnel tidak boleh
 * mengganggu atau memperlambat alur kuesioner (NFR Observabilitas).
 */
export function trackEvent(eventName: string, eventData?: Record<string, unknown>): void {
  const record: AnalyticsRecord = {
    anonymous_id: getAnonymousId(),
    player_id: null,
    event_name: eventName,
    event_data: eventData ?? null,
  };

  void sendEvent(record).then((sent) => {
    if (!sent) return enqueue(record);
  });
}

if (typeof window !== 'undefined') {
  // Sinkronisasi dengan status jaringan browser: begitu kembali online,
  // coba kosongkan antrean event yang gagal terkirim saat offline.
  window.addEventListener('online', () => {
    void flushAnalyticsQueue();
  });
  void flushAnalyticsQueue();
}
