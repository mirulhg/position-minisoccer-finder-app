-- NFR Observabilitas — "Pelacakan funnel: setiap langkah onboarding dan
-- kuesioner terinstrumentasi". Dicatat lewat fetch() langsung dari klien
-- (src/lib/analytics.ts), bukan @supabase/supabase-js, supaya tidak menarik
-- SDK penuh ke bundle awal.

create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  -- Dibuat sekali per perangkat di localStorage (bukan per akun) — funnel
  -- onboarding/kuesioner terjadi sebelum login.
  anonymous_id text not null,
  player_id uuid null references public.players (id) on delete set null,
  event_name text not null,
  event_data jsonb null,
  created_at timestamptz not null default now()
);

alter table public.analytics_events enable row level security;

-- Sengaja mengizinkan insert dari pengunjung anonim: sebagian besar funnel
-- (onboarding, kuesioner) terjadi sebelum ada sesi login. Tidak ada policy
-- SELECT sama sekali untuk anon/authenticated — data funnel hanya bisa
-- dibaca lewat Supabase Studio (owner/postgres, otomatis melewati RLS).
create policy "analytics_events insert anon"
  on public.analytics_events for insert
  to anon
  with check (true);

create policy "analytics_events insert authenticated"
  on public.analytics_events for insert
  to authenticated
  with check (true);

create index if not exists analytics_events_event_name_created_at_idx
  on public.analytics_events (event_name, created_at desc);
