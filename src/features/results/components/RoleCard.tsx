import { Card } from '../../../components/ui/Card';
import { ROLE_METADATA, type RoleScore } from '../../scoring';

interface RoleCardProps {
  roleScore: RoleScore;
}

export function RoleCard({ roleScore }: RoleCardProps) {
  const metadata = ROLE_METADATA[roleScore.role];

  return (
    <Card>
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="text-base font-semibold text-neutral-900">{metadata.name}</h3>
        <span className="text-lg font-semibold text-primary-700">{Math.round(roleScore.fit)}</span>
      </div>
      <p className="mt-1 text-sm text-neutral-600">{metadata.description}</p>
    </Card>
  );
}
