import type { AttributeCode, AttributeVector } from '../types';

/** Atribut terisi, terurut menurun berdasarkan nilai. */
export function rankAttributesDescending(attributes: AttributeVector): [AttributeCode, number][] {
  return (Object.entries(attributes) as [AttributeCode, number][]).sort((a, b) => b[1] - a[1]);
}
