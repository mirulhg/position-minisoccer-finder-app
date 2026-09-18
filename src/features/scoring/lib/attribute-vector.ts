import type { AttributeVector } from '../types';

/** `AttributeVector` (Partial, bisa punya `undefined`) → objek polos untuk disimpan sebagai jsonb. */
export function toPlainAttributeMap(attributes: AttributeVector): Record<string, number> {
  const plain: Record<string, number> = {};
  for (const [attribute, value] of Object.entries(attributes)) {
    if (value !== undefined) plain[attribute] = value;
  }
  return plain;
}
