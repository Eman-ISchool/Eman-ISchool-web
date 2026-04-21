export function normalizeDigits(value: string | null | undefined): string {
  return (value ?? '').replace(/\D/g, '');
}

export function isEmailIdentifier(value: string | null | undefined): boolean {
  return Boolean(value && value.includes('@'));
}

export function buildStoredPhone(phone: string | null | undefined, countryCode?: string | null): string | null {
  const nationalNumber = normalizeDigits(phone);
  if (!nationalNumber) {
    return null;
  }

  const normalizedCountryCode = normalizeDigits(countryCode);
  return normalizedCountryCode ? `+${normalizedCountryCode}${nationalNumber}` : nationalNumber;
}

export function getPhoneCandidates(
  phone: string | null | undefined,
  countryCode?: string | null,
): string[] {
  const rawDigits = normalizeDigits(phone);
  if (!rawDigits) {
    return [];
  }

  const normalizedCountryCode = normalizeDigits(countryCode);
  const candidates = new Set<string>([
    rawDigits,
    `+${rawDigits}`,
  ]);

  if (normalizedCountryCode) {
    candidates.add(`+${normalizedCountryCode}${rawDigits}`);
    candidates.add(`${normalizedCountryCode}${rawDigits}`);
  }

  return Array.from(candidates);
}

