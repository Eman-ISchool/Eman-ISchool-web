import createNextIntlPlugin from 'next-intl/plugin';

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
    distDir: process.env.NEXT_DIST_DIR || '.next',
    reactStrictMode: true,
    compress: true,
    poweredByHeader: false,
    generateEtags: true,
    typescript: {
        ignoreBuildErrors: true,
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    compiler: {
        removeConsole: process.env.NODE_ENV === 'production'
            ? { exclude: ['error'] }
            : false,
    },
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
        formats: ['image/avif', 'image/webp'],
        minimumCacheTTL: 60 * 60 * 24,
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
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
                path: false,
                canvas: false,
            };
            config.externals = config.externals || [];
            config.externals.push('pdf-parse');
            config.externals.push('pdfjs-dist');
            config.externals.push('googleapis');
            config.externals.push('openai');
            config.externals.push('mammoth');
            config.externals.push('bcryptjs');

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

export default withBundleAnalyzer(withNextIntl(nextConfig));
