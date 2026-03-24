import { supabaseAdmin } from '@/lib/supabase';

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
