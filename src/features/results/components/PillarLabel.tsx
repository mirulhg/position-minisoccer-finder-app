import { useLocalizedPillarLabel } from '../../../i18n';
import type { Pillar } from '../../scoring';

/** Label pilar terlokalisasi — komponen kecil supaya hook bisa dipanggil di dalam `.map()`. */
export function PillarLabel({ pillar }: { pillar: Pillar }) {
  return <>{useLocalizedPillarLabel(pillar)}</>;
}
