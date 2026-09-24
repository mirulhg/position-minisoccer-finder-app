import { useReducedMotion } from 'motion/react';
import { Card } from '../../../components/ui/Card';

interface HistorySkeletonProps {
  count?: number;
  /** Label untuk screen reader — teks status yang terlihat sebelumnya. */
  label?: string;
}

/**
 * Placeholder daftar riwayat selama query Supabase berjalan. Tiap blok
 * dibungkus baris setinggi line-height teks aslinya (xs 16px, lg 28px,
 * sm 20px, chip badge posisi 24px) di dalam Card + garis waktu yang sama,
 * supaya pergantian ke daftar asli tidak meloncat ukurannya.
 */
export function HistorySkeleton({ count = 3, label = 'Memuat riwayat…' }: HistorySkeletonProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div role="status">
      <span className="sr-only">{label}</span>
      <ol
        aria-hidden="true"
        className={`flex flex-col gap-3 border-l-2 border-neutral-200 pl-4 ${shouldReduceMotion ? '' : 'animate-pulse'}`}
      >
        {Array.from({ length: count }, (_, index) => (
          <li key={index} className="relative">
            <span className="absolute -left-5.25 top-1.5 h-3 w-3 rounded-full bg-neutral-200" />
            <Card>
              <div className="flex h-4 items-center">
                <div className="h-3 w-28 rounded-xs bg-neutral-200" />
              </div>
              <div className="mt-1 flex h-7 items-center">
                <div className="h-5 w-40 rounded-xs bg-neutral-200" />
              </div>
              <div className="flex h-5 items-center">
                <div className="h-3.5 w-16 rounded-xs bg-neutral-200" />
              </div>
              <div className="mt-2 h-6 w-56 max-w-full rounded-full bg-neutral-200" />
              {index < count - 1 && (
                <div className="mt-1 flex h-4 items-center">
                  <div className="h-3 w-52 rounded-xs bg-neutral-200" />
                </div>
              )}
            </Card>
          </li>
        ))}
      </ol>
    </div>
  );
}
