-- Fase 3 — Akurasi yang tumbuh (Lampiran C.5 PRD): catat pertandingan,
-- blending, confidence yang tumbuh, peredam osilasi, notifikasi in-app.

create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.players (id) on delete cascade,
  tanggal date not null default current_date,
  menit_bermain int not null,
  posisi_dimainkan text not null,
  gol int null,
  assist int null,
  peluang_diciptakan int null,
  tekel_berhasil int null,
  intersep int null,
  duel_udara_menang int null,
  kehilangan_bola int null,
  pelanggaran int null,
  clean_sheet boolean null,
  -- "Faktor kalibrasi global" per PRD — mekanismenya belum dirinci PRD,
  -- jadi TIDAK dipakai di rumus S_i/confidence manapun saat ini (lihat
  -- match-stats-conversion.ts). Disimpan mentah saja untuk Fase 0 kalibrasi
  -- nanti, supaya tidak ada logika tersembunyi yang mengarang mekanismenya.
  penilaian_diri smallint null check (penilaian_diri between 1 and 5),
  created_at timestamptz not null default now()
);

alter table public.matches enable row level security;

create policy "matches select own"
  on public.matches for select
  to authenticated
  using (player_id = auth.uid());

create policy "matches insert own"
  on public.matches for insert
  to authenticated
  with check (player_id = auth.uid());

create policy "matches update own"
  on public.matches for update
  to authenticated
  using (player_id = auth.uid())
  with check (player_id = auth.uid());

create policy "matches delete own"
  on public.matches for delete
  to authenticated
  using (player_id = auth.uid());

create index if not exists matches_player_id_idx on public.matches (player_id);

-- Kolom baru di attribute_profiles untuk Fase 3. Semua NULLABLE (bukan NOT
-- NULL) dengan sengaja: menghitung posisi_utama_code/role_utama_code untuk
-- baris LAMA butuh menjalankan ulang tie-break Tahap 6 (pickMainPosition),
-- dan itu logika TypeScript, bukan SQL — menulis ulang aturan tie-break di
-- PL/pgSQL cuma untuk backfill berarti dua sumber kebenaran yang bisa
-- berbeda. Baris lama dibiarkan null; kode aplikasi (fetchProfileHistory)
-- fallback ke pickMainPosition() seperti sekarang kalau kolom ini null.
-- Baris BARU (mulai Fase 3) selalu diisi oleh recalculate-profile.ts.
alter table public.attribute_profiles
  add column if not exists atribut_kuesioner jsonb,
  add column if not exists posisi_utama_code text,
  add column if not exists role_utama_code text,
  add column if not exists position_changed boolean not null default false,
  add column if not exists change_acknowledged_at timestamptz,
  -- R (skor keandalan responden) — sebelum Fase 3 tidak pernah disimpan
  -- terpisah dari confidence (C). Dibutuhkan mulai Fase 3 supaya rekalkulasi
  -- bisa memanggil computeConfidence(reliability, matchCount, dataCompleteness)
  -- dengan R yang sama seperti kuesioner terakhir, tanpa mengulang kuesioner.
  add column if not exists reliability numeric(4, 3);

-- Backfill APROKSIMASI, didokumentasikan sebagai keterbatasan yang
-- disengaja: `atribut_kuesioner` semestinya Q_i SEBELUM Tahap 4 normalisasi
-- (lihat ScoringResult.questionnaireAttributes di run-pipeline.ts), tapi
-- baris lama hanya menyimpan `atribut` yang SUDAH melalui Tahap 4. Karena
-- Fase 1/2 tidak pernah blending (n=0 selalu, blend adalah passthrough),
-- `atribut` lama tetap perkiraan yang wajar dipakai sebagai basis rekalkulasi
-- pertama pemain lama — akan otomatis terkoreksi begitu pemain itu mengulang
-- kuesioner (Fase 4) dan menyimpan `atribut_kuesioner` yang benar.
update public.attribute_profiles
set atribut_kuesioner = atribut
where atribut_kuesioner is null;

-- Backfill R eksak (bukan tebakan): rumus Fase 1/2 adalah C = 0,35*R persis
-- (N=0, V=0 selalu di fase itu), jadi R = C / 0,35. Dipotong ke [0,1] untuk
-- jaga-jaga pembulatan floating point.
update public.attribute_profiles
set reliability = greatest(0, least(1, confidence / 0.35))
where reliability is null;

comment on column public.attribute_profiles.atribut_kuesioner is
  'Q_i murni dari kuesioner — tidak berubah antar rekalkulasi kecuali pemain mengulang kuesioner (PRD: "jawaban baru menggantikan Q_i sepenuhnya, sementara S_i tetap terakumulasi").';
comment on column public.attribute_profiles.posisi_utama_code is
  'Hasil akhir SETELAH peredam osilasi (shouldSwitchMainPosition), bukan pickMainPosition mentah. Null untuk baris pra-Fase-3.';
comment on column public.attribute_profiles.role_utama_code is
  'Role utama yang ditampilkan pada baris ini, pasangan dari posisi_utama_code. Null untuk baris pra-Fase-3.';
