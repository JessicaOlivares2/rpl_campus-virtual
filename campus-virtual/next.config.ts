// next.config.mjs

import createMDX from '@next/mdx'
 
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configura pageExtensions para incluir archivos markdown y MDX
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  // Si solo deseas compilar MDX, por defecto solo lo hace para .mdx. 
  // Para compilar también .md, actualiza la opción extension:
  // extension: /\.(md|mdx)$/,
}
 
const withMDX = createMDX({
  // Opcionalmente, agrega plugins de markdown y rehype aquí.
})
 
// Combina la configuración de MDX con la de Next.js
export default withMDX(nextConfig)