import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales, defaultLocale, type Locale } from './i18n/config';

export default getRequestConfig(async ({ requestLocale }) => {
  // Await the requestLocale to get the resolved locale value
  let locale = await requestLocale;

  // Fallback to defaultLocale if locale is undefined or not in the supported list
  if (!locale || !locales.includes(locale as Locale)) {
    locale = defaultLocale;
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
