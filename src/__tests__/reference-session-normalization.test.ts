import {
  isLegacyReferenceParentSession,
  normalizeReferenceSessionIdentity,
} from '../lib/reference-session-normalization';

describe('reference session normalization', () => {
  it('upgrades the legacy local parent fallback into an admin dashboard identity', () => {
    expect(
      isLegacyReferenceParentSession({
        email: 'parent@example.com',
        name: 'Parent User',
        role: 'parent',
      }),
    ).toBe(true);

    expect(
      normalizeReferenceSessionIdentity({
        email: 'parent@example.com',
        name: 'Parent User',
        role: 'parent',
      }),
    ).toEqual({
      email: 'parent@example.com',
      name: 'FutureLab Dashboard User',
      role: 'admin',
    });
  });

  it('leaves real parent accounts unchanged', () => {
    expect(
      isLegacyReferenceParentSession({
        email: 'real-parent@example.com',
        name: 'Real Parent',
        role: 'parent',
      }),
    ).toBe(false);

    expect(
      normalizeReferenceSessionIdentity({
        email: 'real-parent@example.com',
        name: 'Real Parent',
        role: 'parent',
      }),
    ).toEqual({
      email: 'real-parent@example.com',
      name: 'Real Parent',
      role: 'parent',
    });
  });
});
