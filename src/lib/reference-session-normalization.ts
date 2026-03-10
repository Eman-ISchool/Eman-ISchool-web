export interface ReferenceSessionIdentity {
  email?: string | null;
  name?: string | null;
  role?: string | null;
}

const LEGACY_REFERENCE_NAMES = new Set(['parent user', 'local parent']);

export function isLegacyReferenceParentSession(identity: ReferenceSessionIdentity | null | undefined) {
  const normalizedEmail = (identity?.email || '').trim().toLowerCase();
  const normalizedName = (identity?.name || '').trim().toLowerCase();
  const normalizedRole = (identity?.role || '').trim().toLowerCase();

  return (
    normalizedRole === 'parent' &&
    (
      normalizedEmail === 'parent@example.com' ||
      /^parent-\d+@eduverse\.local$/.test(normalizedEmail) ||
      LEGACY_REFERENCE_NAMES.has(normalizedName)
    )
  );
}

export function normalizeReferenceSessionIdentity<T extends ReferenceSessionIdentity>(
  identity: T,
): T {
  if (!isLegacyReferenceParentSession(identity)) {
    return identity;
  }

  return {
    ...identity,
    name: 'FutureLab Dashboard User',
    role: 'admin',
  };
}
