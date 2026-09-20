import { Card } from '../../../components/ui/Card';
import { PILLARS, type Pillar } from '../../scoring';
import { PILLAR_ICON_PATHS } from '../config/pillar-icons';

interface PillarBreakdownProps {
  values: Record<Pillar, number>;
}

export function PillarBreakdown({ values }: PillarBreakdownProps) {
  return (
    <Card>
      <h3 className="text-base font-semibold text-neutral-900">Rincian pilar</h3>
      <ul className="mt-3 flex flex-col gap-3">
        {PILLARS.map((pillar) => (
          <li key={pillar} className="flex justify-between text-sm text-neutral-700">
            <span className="flex items-center gap-2">
              <img src={PILLAR_ICON_PATHS[pillar]} alt={pillar} className="h-6 w-6" />
              {pillar}
            </span>
            <span className="font-medium">{Math.round(values[pillar])}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
