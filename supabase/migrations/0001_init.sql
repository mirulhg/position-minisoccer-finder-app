-- Fase 2 — Menyimpan & menyebar (Lampiran C.5 PRD).
-- Hanya tabel yang relevan Fase 2: players, attribute_profiles, role_scores,
-- scoring_configs. matches / peer ratings (Fase 3/V1) belum dibuat di sini.

create table if not exists public.scoring_configs (
  versi text primary key,
  -- Mean/stdev per atribut disimpan sebagai jsonb (bukan satu kolom per
  -- atribut) supaya bentuknya tetap sama dengan
  -- src/features/scoring/config/scoring-config.defaults.ts dan tidak perlu
  -- migrasi skema setiap kali daftar atribut berubah (mis. atribut kiper
  -- ditambah/dikurangi). Bentuk: {"PAC": {"mean": 50, "stdev": 15}, ...}.
  mean_stdev_per_atribut jsonb not null,
  k_blending numeric not null,
  gamma_gate numeric not null,
  k_saturasi_frekuensi numeric not null,
  aktif_sejak timestamptz not null default now()
);

alter table public.scoring_configs enable row level security;

-- Konfigurasi bobot adalah data referensi bersama (bukan milik satu
-- pengguna) — semua pengguna yang login boleh membaca, tidak ada yang boleh
-- menulis lewat anon/authenticated key (hanya lewat migrasi/service role).
create policy "scoring_configs readable by authenticated"
  on public.scoring_configs for select
  to authenticated
  using (true);

insert into public.scoring_configs (versi, mean_stdev_per_atribut, k_blending, gamma_gate, k_saturasi_frekuensi)
values (
  'fase0-placeholder',
  -- Sama dengan DEFAULT_COHORT_STATS di scoring-config.defaults.ts: mean=50,
  -- stdev=15 seragam untuk semua atribut sampai Fase 0 kalibrasi selesai.
  '{
    "PAC": {"mean": 50, "stdev": 15}, "ACC": {"mean": 50, "stdev": 15}, "STA": {"mean": 50, "stdev": 15},
    "STR": {"mean": 50, "stdev": 15}, "AGI": {"mean": 50, "stdev": 15}, "JMP": {"mean": 50, "stdev": 15},
    "FTC": {"mean": 50, "stdev": 15}, "DRB": {"mean": 50, "stdev": 15}, "PSS": {"mean": 50, "stdev": 15},
    "LPS": {"mean": 50, "stdev": 15}, "FIN": {"mean": 50, "stdev": 15}, "LSH": {"mean": 50, "stdev": 15},
    "CRS": {"mean": 50, "stdev": 15}, "WFT": {"mean": 50, "stdev": 15}, "OPS": {"mean": 50, "stdev": 15},
    "DPS": {"mean": 50, "stdev": 15}, "VIS": {"mean": 50, "stdev": 15}, "PRS": {"mean": 50, "stdev": 15},
    "WRK": {"mean": 50, "stdev": 15}, "TKL": {"mean": 50, "stdev": 15}, "AER": {"mean": 50, "stdev": 15},
    "ANT": {"mean": 50, "stdev": 15}, "CMP": {"mean": 50, "stdev": 15}, "AGG": {"mean": 50, "stdev": 15},
    "LDR": {"mean": 50, "stdev": 15},
    "GK-REF": {"mean": 50, "stdev": 15}, "GK-POS": {"mean": 50, "stdev": 15}, "GK-DIS": {"mean": 50, "stdev": 15},
    "GK-SWP": {"mean": 50, "stdev": 15}, "GK-CMD": {"mean": 50, "stdev": 15}
  }'::jsonb,
  5,
  0.7,
  3
)
on conflict (versi) do nothing;

create table if not exists public.players (
  -- id = auth.uid(), bukan id independen — satu baris per akun.
  id uuid primary key references auth.users (id) on delete cascade,
  -- Diturunkan dari sesi OAuth/email saat migrasi pertama (Fase 1 tidak
  -- mengumpulkan nama secara terpisah). Lihat migrate-local-profile.ts.
  nama text not null,
  tinggi_cm smallint not null,
  berat_kg smallint not null,
  usia smallint not null,
  kaki_dominan text not null check (kaki_dominan in ('kiri', 'kanan', 'keduanya')),
  bersedia_kiper boolean not null default false,
  -- Nomor telepon sengaja tidak disimpan: provider MVP adalah Google/email,
  -- bukan OTP SMS (deviasi dari FR-01 literal, lihat komentar di
  -- features/auth/components/LoginForm.tsx).
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.players enable row level security;

create policy "players select own row"
  on public.players for select
  to authenticated
  using (id = auth.uid());

create policy "players insert own row"
  on public.players for insert
  to authenticated
  with check (id = auth.uid());

create policy "players update own row"
  on public.players for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create table if not exists public.attribute_profiles (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.players (id) on delete cascade,
  dibuat_pada timestamptz not null default now(),
  -- 25 nilai atribut (30 kalau bersedia kiper) sebagai jsonb, bukan satu
  -- kolom per atribut: daftar atribut sudah berubah sekali di Fase 1 (kiper
  -- ditambahkan) dan skema kolom-per-atribut berarti migrasi setiap kali itu
  -- terjadi lagi. Bentuk: {"PAC": 58.2, "FIN": 38.0, ...} — sama seperti
  -- AttributeVector di src/features/scoring/types.ts.
  atribut jsonb not null,
  confidence numeric(4, 3) not null,
  versi_konfigurasi text not null references public.scoring_configs (versi),
  -- Posisi biasa saat versi ini dibuat, dipakai saat menghitung ulang posisi
  -- utama historis di layar riwayat (tie-breaker Tahap 6 butuh nilai ini).
  posisi_biasa text
);

alter table public.attribute_profiles enable row level security;

create policy "attribute_profiles select own"
  on public.attribute_profiles for select
  to authenticated
  using (player_id = auth.uid());

create policy "attribute_profiles insert own"
  on public.attribute_profiles for insert
  to authenticated
  with check (player_id = auth.uid());

create index if not exists attribute_profiles_player_id_dibuat_pada_idx
  on public.attribute_profiles (player_id, dibuat_pada desc);

create table if not exists public.role_scores (
  profile_id uuid not null references public.attribute_profiles (id) on delete cascade,
  role_code text not null,
  base numeric(5, 2) not null,
  gate numeric(4, 3) not null,
  fit numeric(5, 2) not null,
  primary key (profile_id, role_code)
);

alter table public.role_scores enable row level security;

-- role_scores tidak punya player_id langsung; kepemilikan diperiksa lewat
-- attribute_profiles yang menjadi induknya.
create policy "role_scores select own"
  on public.role_scores for select
  to authenticated
  using (
    exists (
      select 1 from public.attribute_profiles p
      where p.id = role_scores.profile_id and p.player_id = auth.uid()
    )
  );

create policy "role_scores insert own"
  on public.role_scores for insert
  to authenticated
  with check (
    exists (
      select 1 from public.attribute_profiles p
      where p.id = role_scores.profile_id and p.player_id = auth.uid()
    )
  );
