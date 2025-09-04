// src/app/(dashboard)/dashboard/[courseId]/[courseSlug]/ModuleList.tsx
"use client";

import { useState } from "react";
import Link from "next/link";

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
}

export default function ModuleList({
  modules,
  courseId,
  courseSlug,
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
          <div
            className="flex justify-between items-center cursor-pointer"
            onClick={() => toggleModule(module.id)}
          >
            <h3 className="text-xl font-semibold">{module.title}</h3>
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
          {/* Conditionally render the exercises based on the state */}
          {openModules[module.id] && (
            <div className="mt-4">
              <ul className="space-y-2">
                {module.assignments.map((assignment) => (
                  <li
                    key={assignment.id}
                    className="flex items-center space-x-3"
                  >
                    {assignment.type === "Lesson" && (
                      <span className="text-2xl">📖</span>
                    )}
                    {assignment.type === "Quiz" && (
                      <span className="text-2xl">📝</span>
                    )}
                    {assignment.type === "Project" && (
                      <span className="text-2xl">✍️</span>
                    )}
                    <Link
                      href={`/dashboard/${courseId}/${courseSlug}/${assignment.id}`}
                      className="text-gray-700 hover:text-blue-600"
                    >
                      {assignment.title}
                    </Link>
                    {assignment.progress.length > 0 &&
                    assignment.progress[0].isCompleted ? (
                      <span className="text-green-500">✅</span>
                    ) : (
                      <span className="text-gray-400"></span>
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
