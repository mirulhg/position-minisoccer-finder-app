import { useState, type FormEvent } from 'react';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { useTranslation } from '../../../i18n';
import { parseJerseyNumber } from '../lib/parse-jersey-number';

const NAME_MAX_LENGTH = 30;

interface ShareCardFormProps {
  onSkip: () => void;
  onSubmit: (personalization: { name: string; jerseyNumber: number | undefined }) => void;
}

/** State sengaja lokal dan hilang saat form ditutup — tidak disimpan ke mana pun, tiap "Bagikan kartu profil" bertanya dari nol. */
export function ShareCardForm({ onSkip, onSubmit }: ShareCardFormProps) {
  const { t } = useTranslation();
  const form = t.results.profileCard.shareForm;
  const [name, setName] = useState('');
  const [jerseyNumberInput, setJerseyNumberInput] = useState('');
  const [hasJerseyError, setHasJerseyError] = useState(false);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const parsed = parseJerseyNumber(jerseyNumberInput);
    if (!parsed.isValid) {
      setHasJerseyError(true);
      return;
    }
    onSubmit({ name: name.trim(), jerseyNumber: parsed.value });
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3">
        <div>
          <p className="text-sm font-medium text-neutral-900">{form.title}</p>
          <p className="text-sm text-neutral-600">{form.subtitle}</p>
        </div>
        <Input
          id="share-card-name"
          label={form.nameLabel}
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder={form.namePlaceholder}
          maxLength={NAME_MAX_LENGTH}
          autoComplete="off"
        />
        <div className="flex flex-col gap-1">
          <Input
            id="share-card-jersey"
            label={form.jerseyNumberLabel}
            value={jerseyNumberInput}
            onChange={(event) => {
              setJerseyNumberInput(event.target.value);
              setHasJerseyError(false);
            }}
            inputMode="numeric"
            maxLength={3}
            autoComplete="off"
            aria-invalid={hasJerseyError}
            errorId={hasJerseyError ? 'share-card-jersey-error' : 'share-card-jersey-hint'}
          />
          {hasJerseyError ? (
            <p id="share-card-jersey-error" role="alert" className="text-sm text-danger-600">
              {form.jerseyNumberInvalid}
            </p>
          ) : (
            <p id="share-card-jersey-hint" className="text-xs text-neutral-500">
              {form.jerseyNumberHint}
            </p>
          )}
        </div>
        <div className="flex gap-3">
          <Button type="button" variant="ghost" onClick={onSkip} className="flex-1">
            {form.skip}
          </Button>
          <Button type="submit" variant="secondary" className="flex-1">
            {form.share}
          </Button>
        </div>
      </form>
    </Card>
  );
}
