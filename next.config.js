/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,

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
        ],
        // Turbo mode temporarily disabled - causes Server Action errors in Next.js 15
        // turbo: {
        //     rules: {
        //         '*.svg': {
        //             loaders: ['@svgr/webpack'],
        //             as: '*.js',
        //         },
        //     },
        // },
    },

    // Compiler optimizations
    compiler: {
        // Remove console logs in production
        removeConsole: process.env.NODE_ENV === 'production' ? {
            exclude: ['error', 'warn'],
        } : false,
    },

    // Webpack optimizations for faster dev server
    webpack: (config, { dev, isServer }) => {
        if (dev && !isServer) {
            // Faster rebuilds in development
            config.watchOptions = {
                poll: 1000,
                aggregateTimeout: 300,
            }

            // Reduce chunk size for faster HMR
            config.optimization = {
                ...config.optimization,
                runtimeChunk: 'single',
                splitChunks: {
                    chunks: 'all',
                    cacheGroups: {
                        default: false,
                        vendors: false,
                        // Separate Supabase to its own chunk
                        supabase: {
                            name: 'supabase',
                            test: /[\\/]node_modules[\\/](@supabase)[\\/]/,
                            priority: 20,
                        },
                        // Separate UI libraries
                        ui: {
                            name: 'ui',
                            test: /[\\/]node_modules[\\/](@radix-ui|lucide-react)[\\/]/,
                            priority: 15,
                        },
                        // Everything else from node_modules
                        lib: {
                            test: /[\\/]node_modules[\\/]/,
                            name: 'lib',
                            priority: 10,
                        },
                    },
                },
            }
        }
        return config
    },

    // Production optimizations
    poweredByHeader: false,
    generateEtags: true,
};

module.exports = nextConfig;
