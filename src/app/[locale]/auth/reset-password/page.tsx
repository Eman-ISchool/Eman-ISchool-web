import { Suspense } from 'react';
import ResetPasswordForm from './ResetPasswordForm';
import { locales } from '@/i18n/config';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

export function generateStaticParams() {
    return locales.map((locale) => ({ locale }));
}

function ResetPasswordFallback() {
    return (
        <div className="w-full max-w-md mx-auto px-4 py-8">
            <div className="overflow-hidden rounded-3xl bg-white shadow-2xl shadow-teal-100/40">
                <div className="relative overflow-hidden bg-linear-to-br from-teal-600 to-emerald-500 px-8 py-8 text-center text-white">
                    <div className="relative inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 mb-4" />
                    <div className="mx-auto h-5 w-36 rounded-full bg-white/25" />
                    <div className="mx-auto mt-3 h-4 w-44 rounded-full bg-white/20" />
                </div>
                <div className="space-y-5 px-8 py-8">
                    <div className="h-11 rounded-xl bg-gray-100" />
                    <div className="h-11 rounded-xl bg-gray-100" />
                    <div className="h-11 rounded-xl bg-teal-100" />
                </div>
            </div>
        </div>
    );
}

export default async function ResetPasswordPage({
    params,
    searchParams,
}: {
    params: { locale: string };
    searchParams: { token?: string };
}) {
    const { locale } = params;
    const token = searchParams?.token || null;

    return (
        <Suspense fallback={<ResetPasswordFallback />}>
            <ResetPasswordForm locale={locale} token={token} />
        </Suspense>
    );
}
