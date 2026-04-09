import createNextIntlPlugin from 'next-intl/plugin';
import withPWA from 'next-pwa';

// Bundle analyzer — install with: yarn add -D @next/bundle-analyzer
// Then run: ANALYZE=true next build
let withBundleAnalyzer = (config) => config;
if (process.env.ANALYZE === 'true') {
    try {
        const bundleAnalyzer = (await import('@next/bundle-analyzer')).default;
        withBundleAnalyzer = bundleAnalyzer({ enabled: true });
    } catch {
        console.error('Install @next/bundle-analyzer to use ANALYZE=true');
    }
}

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
    // output: 'export', // Enabled for Capacitor mobile builds
    distDir: process.env.NEXT_DIST_DIR || '.next',
    reactStrictMode: true,
    compress: true,
    poweredByHeader: false,
    // Generate ETags for content-based cache validation
    generateEtags: true,
    typescript: {
        ignoreBuildErrors: true,
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    // Strip console.log/warn in production (keep console.error for debugging)
    compiler: {
        removeConsole: process.env.NODE_ENV === 'production'
            ? { exclude: ['error'] }
            : false,
    },
    // Immutable cache headers for static assets + security headers
    async headers() {
        return [
            {
                source: '/_next/static/:path*',
                headers: [
                    { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
                ],
            },
            {
                source: '/icons/:path*',
                headers: [
                    { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
                ],
            },
            {
                source: '/manifest.json',
                headers: [
                    { key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' },
                ],
            },
            {
                source: '/:path*',
                headers: [
                    { key: 'X-Content-Type-Options', value: 'nosniff' },
                    { key: 'X-Frame-Options', value: 'DENY' },
                    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
                ],
            },
        ];
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
        optimizePackageImports: [
            'lucide-react',
            'recharts',
            '@radix-ui/react-tabs',
            '@radix-ui/react-label',
            '@radix-ui/react-slot',
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-popover',
            '@radix-ui/react-select',
            '@radix-ui/react-tooltip',
            'date-fns',
            'clsx',
            'three',
            '@react-three/fiber',
            '@react-three/drei',
            '@react-three/xr',
            'zustand',
            'class-variance-authority',
            'tailwind-merge',
            '@supabase/supabase-js',
            '@stripe/stripe-js',
        ],
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
            // Exclude server-only packages from client bundle
            config.externals = config.externals || [];
            config.externals.push('pdf-parse');
            config.externals.push('pdfjs-dist');
            config.externals.push('googleapis');
            config.externals.push('openai');
            config.externals.push('mammoth');
            config.externals.push('bcryptjs');

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
        // Google Fonts stylesheets — immutable, cache for 1 year
        {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
                cacheName: 'google-fonts-stylesheets',
                expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
        },
        // Google Fonts webfont files (woff2) — immutable, cache for 1 year
        {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
                cacheName: 'google-fonts-webfonts',
                expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
                cacheableResponse: { statuses: [0, 200] },
            },
        },
        // Next.js static assets (content-hashed) — long-lived cache
        {
            urlPattern: /\/_next\/static\/.*/i,
            handler: 'CacheFirst',
            options: {
                cacheName: 'next-static',
                expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
        },
        // Other JS/CSS — stale-while-revalidate
        {
            urlPattern: /\.(?:js|css)$/i,
            handler: 'StaleWhileRevalidate',
            options: {
                cacheName: 'static-resources',
                expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
        },
        // Images — cache first with larger pool
        {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|avif|ico)$/i,
            handler: 'CacheFirst',
            options: {
                cacheName: 'images',
                expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 60 },
                cacheableResponse: { statuses: [0, 200] },
            },
        },
        // Supabase storage (user uploads) — cache with revalidation
        {
            urlPattern: /\.supabase\.co\/storage\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
                cacheName: 'supabase-storage',
                expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 7 },
                cacheableResponse: { statuses: [0, 200] },
            },
        },
        // API routes — network first with stale-while-revalidate semantics
        {
            urlPattern: /^\/api\/.*/i,
            handler: 'NetworkFirst',
            options: {
                cacheName: 'api-cache',
                expiration: { maxEntries: 50, maxAgeSeconds: 60 * 5 },
                networkTimeoutSeconds: 10,
            },
        },
        // HTML pages — network first for fresh content
        {
            urlPattern: /^\/(?!api).*$/i,
            handler: 'NetworkFirst',
            options: {
                cacheName: 'pages',
                expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 },
                networkTimeoutSeconds: 5,
            },
        },
    ],
});

export default withBundleAnalyzer(withNextIntl(pwaConfig(nextConfig)));
