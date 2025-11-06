"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
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
  isTeacher: boolean;
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
      {modules.map((module) => {
        const completedCount = module.assignments.filter(
          (a) => a.progress.length > 0 && a.progress[0].isCompleted
        ).length;
        const progressPercent = Math.round(
          (completedCount / module.assignments.length) * 100
        );

        return (
          <li key={module.id} className="border rounded-lg bg-gray-50 overflow-hidden">
            {/* HEADER DEL MÓDULO */}
            <div
              className="flex justify-between items-center p-4 cursor-pointer"
              onClick={() => toggleModule(module.id)}
            >
              <div className="flex items-center space-x-2">
                <h3 className="text-xl font-semibold">{module.title}</h3>
                {isTeacher && (
                  <DeleteModuleButton
                    moduleId={module.id}
                    moduleTitle={module.title}
                  />
                )}
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">
                  Progreso: {progressPercent}%
                </span>
                <ChevronDown
                  className={`w-5 h-5 transform transition-transform duration-200 ${
                    openModules[module.id] ? "rotate-180" : "rotate-0"
                  }`}
                />
              </div>
            </div>

            {/* CONTENIDO DEL MÓDULO CON ANIMACIÓN */}
            <AnimatedModuleContent isOpen={!!openModules[module.id]}>
              <ul className="space-y-2">
                {/* Crear ejercicio solo para docentes */}
                {isTeacher && (
                  <li className="mb-4">
                    <Link
                      href={`/dashboard/${courseId}/modules/${module.id}/assignments/crear`}
                      className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                    >
                      + Crear Ejercicio
                    </Link>
                  </li>
                )}

                {/* Lista de ejercicios */}
                {module.assignments.map((assignment) => (
                  <li
                    key={assignment.id}
                    className="flex items-center justify-between py-2 border-b last:border-b-0"
                  >
                    <div className="flex items-center space-x-3">
                      {assignment.type === "Lesson" && <span>📖</span>}
                      {assignment.type === "Quiz" && <span>📝</span>}
                      {assignment.type === "Project" && <span>✍️</span>}

                      <Link
                        href={`/dashboard/${courseId}/${courseSlug}/${assignment.id}`}
                        className="text-gray-700 hover:text-blue-600 font-medium"
                      >
                        {assignment.title}
                      </Link>

                      {assignment.progress.length > 0 &&
                      assignment.progress[0].isCompleted ? (
                        <span className="text-green-500">✅</span>
                      ) : (
                        <span className="text-gray-400"></span>
                      )}
                    </div>

                    {isTeacher && (
                      <DeleteAssignmentButton
                        assignmentId={assignment.id}
                        assignmentTitle={assignment.title}
                      />
                    )}
                  </li>
                ))}
              </ul>
            </AnimatedModuleContent>
          </li>
        );
      })}
    </ul>
  );
}

// Componente auxiliar para animación
function AnimatedModuleContent({
  isOpen,
  children,
}: {
  isOpen: boolean;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (ref.current) {
      setHeight(isOpen ? ref.current.scrollHeight : 0);
    }
  }, [isOpen, children]);

  return (
    <div
      style={{ maxHeight: height }}
      className="overflow-hidden transition-all duration-300"
      ref={ref}
    >
      <div className="p-4 border-t border-gray-200">{children}</div>
    </div>
  );
}
