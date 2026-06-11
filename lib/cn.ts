/**
 * Tiny classnames joiner — avoids a clsx/tailwind-merge dependency for the
 * scaffold. Falsy values are dropped.
 */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
