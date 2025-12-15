/** @type {import('next').NextConfig} */
const nextConfig = {
    // TEMP: Disabled to diagnose hydration mismatch - re-enable after testing
    reactStrictMode: false,

    // Image optimization
    images: {
        formats: ['image/webp', 'image/avif'],
        deviceSizes: [640, 750, 828, 1080, 1200],
        imageSizes: [16, 32, 48, 64, 96, 128, 256],
        minimumCacheTTL: 60,
    },

    // Enable compression
    compress: true,

    // Experimental optimizations for SPEED
    experimental: {
        // Optimize package imports - CRITICAL for bundle size
        optimizePackageImports: [
            'lucide-react',
            '@supabase/supabase-js',
            '@supabase/ssr',
            'react-hook-form',
            'zod',
            'date-fns',
            'sonner',
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-tabs',
            '@radix-ui/react-popover',
            '@tanstack/react-query',
        ],
    },

    // SWC Compiler optimizations - FASTEST minification
    compiler: {
        // Remove console logs in production
        removeConsole: process.env.NODE_ENV === 'production' ? {
            exclude: ['error', 'warn'],
        } : false,
    },

    // Production optimizations
    poweredByHeader: false,
    generateEtags: true,

    // Headers for caching - CRITICAL for speed
    async headers() {
        const isDev = process.env.NODE_ENV !== 'production'

        return [
            // Development only: prevent browser caching of HTML to avoid hydration errors
            ...(isDev ? [{
                source: '/:path*',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'no-store, must-revalidate',
                    },
                ],
            }] : []),
            // Production only: cache static assets (NOT in dev to avoid hydration issues)
            ...(!isDev ? [{
                source: '/:all*(svg|jpg|jpeg|png|gif|ico|webp|avif)',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    },
                ],
            },
            {
                source: '/_next/static/:path*',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    },
                ],
            }] : []),
            {
                source: '/fonts/:path*',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    },
                ],
            },
        ]
    },

    // Webpack optimizations
    webpack: (config, { dev, isServer }) => {
        // Production bundle optimizations
        if (!dev) {
            // Removed splitChunks optimization to avoid SSR issues
        }

        // Dev optimizations
        if (dev && !isServer) {
            config.watchOptions = {
                poll: 1000,
                aggregateTimeout: 300,
            }
        }

        // Fix: Prevent "Unable to add filesystem" and "fs" module errors in client
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
                path: false,
                os: false,
                child_process: false,
                net: false,
                tls: false,
                perf_hooks: false,
            };
        }

        return config
    },
};

module.exports = nextConfig;
