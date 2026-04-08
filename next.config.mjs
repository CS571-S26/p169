/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    images: {
        unoptimized: true,
    },
    basePath: '/p169',
    assetPrefix: '/p169/',
    trailingSlash: true,
}

export default nextConfig
