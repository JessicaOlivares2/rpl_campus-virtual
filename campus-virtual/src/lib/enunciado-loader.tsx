import { MDXComponents } from 'mdx/types';

/**
 * Carga dinámicamente el componente MDX del enunciado basado en el slug.
 * @param slug El slug del ejercicio (ej: 'suma-part2').
 * @returns El componente React para renderizar el enunciado o un componente de error.
 */
export async function getEnunciadoComponent(slug: string) {
  try {
    // 💡 Usa la importación dinámica de Next.js. Esto requiere que tengas un alias 
    // en tu tsconfig.json como: "@/enunciados/*": ["enunciados/*"]
    const mdxModule = await import(`@/enunciados/${slug}.mdx`);
    
    // Si la importación es exitosa, retorna el componente (default export)
    return mdxModule.default;

  } catch (error) {
    // Si el archivo no existe o hay un error de compilación
    console.error(`[MDX Loader] Error al cargar el enunciado para el slug: ${slug}`, error);
    
    // Retorna un componente de error para mostrar al usuario.
    return () => (
        <div className="p-4 border border-red-300 bg-red-50 rounded-lg shadow-inner">
            <h3 className="text-red-700 font-bold">Error: Enunciado no encontrado</h3>
            <p className="text-red-600 text-sm mt-1">
                No se pudo cargar el archivo MDX para el ejercicio **{slug}**. 
                Verifique que el archivo exista en `src/enunciados/{slug}.mdx`.
            </p>
        </div>
    );
  }
}
