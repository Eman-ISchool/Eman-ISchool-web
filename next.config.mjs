import createNextIntlPlugin from 'next-intl/plugin';
import withPWA from 'next-pwa';

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
    // output: 'export', // Enabled for Capacitor mobile builds
    distDir: process.env.NEXT_DIST_DIR || '.next',
    compress: true,
    poweredByHeader: false,
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
    experimental: {
        optimizePackageImports: ['lucide-react', 'recharts', '@radix-ui/react-tabs', '@radix-ui/react-label', '@radix-ui/react-slot'],
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

            // Split heavy libraries into separate chunks so they're only loaded when needed
            config.optimization = {
                ...config.optimization,
                splitChunks: {
                    ...config.optimization?.splitChunks,
                    cacheGroups: {
                        ...config.optimization?.splitChunks?.cacheGroups,
                        three: {
                            test: /[\\/]node_modules[\\/](three|@react-three)[\\/]/,
                            name: 'three-vendor',
                            chunks: 'all',
                            priority: 30,
                            reuseExistingChunk: true,
                        },
                        sanity: {
                            test: /[\\/]node_modules[\\/](sanity|@sanity|next-sanity|@portabletext|styled-components)[\\/]/,
                            name: 'sanity-vendor',
                            chunks: 'all',
                            priority: 30,
                            reuseExistingChunk: true,
                        },
                        recharts: {
                            test: /[\\/]node_modules[\\/](recharts|d3-[a-z]+|victory-vendor)[\\/]/,
                            name: 'recharts-vendor',
                            chunks: 'all',
                            priority: 25,
                            reuseExistingChunk: true,
                        },
                    },
                },
            };
        }
        return config;
    },
};

const pwaConfig = withPWA({
    dest: 'public',
    register: false,
    skipWaiting: true,
    disable: process.env.NODE_ENV === 'development',
    buildExcludes: [/middleware-manifest\.json$/],
    fallbacks: {
        document: '/ar/offline',
    },
    runtimeCaching: [
        {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
                cacheName: 'google-fonts-stylesheets',
                expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
        },
        {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
                cacheName: 'google-fonts-webfonts',
                expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
        },
        {
            urlPattern: /\.(?:js|css)$/i,
            handler: 'StaleWhileRevalidate',
            options: {
                cacheName: 'static-resources',
                expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
        },
        {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|avif|ico)$/i,
            handler: 'CacheFirst',
            options: {
                cacheName: 'images',
                expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
        },
        {
            urlPattern: /^\/api\/.*/i,
            handler: 'NetworkFirst',
            options: {
                cacheName: 'api-cache',
                expiration: { maxEntries: 50, maxAgeSeconds: 60 * 5 },
                networkTimeoutSeconds: 10,
            },
        },
    ],
});

export default withNextIntl(pwaConfig(nextConfig));
