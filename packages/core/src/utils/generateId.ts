import { nanoid } from 'nanoid';

export function generateId(size: number): string {
  return nanoid(size);
}
