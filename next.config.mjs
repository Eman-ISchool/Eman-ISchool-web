import createNextIntlPlugin from 'next-intl/plugin';
import withPWA from 'next-pwa';

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
    // output: 'export', // Enabled for Capacitor mobile builds
    distDir: process.env.NEXT_DIST_DIR || '.next',
    typescript: {
        ignoreBuildErrors: true,
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'cdn.sanity.io',
            },
            {
                protocol: 'https',
                hostname: '*.supabase.co',
            },
        ],
        // Only disable optimization for Capacitor static export builds
        unoptimized: process.env.NEXT_OUTPUT === 'export',
        formats: ['image/avif', 'image/webp'],
        minimumCacheTTL: 60 * 60 * 24, // 24 hours
    },
    webpack: (config, { isServer }) => {
        // Mark pdf-parse as external to avoid ESM/worker issues in static export
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
                path: false,
                canvas: false,
            };
            // Exclude pdf-parse from client bundle
            config.externals = config.externals || [];
            config.externals.push('pdf-parse');
            config.externals.push('pdfjs-dist');
        }
        return config;
    },
};

const pwaConfig = withPWA({
    dest: 'public',
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === 'development',
    buildExcludes: [/middleware-manifest\.json$/],
});

export default withNextIntl(pwaConfig(nextConfig));
