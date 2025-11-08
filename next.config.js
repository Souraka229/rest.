/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  basePath: '', // Laissez vide si c'est à la racine
}

module.exports = nextConfig
