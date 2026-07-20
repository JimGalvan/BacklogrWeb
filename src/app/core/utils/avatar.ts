/** Shared avatar/identity helpers (previously private to workspaces-page). */

export function initialsOf(name: string | null, email: string): string {
  if (!name) {
    const local = email.split('@')[0];
    const parts = local.split(/[._-]/);
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : local.slice(0, 2).toUpperCase();
  }
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

function hashOf(value: string): number {
  let h = 0;
  for (const c of value) h = ((h * 31) + c.charCodeAt(0)) | 0;
  return Math.abs(h);
}

/** Deterministic glyph color class for a workspace name. */
export function glyphOf(name: string): string {
  return ['g0', 'g1', 'g2', 'g3', 'g4', 'g5'][hashOf(name) % 6];
}

/** Deterministic avatar color class for a user id. */
export function avOf(id: string): string {
  return ['a', 'b', 'c', 'd', 'e', 'f'][hashOf(id) % 6];
}
