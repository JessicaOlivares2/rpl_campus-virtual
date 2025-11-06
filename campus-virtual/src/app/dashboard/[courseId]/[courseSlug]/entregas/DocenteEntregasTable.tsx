import Link from 'next/link';

// Definición de tipos basada en la consulta de Prisma de 'page.tsx'
interface EntregaData {
    id: number; // ID de la Submission, crucial para la acción 'Revisar'
    submittedAt: Date;
    isSuccessful: boolean | null; // true (Aprobado), false (Desaprobado), null (Pendiente)
    student: {
        name: string;
        lastName: string;
    };
    assignment: {
        title: string;
    };
}

interface DocenteEntregasTableProps {
    entregas: EntregaData[];
    courseId: string;
    courseSlug: string; // Necesario para construir el Link de Revisión (Correcto)
}

// Función para determinar el estado visual basado en isSuccessful
const getEstado = (isSuccessful: boolean | null) => {
    if (isSuccessful === true) return { text: 'Aprobado', color: 'text-green-600' };
    if (isSuccessful === false) return { text: 'Desaprobado', color: 'text-red-600' };
    return { text: 'Pendiente de Revisión', color: 'text-orange-600' };
};

// 🚨 CORRECCIÓN: Agregar 'courseSlug' a la desestructuración de las props.
export function DocenteEntregasTable({ entregas, courseId, courseSlug }: DocenteEntregasTableProps) {
  
    if (entregas.length === 0) {
        return <p className="text-gray-500 p-4">No hay entregas pendientes o registradas para este curso.</p>;
    }
    
    return (
        // La tabla que Playwright validará (clase 'deliveries-table' o similar)
        <table className="deliveries-table min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden shadow">
            <thead>
                <tr className="bg-gray-100 text-left text-sm font-semibold text-gray-700">
                    <th className="py-3 px-4 border-b">Alumno</th> 
                    <th className="py-3 px-4 border-b">Ejercicio</th>
                    <th className="py-3 px-4 border-b">Fecha de Entrega</th>
                    <th className="py-3 px-4 border-b">Estado</th>
                    <th className="py-3 px-4 border-b">Acciones</th>
                </tr>
            </thead>
            <tbody>
                {entregas.map((entrega) => {
                    const estado = getEstado(entrega.isSuccessful);
                    return (
                        <tr key={entrega.id} className="border-t hover:bg-gray-50 text-sm">
                            {/* 1. Alumno */}
                            <td className="py-3 px-4">{entrega.student.lastName}, {entrega.student.name}</td>
                            
                            {/* 2. Ejercicio */}
                            <td className="py-3 px-4">{entrega.assignment.title}</td>
                            
                            {/* 3. Fecha de Entrega */}
                            <td className="py-3 px-4">
                                {new Date(entrega.submittedAt).toLocaleDateString()} {new Date(entrega.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </td>
                            
                            {/* 4. Estado del Ejercicio */}
                            <td className={`py-3 px-4 font-bold ${estado.color}`}>
                                {estado.text}
                            </td>
                            
                            {/* 5. Acciones: Botón Revisar */}
                            <td className="py-3 px-4">
                                {/* Esta URL es la que te llevará a la nueva página de detalle */}
                                <Link 
                                    // Uso de courseSlug ahora es válido
                        href={`/dashboard/${courseId}/${courseSlug}/entregas/${entrega.id}`}                    
                className="text-indigo-600 hover:text-indigo-900 font-medium"
                                >
                                    Revisar
                                </Link>
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );
}