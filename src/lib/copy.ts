/** UI copy helpers: avoid em-dash placeholders in the interface */

export const EMPTY = 'Not set'
export const SEP = ' · '

export function joinParts(...parts: (string | null | undefined)[]): string {
  return parts.filter(Boolean).join(SEP)
}

export function titlePhase(name: string, sub: string): string {
  return `${name}: ${sub}`
}
