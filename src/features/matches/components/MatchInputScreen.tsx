import { useState } from 'react';
import { useAuthSession } from '../../auth';
import { BallSpinner } from '../../../components/ui/BallSpinner';
import { Button } from '../../../components/ui/Button';
import { ChoiceCard } from '../../../components/ui/ChoiceCard';
import { NumberStepper } from '../../../components/ui/NumberStepper';
import { POSITION_NAMES, type PositionCode } from '../../scoring';
import { matchInputSchema, EMPTY_MATCH_INPUT, type MatchInputValues } from '../schema';
import { submitMatch } from '../lib/submit-match';

interface MatchInputScreenProps {
  onDone: () => void;
  onBack: () => void;
}

type Step = 'required' | 'optional' | 'queued-offline';

const POSITION_OPTIONS: PositionCode[] = ['GK', 'CB', 'FB', 'DM', 'CM', 'WM', 'ST'];

/**
 * FR-14 (Layar 4 PRD) — dua field wajib (menit, posisi) sebagai dua tap
 * pertama, lalu grid stepper untuk field opsional yang boleh dilewati,
 * target selesai ≤60 detik.
 */
export function MatchInputScreen({ onDone, onBack }: MatchInputScreenProps) {
  const { session, isLoading: isSessionLoading } = useAuthSession();
  const [step, setStep] = useState<Step>('required');
  const [values, setValues] = useState<MatchInputValues>(EMPTY_MATCH_INPUT);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof MatchInputValues>(key: K, value: MatchInputValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit() {
    if (!session) return;
    const parsed = matchInputSchema.safeParse(values);
    if (!parsed.success) {
      setError('Ada isian yang tidak valid — cek lagi menit bermain dan posisi.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const result = await submitMatch(session.user.id, parsed.data);
      if (result.queuedOffline) {
        setStep('queued-offline');
      } else {
        onDone();
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Gagal menyimpan pertandingan.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isSessionLoading) {
    return <p className="p-8 text-center text-neutral-500">Memuat…</p>;
  }

  if (!session) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 py-8">
        <Button variant="ghost" onClick={onBack} className="self-start">
          Kembali
        </Button>
        <p className="text-neutral-500">Masuk dan simpan hasil dulu untuk mencatat pertandingan.</p>
      </div>
    );
  }

  if (step === 'queued-offline') {
    return (
      <div className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 py-8">
        <p className="text-neutral-700">
          Kamu sedang offline — pertandingan tersimpan di perangkat ini dan akan disinkronkan otomatis begitu koneksi
          kembali.
        </p>
        <Button onClick={onDone} className="w-full">
          Kembali ke hasil
        </Button>
      </div>
    );
  }

  if (step === 'required') {
    return (
      <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-8">
        <Button variant="ghost" onClick={onBack} className="self-start">
          Kembali
        </Button>
        <h1 className="text-2xl font-semibold text-neutral-900">Catat pertandingan</h1>

        <NumberStepper
          label="Menit bermain"
          value={values.menitBermain}
          min={1}
          max={90}
          onChange={(value) => update('menitBermain', value)}
        />

        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-medium text-neutral-700">Posisi yang dimainkan</legend>
          <div className="grid grid-cols-2 gap-2">
            {POSITION_OPTIONS.map((position) => (
              <ChoiceCard
                key={position}
                selected={values.posisiDimainkan === position}
                onSelect={() => update('posisiDimainkan', position)}
              >
                {POSITION_NAMES[position]}
              </ChoiceCard>
            ))}
          </div>
        </fieldset>

        <Button onClick={() => setStep('optional')} className="w-full">
          Lanjut
        </Button>
      </div>
    );
  }

  const isGoalkeeper = values.posisiDimainkan === 'GK';

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-8">
      <Button variant="ghost" onClick={() => setStep('required')} className="self-start">
        Kembali
      </Button>
      <h1 className="text-xl font-semibold text-neutral-900">Statistik tambahan (boleh dilewati)</h1>

      <div className="grid grid-cols-2 gap-6">
        <NumberStepper label="Gol" value={values.gol ?? 0} onChange={(value) => update('gol', value)} />
        <NumberStepper label="Assist" value={values.assist ?? 0} onChange={(value) => update('assist', value)} />
        <NumberStepper
          label="Peluang diciptakan"
          value={values.peluangDiciptakan ?? 0}
          onChange={(value) => update('peluangDiciptakan', value)}
        />
        <NumberStepper
          label="Tekel berhasil"
          value={values.tekelBerhasil ?? 0}
          onChange={(value) => update('tekelBerhasil', value)}
        />
        <NumberStepper label="Intersep" value={values.intersep ?? 0} onChange={(value) => update('intersep', value)} />
        <NumberStepper
          label="Duel udara menang"
          value={values.duelUdaraMenang ?? 0}
          onChange={(value) => update('duelUdaraMenang', value)}
        />
        <NumberStepper
          label="Kehilangan bola"
          value={values.kehilanganBola ?? 0}
          onChange={(value) => update('kehilanganBola', value)}
        />
        <NumberStepper
          label="Pelanggaran"
          value={values.pelanggaran ?? 0}
          onChange={(value) => update('pelanggaran', value)}
        />
      </div>

      {isGoalkeeper && (
        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-medium text-neutral-700">Clean sheet?</legend>
          <div className="grid grid-cols-2 gap-2">
            <ChoiceCard selected={values.cleanSheet === true} onSelect={() => update('cleanSheet', true)}>
              Ya
            </ChoiceCard>
            <ChoiceCard selected={values.cleanSheet === false} onSelect={() => update('cleanSheet', false)}>
              Tidak
            </ChoiceCard>
          </div>
        </fieldset>
      )}

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium text-neutral-700">Penilaian diri (opsional)</legend>
        <div className="grid grid-cols-5 gap-2">
          {[1, 2, 3, 4, 5].map((score) => (
            <ChoiceCard key={score} selected={values.penilaianDiri === score} onSelect={() => update('penilaianDiri', score)}>
              {score}
            </ChoiceCard>
          ))}
        </div>
      </fieldset>

      {error && (
        <p role="alert" className="text-sm text-danger-600">
          {error}
        </p>
      )}

      <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full">
        {isSubmitting && <BallSpinner />}
        {isSubmitting ? 'Menyimpan…' : 'Selesai'}
      </Button>
    </div>
  );
}
