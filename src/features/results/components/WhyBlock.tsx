import { Card } from '../../../components/ui/Card';
import { ATTRIBUTE_LABELS, type AttributeVector } from '../../scoring';
import { rankAttributesDescending } from '../lib/attribute-ranking';

interface WhyBlockProps {
  attributes: AttributeVector;
}

export function WhyBlock({ attributes }: WhyBlockProps) {
  const entries = rankAttributesDescending(attributes);
  const strongest = entries.slice(0, 3);
  const weakest = entries.slice(-2).reverse();

  return (
    <Card>
      <h3 className="text-base font-semibold text-neutral-900">Kenapa rekomendasi ini?</h3>
      <div className="mt-3 flex flex-col gap-3">
        <div>
          <p className="text-sm font-medium text-primary-700">Kekuatan utama</p>
          <ul className="mt-1 flex flex-col gap-1">
            {strongest.map(([attribute, value]) => (
              <li key={attribute} className="flex justify-between text-sm text-neutral-700">
                <span>{ATTRIBUTE_LABELS[attribute]}</span>
                <span className="font-medium">{Math.round(value)}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-sm font-medium text-danger-600">Perlu diperhatikan</p>
          <ul className="mt-1 flex flex-col gap-1">
            {weakest.map(([attribute, value]) => (
              <li key={attribute} className="flex justify-between text-sm text-neutral-700">
                <span>{ATTRIBUTE_LABELS[attribute]}</span>
                <span className="font-medium">{Math.round(value)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
}
