

/** @type {import('next').NextConfig} */

const withMDX = require('@next/mdx')({
  extension: /\.mdx?$/,
});

const nextConfig = {
  // Desactiva el chequeo de ESLint durante el build
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Desactiva el chequeo de TypeScript durante el build
  typescript: {
    ignoreBuildErrors: true,
  },
// 2. CONFIGURAR las extensiones de página para incluir MDX
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'], 
};

module.exports = withMDX(nextConfig);
