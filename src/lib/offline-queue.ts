import { dbDelete, dbGetAll, dbPut, type StoreName } from './db';

interface QueuedItem<T> {
  id: string;
  payload: T;
}

export interface OfflineQueue<T> {
  /** Simpan `payload` ke antrean lokal, dicoba lagi nanti (saat online). */
  enqueue: (payload: T) => Promise<void>;
  /** Coba kirim ulang semua item yang tertunda; hapus dari antrean kalau berhasil. */
  flush: () => Promise<void>;
  /** Coba kirim sekarang; kalau gagal, otomatis diantrekan. */
  sendOrQueue: (payload: T) => Promise<void>;
}

/**
 * Pola antre-lokal-lalu-kirim-ulang generik (diekstrak dari implementasi
 * `analytics.ts` semula) — dipakai untuk event analytics maupun input
 * pertandingan offline (NFR: "Input pertandingan tanpa koneksi | Antrean
 * lokal, sinkron otomatis"). `send` disuntik per pemakai karena cara
 * mengirimnya berbeda (fetch anon untuk analytics, client Supabase
 * ter-otentikasi untuk pertandingan).
 */
export function createOfflineQueue<T>(store: StoreName, send: (payload: T) => Promise<boolean>): OfflineQueue<T> {
  async function enqueue(payload: T): Promise<void> {
    const id = crypto.randomUUID();
    await dbPut(store, id, { id, payload } satisfies QueuedItem<T>);
  }

  async function flush(): Promise<void> {
    const queued = await dbGetAll<QueuedItem<T>>(store);
    for (const item of queued) {
      const sent = await send(item.payload);
      if (sent) await dbDelete(store, item.id);
    }
  }

  async function sendOrQueue(payload: T): Promise<void> {
    const sent = await send(payload);
    if (!sent) await enqueue(payload);
  }

  if (typeof window !== 'undefined') {
    // Sinkronisasi dengan status jaringan browser: begitu kembali online,
    // coba kosongkan antrean yang gagal terkirim saat offline.
    window.addEventListener('online', () => {
      void flush();
    });
    void flush();
  }

  return { enqueue, flush, sendOrQueue };
}
