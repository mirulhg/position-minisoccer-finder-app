import { ROLE_METADATA, type RoleCode } from '../../features/scoring';
import { AreaBadge } from './PositionBadge';

interface RoleBadgeProps {
  role: RoleCode;
}

export function RoleBadge({ role }: RoleBadgeProps) {
  const metadata = ROLE_METADATA[role];

  return (
    <AreaBadge position={metadata.position}>
      [{role.split('-')[1]}] {metadata.name}
    </AreaBadge>
  );
}
