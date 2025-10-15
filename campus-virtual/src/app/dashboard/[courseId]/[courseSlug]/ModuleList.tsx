// src/app/(dashboard)/dashboard/[courseId]/[courseSlug]/ModuleList.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
// Importar los componentes de eliminación
import DeleteAssignmentButton from "@/components/DeleteAssignmentButton"; 
import DeleteModuleButton from "@/components/DeleteModuleButton"; 

interface Assignment {
  id: number;
  title: string;
  type: string;
  progress: { isCompleted: boolean }[];
}

interface Module {
  id: number;
  title: string;
  assignments: Assignment[];
}

interface ModuleListProps {
  modules: Module[];
  courseId: number;
  courseSlug: string;
  isTeacher: boolean; // Prop para saber si el usuario es docente
}

export default function ModuleList({
  modules,
  courseId,
  courseSlug,
  isTeacher,
}: ModuleListProps) {
  const [openModules, setOpenModules] = useState<Record<number, boolean>>({});

  const toggleModule = (moduleId: number) => {
    setOpenModules((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }));
  };

  if (modules.length === 0) {
    return (
      <p className="text-gray-500">
        No hay ejercicios asignados para este curso todavía.
      </p>
    );
  }

  return (
    <ul className="space-y-6">
      {modules.map((module) => (
        <li key={module.id} className="border rounded-lg p-4 bg-gray-50">
          
          {/* ENCABEZADO DE LA UNIDAD */}
          <div
            className="flex justify-between items-center" 
            onClick={() => toggleModule(module.id)} 
          >
            
            {/* Contenedor del Título y Botones */}
            <div className="flex items-center cursor-pointer">
              <h3 className="text-xl font-semibold">{module.title}</h3>
              
              {/* BOTÓN DE ELIMINAR UNIDAD (SOLO DOCENTE) */}
              {isTeacher && (
                <DeleteModuleButton 
                  moduleId={module.id}
                  moduleTitle={module.title}
                />
              )}
            </div>
            
            {/* Contenedor del Progreso y Flecha */}
            <div className="flex items-center">
              <span className="text-sm text-gray-500 mr-2">
                Progreso:{" "}
                {Math.round(
                  (module.assignments.filter(
                    (a) => a.progress.length > 0 && a.progress[0].isCompleted
                  ).length /
                    module.assignments.length) *
                    100
                )}
                %
              </span>
              <button className="ml-2">
                {openModules[module.id] ? "▲" : "▼"}
              </button>
            </div>
          </div>
          
          {/* Contenido de la Unidad (Ejercicios) */}
          {openModules[module.id] && (
            <div className="mt-4">
              <ul className="space-y-2">
                {/* Botón para crear nuevo ejercicio, solo si el usuario es docente */}
                {isTeacher && (
                  <li className="mb-4">
                    <Link
                      // ⭐ CORRECCIÓN CLAVE: Se eliminó ${courseSlug} para que la URL coincida con tu estructura de archivos.
                      // La ruta ahora es: /dashboard/[courseId]/modules/[moduleId]/assignments/crear
                      href={`/dashboard/${courseId}/modules/${module.id}/assignments/crear`}
                      className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                    >
                      + Crear Ejercicio
                    </Link>
                  </li>
                )}
                
                {module.assignments.map((assignment) => (
                  <li
                    key={assignment.id}
                    className="flex items-center justify-between py-2 border-b last:border-b-0" 
                  >
                    
                    {/* Contenedor Izquierdo (Icono, Link, Checkmark) */}
                    <div className="flex items-center space-x-3">
                        {/* Iconos de tipo de ejercicio */}
                        {assignment.type === "Lesson" && (<span className="text-2xl">📖</span>)}
                        {assignment.type === "Quiz" && (<span className="text-2xl">📝</span>)}
                        {assignment.type === "Project" && (<span className="text-2xl">✍️</span>)}
                        
                        <Link
                            href={`/dashboard/${courseId}/${courseSlug}/${assignment.id}`}
                            className="text-gray-700 hover:text-blue-600 font-medium"
                        >
                            {assignment.title}
                        </Link>
                        
                        {/* Checkmark de completado */}
                        {assignment.progress.length > 0 &&
                        assignment.progress[0].isCompleted ? (
                            <span className="text-green-500">✅</span>
                        ) : (
                            <span className="text-gray-400"></span>
                        )}
                    </div>
                    
                    {/* Contenedor Derecho: Botón de Eliminar Ejercicio (SOLO PARA DOCENTES) */}
                    {isTeacher && (
                        <div className="flex items-center space-x-2">
                            <DeleteAssignmentButton 
                                assignmentId={assignment.id}
                                assignmentTitle={assignment.title}
                            />
                        </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}