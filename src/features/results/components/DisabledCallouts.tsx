import { Button } from '../../../components/ui/Button';

/**
 * Bagikan kartu profil dan input pertandingan adalah Fase 2/3 (Lampiran
 * C.5). Ditampilkan nonaktif di sini sesuai cakupan Fase 1, bukan
 * diimplementasikan fungsinya.
 */
export function DisabledCallouts() {
  return (
    <div className="flex flex-col gap-2">
      <Button variant="secondary" disabled className="w-full" title="Segera hadir">
        Bagikan kartu profil — segera hadir
      </Button>
      <Button variant="secondary" disabled className="w-full" title="Segera hadir">
        Catat pertandingan pertama — segera hadir
      </Button>
    </div>
  );
}
