-- Fase 4 — FR-20 (wajib): pemain bisa menghapus seluruh datanya.
--
-- players.id sudah `references auth.users(id) on delete cascade`, dan
-- attribute_profiles/matches sudah cascade dari players (`on delete
-- cascade`), role_scores cascade dari attribute_profiles. Jadi satu
-- `DELETE FROM players WHERE id = auth.uid()` otomatis membersihkan SEMUA
-- data profil lewat cascade yang sudah ada di 0001/0003 — tidak perlu
-- policy DELETE terpisah untuk attribute_profiles/role_scores/matches.
--
-- Sengaja TIDAK menghapus baris auth.users — itu butuh service_role key,
-- tidak aman dipanggil dari klien. Keputusan produk: "Hapus Data" menghapus
-- seluruh data profil, akun login (email/Google) tetap ada; kalau pemain
-- login lagi setelahnya, dianggap pemain baru dan onboarding dari nol.
create policy "players delete own row"
  on public.players for delete
  to authenticated
  using (id = auth.uid());
