import { buildStoredPhone, getPhoneCandidates, isEmailIdentifier, normalizeDigits } from '../lib/auth-credentials';

describe('auth credential helpers', () => {
  it('normalizes digits consistently', () => {
    expect(normalizeDigits('+962 79-032-0149')).toBe('962790320149');
  });

  it('detects email identifiers', () => {
    expect(isEmailIdentifier('admin@example.com')).toBe(true);
    expect(isEmailIdentifier('790320149')).toBe(false);
  });

  it('builds stored phone with country code', () => {
    expect(buildStoredPhone('790320149', '962')).toBe('+962790320149');
    expect(buildStoredPhone('790320149', null)).toBe('790320149');
  });

  it('returns multiple phone candidates for backwards-compatible lookup', () => {
    expect(getPhoneCandidates('790320149', '962')).toEqual(
      expect.arrayContaining([
        '790320149',
        '+790320149',
        '962790320149',
        '+962790320149',
      ]),
    );
  });
});
