import { Controller, useForm } from 'react-hook-form';
import { Slider } from '../../../components/ui/Slider';
import { ChoiceCard } from '../../../components/ui/ChoiceCard';
import { Button } from '../../../components/ui/Button';
import { createZodResolver, physicalProfileSchema, type PhysicalProfileFormValues } from '../schema';

interface PhysicalProfileFormProps {
  defaultValues?: Partial<PhysicalProfileFormValues>;
  onSubmit: (values: PhysicalProfileFormValues) => void;
}

const DOMINANT_FOOT_OPTIONS: { value: PhysicalProfileFormValues['dominantFoot']; label: string }[] = [
  { value: 'kanan', label: 'Kanan' },
  { value: 'kiri', label: 'Kiri' },
  { value: 'keduanya', label: 'Keduanya' },
];

export function PhysicalProfileForm({ defaultValues, onSubmit }: PhysicalProfileFormProps) {
  const { control, handleSubmit, formState } = useForm<PhysicalProfileFormValues>({
    resolver: createZodResolver(physicalProfileSchema),
    defaultValues: {
      heightCm: defaultValues?.heightCm ?? 170,
      weightKg: defaultValues?.weightKg ?? 65,
      age: defaultValues?.age ?? 25,
      dominantFoot: defaultValues?.dominantFoot ?? 'kanan',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">
      <Controller
        control={control}
        name="heightCm"
        render={({ field }) => (
          <Slider id="heightCm" label="Tinggi badan" unit="cm" min={100} max={230} value={field.value} onChange={field.onChange} />
        )}
      />
      <Controller
        control={control}
        name="weightKg"
        render={({ field }) => (
          <Slider id="weightKg" label="Berat badan" unit="kg" min={30} max={150} value={field.value} onChange={field.onChange} />
        )}
      />
      <Controller
        control={control}
        name="age"
        render={({ field }) => (
          <Slider id="age" label="Usia" unit="tahun" min={10} max={70} value={field.value} onChange={field.onChange} />
        )}
      />

      <Controller
        control={control}
        name="dominantFoot"
        render={({ field }) => (
          <fieldset className="flex flex-col gap-2">
            <legend className="text-sm font-medium text-neutral-700">Kaki dominan</legend>
            <div className="grid grid-cols-3 gap-2">
              {DOMINANT_FOOT_OPTIONS.map((option) => (
                <ChoiceCard key={option.value} selected={field.value === option.value} onSelect={() => field.onChange(option.value)}>
                  {option.label}
                </ChoiceCard>
              ))}
            </div>
          </fieldset>
        )}
      />

      <Button type="submit" disabled={formState.isSubmitting} className="w-full">
        Lanjut
      </Button>
    </form>
  );
}
