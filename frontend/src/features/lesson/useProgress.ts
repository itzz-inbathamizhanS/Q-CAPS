import { useCallback, useEffect, useState } from 'react';
import { fetchProgress } from './lessonApi';

/** Server-side section progress for a module. Failures leave progress "unknown" rather
 *  than blocking the lesson: progress is informational, content stays readable. */
export function useProgress(slug: string) {
  const [completed, setCompleted] = useState<Set<number> | null>(null);

  const refresh = useCallback(async () => {
    try {
      const p = await fetchProgress(slug);
      setCompleted(new Set(p.completed_section_ids));
    } catch {
      setCompleted(null);
    }
  }, [slug]);

  useEffect(() => {
    setCompleted(null);
    void refresh();
  }, [refresh]);

  return { completed, refresh };
}
