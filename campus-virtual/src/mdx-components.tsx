import type { MDXComponents } from 'mdx/types'
import CodeBlock from '@/components/CodeBlock'; // Importa el nuevo componente
 
const components: MDXComponents = {
    // Mapea la etiqueta CodeBlock en el MDX a tu componente React
    CodeBlock: CodeBlock, 
    // Puedes personalizar otros tags HTML si lo necesitas (ej. h1, p, a)
}
 
export function useMDXComponents(allComponents: MDXComponents): MDXComponents {
  return { 
    ...allComponents, 
    ...components 
  };
}
