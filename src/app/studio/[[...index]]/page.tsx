'use client'

/**
 * This route is responsible for the built-in authoring environment using Sanity Studio.
 * All routes under your studio path is handled by this file using Next.js's
 * optional catch-all routes: https://nextjs.org/docs/routing/dynamic-routes#optional-catch-all-routes
 *
 * Sanity Studio + styled-components + sanity.config add ~400KB to the bundle.
 * Dynamic import ensures this entire tree is only loaded when /studio is visited.
 */

import dynamic from 'next/dynamic'

const StudioContent = dynamic(
    () => import('next-sanity/studio').then(async (studioMod) => {
        const config = (await import('../../../../sanity.config')).default;
        return {
            default: () => <studioMod.NextStudio config={config} />,
        };
    }),
    {
        ssr: false,
        loading: () => (
            <div className="flex h-screen items-center justify-center bg-gray-100">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
            </div>
        ),
    }
)

export default function StudioPage() {
    return <StudioContent />
}
