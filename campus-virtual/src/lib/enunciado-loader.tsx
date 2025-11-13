import { MDXComponents } from 'mdx/types';

// Componente de error para el caso de SLUG INVÁLIDO O NULO
const SlugErrorComponent = () => (
  <div className="p-6 border-2 border-red-400 bg-red-50 rounded-lg shadow-md max-w-lg mx-auto">
    <h3 className="text-red-700 font-semibold text-xl">Error de Configuración</h3>
    <p className="text-red-600 text-sm mt-2">
      El ejercicio no tiene un **slug de enunciado** asociado en la base de datos. 
      Por favor, verifique la configuración del ejercicio en Prisma.
    </p>
  </div>
);

/**
 * Carga dinámicamente el componente MDX del enunciado basado en el slug.
 * @param slug El slug del ejercicio (ej: 'suma-part-0581'). Acepta string | null | undefined.
 * @returns El componente React para renderizar el enunciado o un componente de error.
 */
export async function getEnunciadoComponent(slug: string | null | undefined) {
  // 1. Manejar slug faltante/inválido
  if (!slug || typeof slug !== 'string' || slug.trim() === '') {
    console.error(`[MDX Loader] Error: Slug es inválido o undefined. Recibido: ${slug}`);
    return SlugErrorComponent; 
  }

  // ⭐ LÍNEA CLAVE CORREGIDA: Eliminar el sufijo numérico generado por createAssignment
  // Esto convierte "suma-part-0581" en "suma-part" para encontrar el archivo MDX.
  const cleanSlug = slug.replace(/-\d{4}$/, ''); 

  try {
    // 2. La importación utiliza el slug limpio
    const mdxModule = await import(`@/enunciados/${cleanSlug}.mdx`);
    
    // Retorna el componente (default export)
    return mdxModule.default;

  } catch (error) {
    // 3. Manejo de error si el archivo no existe
    console.error(`[MDX Loader] Error al cargar el enunciado para el slug: ${cleanSlug} (Original: ${slug})`, error);
    
    const NotFoundComponent = () => (
      <div className="p-6 border-2 border-red-400 bg-red-50 rounded-lg shadow-md mx-auto">
        <h3 className="text-red-700 font-semibold text-xl">Error: Enunciado no encontrado</h3>
        <p className="text-red-600 text-sm mt-2">
          No se pudo cargar el archivo MDX. Se buscó: 
          **`src/enunciados/{cleanSlug}.mdx`**
        </p>
      </div>
    );

    // Retornamos el componente de error como resultado de la función.
    return NotFoundComponent;
  }
}