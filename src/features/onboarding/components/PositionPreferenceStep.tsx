import { useState } from 'react';
import { PitchTap } from './PitchTap';
import { ChoiceCard } from '../../../components/ui/ChoiceCard';
import { Button } from '../../../components/ui/Button';
import type { PositionPreferenceValues } from '../schema';

interface PositionPreferenceStepProps {
  defaultValues?: Partial<PositionPreferenceValues>;
  onSubmit: (values: PositionPreferenceValues) => void;
  onBack: () => void;
}

export function PositionPreferenceStep({ defaultValues, onSubmit, onBack }: PositionPreferenceStepProps) {
  const [usualPosition, setUsualPosition] = useState<PositionPreferenceValues['usualPosition']>(
    defaultValues?.usualPosition ?? null,
  );
  const [belumTahu, setBelumTahu] = useState(defaultValues?.usualPosition === null);
  const [willingGoalkeeper, setWillingGoalkeeper] = useState(defaultValues?.willingGoalkeeper ?? false);

  function handlePitchSelect(position: PositionPreferenceValues['usualPosition']) {
    setUsualPosition(position);
    setBelumTahu(false);
  }

  function handleBelumTahu() {
    setUsualPosition(null);
    setBelumTahu(true);
  }

  function handleSubmit() {
    onSubmit({ usualPosition, willingGoalkeeper });
  }

  const canSubmit = belumTahu || usualPosition !== null;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="mb-2 text-lg font-semibold text-neutral-900">Posisi yang biasa Anda mainkan</h2>
        <PitchTap selected={usualPosition} onSelect={handlePitchSelect} />
        <div className="mt-3">
          <ChoiceCard selected={belumTahu} onSelect={handleBelumTahu}>
            Belum tahu / tidak tetap
          </ChoiceCard>
        </div>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium text-neutral-700">Bersedia bermain sebagai kiper?</legend>
        <div className="grid grid-cols-2 gap-2">
          <ChoiceCard selected={willingGoalkeeper} onSelect={() => setWillingGoalkeeper(true)}>
            Ya, bersedia
          </ChoiceCard>
          <ChoiceCard selected={!willingGoalkeeper} onSelect={() => setWillingGoalkeeper(false)}>
            Tidak
          </ChoiceCard>
        </div>
      </fieldset>

      <div className="flex gap-3">
        <Button variant="secondary" onClick={onBack} className="flex-1">
          Kembali
        </Button>
        <Button onClick={handleSubmit} disabled={!canSubmit} className="flex-1">
          Mulai Kuesioner
        </Button>
      </div>
    </div>
  );
}
