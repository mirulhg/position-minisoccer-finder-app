import { useLocalizedAttributeLabel } from '../../../i18n';
import type { AttributeCode } from '../../scoring';

/** Label atribut terlokalisasi — komponen kecil supaya hook `useLocalizedAttributeLabel` bisa dipanggil di dalam `.map()`. */
export function AttributeLabel({ code }: { code: AttributeCode }) {
  return <>{useLocalizedAttributeLabel(code)}</>;
}
