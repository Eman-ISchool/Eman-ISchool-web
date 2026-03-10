import { supabaseAdmin } from '@/lib/supabase';
import { getMockDb } from '@/lib/mockDb';

export interface GradeRef {
  id: string;
  name: string;
  slug: string | null;
  supervisor_id: string | null;
}

/**
 * Resolves a grade by UUID id OR slug.
 */
export async function resolveGradeByRef(gradeRef: string): Promise<GradeRef | null> {
  const normalizedRef = String(gradeRef || '').trim();
  if (!normalizedRef) {
    return null;
  }

  if (process.env.TEST_BYPASS === 'true') {
    const db = getMockDb();
    const grades = Array.isArray(db.grades) ? db.grades : [];
    const byId = grades.find((grade: any) => grade.id === normalizedRef);
    const bySlug = grades.find((grade: any) => grade.slug === normalizedRef);
    const matched = byId || bySlug;

    if (!matched) {
      return null;
    }

    return {
      id: matched.id,
      name: matched.name || matched.name_en || 'Grade',
      slug: matched.slug || null,
      supervisor_id: matched.supervisor_id || '00000000-0000-0000-0000-000000000001',
    };
  }

  const { data: slugData, error: slugError } = await supabaseAdmin
    .from('grades')
    .select('id, name, slug, supervisor_id')
    .eq('slug', normalizedRef)
    .limit(1)
    .maybeSingle();

  if (!slugError && slugData) {
    return slugData as GradeRef;
  }

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(normalizedRef);
  if (!isUuid) {
    return null;
  }

  const { data: idData, error: idError } = await supabaseAdmin
    .from('grades')
    .select('id, name, slug, supervisor_id')
    .eq('id', normalizedRef)
    .maybeSingle();

  if (idError || !idData) {
    return null;
  }

  return idData as GradeRef;
}
