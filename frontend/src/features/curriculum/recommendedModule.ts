// Turns "the module that addresses this gap" into "the module the learner can open now".
// Kept free of imports so it can be unit-tested directly with node --test.

export interface ModuleRef {
  id: string;
  prerequisites: string[];
}

export interface ResolvedRecommendation {
  /** The module to send the learner to: unlocked, or already completed (revisit). */
  moduleId: string;
  /** The module that actually addresses the gap. */
  targetId: string;
  /** True when the target is locked and moduleId is the first prerequisite to do instead. */
  redirected: boolean;
}

/**
 * If `targetId` is open (all prerequisites completed, or the module itself is completed), return it.
 * Otherwise return the first module on its prerequisite chain that is open and not completed, in prerequisite order.
 * Returns null when the target is unknown or no open module can be found (for example a prerequisite id that does not exist),
 * so the caller can fall back to the plain curriculum order instead of linking to something locked.
 */
export function resolveRecommendedModule(
  modules: ModuleRef[],
  targetId: string,
  completed: readonly string[],
): ResolvedRecommendation | null {
  const byId = new Map(modules.map((m) => [m.id, m]));
  if (!byId.has(targetId)) return null;
  const done = new Set(completed);

  const firstOpen = (id: string, visiting: Set<string>): string | null => {
    const mod = byId.get(id);
    if (!mod || done.has(id) || visiting.has(id)) return null;
    visiting.add(id);
    const unmet = mod.prerequisites.filter((p) => !done.has(p));
    if (unmet.length === 0) return id;
    for (const p of unmet) {
      const found = firstOpen(p, visiting);
      if (found) return found;
    }
    return null;
  };

  if (done.has(targetId)) return { moduleId: targetId, targetId, redirected: false };
  const open = firstOpen(targetId, new Set());
  if (!open) return null;
  return { moduleId: open, targetId, redirected: open !== targetId };
}
