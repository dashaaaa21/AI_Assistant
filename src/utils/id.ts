/** Creates a random unique id, e.g. "lq3k9x2a7fh1". */
export function createId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
