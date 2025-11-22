/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,

    // Image optimization
    images: {
        formats: ['image/webp', 'image/avif'],
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    },

    // Enable compression
    compress: true,

    // Optimize fonts
    optimizeFonts: true,

    // Experimental optimizations for performance
    experimental: {
        // Optimize package imports - reduces bundle size
        optimizePackageImports: [
            'lucide-react',
            '@supabase/supabase-js',
            'react-hook-form',
            'zod',
        ],
        // Enable optimistic client-side navigation
        optimisticClientCache: true,
    },

    // Compiler optimizations
    compiler: {
        // Remove console logs in production
        removeConsole: process.env.NODE_ENV === 'production' ? {
            exclude: ['error', 'warn'],
        } : false,
    },

    // Modern browser support for smaller bundles
    swcMinify: true,
};

module.exports = nextConfig;
