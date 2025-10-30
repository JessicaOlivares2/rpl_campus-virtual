import { MDXComponents } from 'mdx/types';

// Componente de error para el caso de SLUG INVÁLIDO O NULO
const SlugErrorComponent = () => (
    <div className="p-4 border border-red-300 bg-red-50 rounded-lg shadow-inner">
        <h3 className="text-red-700 font-bold">Error de Configuración</h3>
        <p className="text-red-600 text-sm mt-1">
            El ejercicio no tiene un **slug de enunciado** asociado en la base de datos. 
            Verifique la configuración del ejercicio en Prisma.
        </p>
    </div>
);


/**
 * Carga dinámicamente el componente MDX del enunciado basado en el slug.
 * @param slug El slug del ejercicio (ej: 'suma-part2'). Acepta string | null | undefined.
 * @returns El componente React para renderizar el enunciado o un componente de error.
 */
export async function getEnunciadoComponent(slug: string | null | undefined) {
  
  // 🚨 CORRECCIÓN 1: Manejar slug faltante/inválido inmediatamente
  if (!slug || typeof slug !== 'string' || slug.trim() === '') {
    console.error(`[MDX Loader] Error: Slug es inválido o undefined. Recibido: ${slug}`);
    return SlugErrorComponent;
  }

  try {
    // La importación dinámica solo ocurre si 'slug' es un string válido
    const mdxModule = await import(`@/enunciados/${slug}.mdx`);
    
    // 2. Retorna el componente (default export)
    return mdxModule.default;

  } catch (error) {
    // Si el archivo no existe o hay un error de compilación
    console.error(`[MDX Loader] Error al cargar el enunciado para el slug: ${slug}`, error);
    
    // Retorna un componente de error para mostrar al usuario, indicando el slug.
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