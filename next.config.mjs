import createNextIntlPlugin from 'next-intl/plugin';
import withPWA from 'next-pwa';

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
    // output: 'export', // Commented out to allow middleware for dev server
    typescript: {
        ignoreBuildErrors: true,
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'cdn.sanity.io',
            },
        ],
        unoptimized: true,
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
        }
        // Exclude pdf-parse from client bundle
        config.externals = config.externals || [];
        if (!isServer) {
            config.externals.push('pdf-parse');
        }
        return config;
    },
};

const pwaConfig = withPWA({
    dest: 'public',
    register: true,
    skipWaiting: true,
    disable: false, // Enable in development for testing
    buildExcludes: [/middleware-manifest\.json$/],
});

export default withNextIntl(pwaConfig(nextConfig));
