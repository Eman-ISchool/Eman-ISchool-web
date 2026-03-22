import { withLocalePrefix } from '@/lib/locale-path';

export const withAdminPortalPrefix = (path: string, locale?: string | null): string =>
  withLocalePrefix(path, locale);
