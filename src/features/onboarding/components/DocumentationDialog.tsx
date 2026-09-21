import { useEffect, useId, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  CHEVRON_TRANSITION,
  COLLAPSIBLE_HIDDEN,
  COLLAPSIBLE_TRANSITION,
  COLLAPSIBLE_VISIBLE,
} from '../../../components/ui/collapsible-motion';
import { DIALOG_HIDDEN, DIALOG_TRANSITION, DIALOG_VISIBLE } from '../../../components/ui/dialog-motion';

interface DocumentationDialogProps {
  open: boolean;
  onClose: () => void;
}

interface Section {
  title: string;
  body: string;
}

/**
 * Copy diverifikasi terhadap istilah yang benar-benar dipakai di kode saat
 * ditulis (September 2026) — dua penyesuaian dari draft awal: "Tes Ulang"
 * diganti "Mulai ulang dari awal" (satu-satunya tombol yang sebenarnya ada
 * untuk mengulang kuesioner — `retakeQuestionnaire` di kode adalah fungsi
 * internal, bukan nama tombol/fitur yang ditampilkan ke pemain), dan "Catat
 * Pertandingan" disamakan huruf kecilnya jadi "Catat pertandingan" persis
 * seperti judul layar & tombolnya.
 */
const SECTIONS: Section[] = [
  {
    title: 'Cara menjawab tiap tipe pertanyaan',
    body: 'Ada 3 jenis pertanyaan di kuesioner ini. Pertanyaan skala biasa: pilih salah satu opsi yang paling menggambarkan dirimu. Pertanyaan pilihan dua sisi (trade-off): kamu diminta memilih salah satu dari dua kecenderungan yang berlawanan — kalau benar-benar tidak condong ke salah satu, pilih "Tergantung situasi", jawaban ini dihitung netral untuk kedua sisi, bukan condong ke salah satu. Pertanyaan angka: pakai tombol + dan − untuk mengisi jumlah. Jawabanmu tersimpan otomatis setiap kali pindah halaman, jadi aman kalau aplikasi ditutup di tengah jalan — nanti bisa lanjut dari terakhir berhenti. Kalau mau mulai dari nol, ada tombol "Mulai ulang dari awal" di kuesioner dan layar Hasil.',
  },
  {
    title: 'Apa itu skor 5 pilar (Fisik, Teknik, Taktik, Duel, Mental)',
    body: 'Jawabanmu diolah jadi skor di 5 pilar kemampuan: Fisik, Teknik, Taktik, Duel, dan Mental. Kelima skor ini dipakai untuk menghitung posisi & role yang paling cocok denganmu, ditampilkan di layar Hasil lewat grafik radar dan rincian per pilar.',
  },
  {
    title: 'Apa arti label kepercayaan di hasil',
    body: 'Setiap rekomendasi disertai label tingkat kepercayaan, menunjukkan seberapa banyak data yang mendukung hasil itu. Di awal, sebelum kamu mencatat pertandingan apa pun, labelnya selalu "Awal" karena hasil murni dari jawaban kuesioner. Setelah memakai fitur "Catat pertandingan" beberapa kali, tingkat kepercayaan ini bisa naik karena hasil mulai memperhitungkan performa nyatamu di lapangan, bukan cuma jawaban kuesioner.',
  },
  {
    title: 'Seberapa akurat hasil ini?',
    body: 'Aplikasi ini masih tahap awal. Bobot & norma yang dipakai untuk menghitung skor saat ini masih nilai awal, belum melalui proses kalibrasi ilmiah penuh. Anggap hasilnya sebagai estimasi arah awal untuk mengenali kecenderungan main, bukan penilaian final atau tersertifikasi. Semakin sering kamu memakai aplikasi ini, semakin akurat hasil yang kamu dapat.',
  },
  {
    title: 'Posisi utama, posisi alternatif, dan mengulang kuesioner',
    body: 'Layar Hasil menampilkan posisi utama (paling cocok) dan posisi alternatif (kandidat lain yang juga cukup cocok) beserta role spesifik di posisi itu. Kamu bisa mengisi ulang kuesioner kapan saja lewat tombol "Mulai ulang dari awal" — hasil lama tetap tersimpan di riwayat, jadi kamu bisa membandingkan perkembanganmu dari waktu ke waktu.',
  },
  {
    title: 'Data & privasi',
    body: 'Semua data yang kamu isi tersimpan di perangkatmu (dan di akun kalau kamu memilih login). Kamu bisa mengunduh atau menghapus seluruh datamu sendiri kapan saja — tidak ada data yang dibagikan ke pemain lain atau ditampilkan secara publik.',
  },
];

function DocSection({ title, body }: Section) {
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const sectionId = useId();

  return (
    <div>
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        aria-expanded={isExpanded}
        aria-controls={sectionId}
        className="flex min-h-touch w-full items-center justify-between gap-2 py-3 text-left text-sm font-medium text-neutral-700"
      >
        {title}
        <motion.span
          animate={{ rotate: isExpanded ? 90 : 0 }}
          transition={CHEVRON_TRANSITION}
          aria-hidden="true"
          className="shrink-0 text-neutral-400"
        >
          ▸
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            id={sectionId}
            style={{ overflow: 'hidden' }}
            initial={shouldReduceMotion ? false : COLLAPSIBLE_HIDDEN}
            animate={COLLAPSIBLE_VISIBLE}
            exit={shouldReduceMotion ? undefined : COLLAPSIBLE_HIDDEN}
            transition={COLLAPSIBLE_TRANSITION}
          >
            <p className="pb-3 text-sm leading-relaxed text-neutral-600">{body}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Dialog dokumentasi — proyek ini BELUM punya komponen modal/overlay bersama
 * (`dialog-motion.ts` cuma nilai transisi untuk pola "confirm inline" tanpa
 * backdrop/`position: fixed`, dipakai inline di RestartButton/AccountScreen/
 * SaveResultSection, bukan komponen `<Dialog>` yang bisa dipakai ulang).
 * Overlay/backdrop + focus management di bawah ini karena itu ditulis dari
 * nol untuk dialog ini — TAPI animasi panelnya memakai ulang persis
 * `DIALOG_HIDDEN`/`DIALOG_VISIBLE`/`DIALOG_TRANSITION` yang sudah ada
 * (fade+scale+geser, gaya sama seperti dialog lain di app ini), dan tiap
 * accordion di dalamnya memakai ulang persis pola `collapsible-motion.ts`
 * dari RoleCard/AllRolesList — tidak ada animasi baru yang ditulis di sini.
 */
export function DocumentationDialog({ open, onClose }: DocumentationDialogProps) {
  const shouldReduceMotion = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    panelRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-dialog flex items-center justify-center bg-neutral-900/40 p-4"
          initial={shouldReduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={shouldReduceMotion ? undefined : { opacity: 0 }}
          transition={DIALOG_TRANSITION}
          onClick={onClose}
        >
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            onClick={(event) => event.stopPropagation()}
            className="flex max-h-[80vh] w-full max-w-md flex-col rounded-md bg-white p-5 outline-none"
            initial={shouldReduceMotion ? false : DIALOG_HIDDEN}
            animate={DIALOG_VISIBLE}
            exit={shouldReduceMotion ? undefined : DIALOG_HIDDEN}
            transition={DIALOG_TRANSITION}
          >
            <div className="flex items-center justify-between gap-2">
              <h2 id={titleId} className="text-lg font-semibold text-neutral-900">
                Panduan &amp; Dokumentasi
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Tutup"
                className="min-h-touch min-w-touch flex items-center justify-center rounded-md text-xl text-neutral-400 hover:text-neutral-600"
              >
                ×
              </button>
            </div>
            <div className="mt-2 flex-1 divide-y divide-neutral-100 overflow-y-auto">
              {SECTIONS.map((section) => (
                <DocSection key={section.title} title={section.title} body={section.body} />
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
