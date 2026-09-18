import { supabase } from '../../../lib/supabase';
import { createOfflineQueue } from '../../../lib/offline-queue';
import type { Database } from '../../../lib/database.types';
import { recalculateProfile } from './recalculate-profile';
import type { MatchInputValues } from '../schema';

interface QueuedMatchSubmission {
  userId: string;
  values: MatchInputValues;
}

export interface SubmitMatchResult {
  queuedOffline: boolean;
  recalculationSucceeded: boolean;
}

function toMatchInsert(userId: string, values: MatchInputValues): Database['public']['Tables']['matches']['Insert'] {
  return {
    player_id: userId,
    menit_bermain: values.menitBermain,
    posisi_dimainkan: values.posisiDimainkan,
    gol: values.gol,
    assist: values.assist,
    peluang_diciptakan: values.peluangDiciptakan,
    tekel_berhasil: values.tekelBerhasil,
    intersep: values.intersep,
    duel_udara_menang: values.duelUdaraMenang,
    kehilangan_bola: values.kehilanganBola,
    pelanggaran: values.pelanggaran,
    clean_sheet: values.cleanSheet,
    penilaian_diri: values.penilaianDiri,
  };
}

/**
 * Dipakai saat antrean offline dicoba ulang (lihat `createOfflineQueue`).
 * Begitu INSERT `matches` berhasil, item ini dianggap "terkirim" (dihapus
 * dari antrean) TERLEPAS dari apakah rekalkulasi sesudahnya berhasil —
 * mencegah dobel-insert (retry berikutnya akan mengulang INSERT yang sama)
 * lebih penting daripada rekalkulasi langsung. Kalau rekalkulasi gagal di
 * sini, profil akan menyusul ter-update saat pertandingan berikutnya
 * direkalkulasi (bukan hilang tanpa jejak — sengaja, bukan ditelan diam-diam).
 */
async function sendQueuedMatch(submission: QueuedMatchSubmission): Promise<boolean> {
  if (!supabase) return false;

  const { error } = await supabase.from('matches').insert(toMatchInsert(submission.userId, submission.values));
  if (error) return false;

  try {
    await recalculateProfile(supabase, { userId: submission.userId });
  } catch {
    // Lihat komentar fungsi.
  }
  return true;
}

const matchQueue = createOfflineQueue<QueuedMatchSubmission>('matchQueue', sendQueuedMatch);

/**
 * FR-14/FR-15 — simpan pertandingan lalu rekalkulasi profil. Offline (atau
 * INSERT gagal karena jaringan): diantrekan ke IndexedDB, disinkronkan
 * otomatis saat online (NFR "Input pertandingan tanpa koneksi").
 */
export async function submitMatch(userId: string, values: MatchInputValues): Promise<SubmitMatchResult> {
  if (!supabase) {
    await matchQueue.enqueue({ userId, values });
    return { queuedOffline: true, recalculationSucceeded: false };
  }

  const { error: insertError } = await supabase.from('matches').insert(toMatchInsert(userId, values));
  if (insertError) {
    await matchQueue.enqueue({ userId, values });
    return { queuedOffline: true, recalculationSucceeded: false };
  }

  try {
    await recalculateProfile(supabase, { userId });
    return { queuedOffline: false, recalculationSucceeded: true };
  } catch {
    return { queuedOffline: false, recalculationSucceeded: false };
  }
}
