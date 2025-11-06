// src/app/(dashboard)/dashboard/[courseId]/[courseSlug]/materiales/page.tsx

import { notFound } from "next/navigation";
import prisma from "@/lib/db";
import Link from "next/link";

export default async function MaterialsPage({
  params,
}: {
  params: { courseId: string; courseSlug: string };
}) {
  const course = await prisma.course.findUnique({
    where: {
      id: parseInt(params.courseId),
    },
    include: {
      modules: {
        include: {
          assignments: {
            include: {
              resources: true, // Incluimos los recursos para esta página
            },
          },
        },
      },
      teacher: true,
    },
  });

  if (!course) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="container mx-auto">
        <div className="bg-blue-800 text-white p-8 rounded-lg shadow-md mb-8">
          <Link href={`/dashboard/${course.id}/${params.courseSlug}`}>
            <button className="mt-4 px-4 py-2 bg-white text-blue-800 font-bold rounded-lg shadow-md hover:bg-gray-100 transition">
              Atras
            </button>
          </Link>
          <h1 className="text-4xl font-bold">Materiales del Curso</h1>
          <p className="mt-2 text-blue-200">{course.title}</p>
        </div>
        <div className="bg-white p-8 rounded-lg shadow-md">
          {course.modules.length > 0 ? (
            <div className="space-y-8">
              {course.modules.map((module) => (
                <div key={module.id}>
                  <h3 className="text-2xl font-bold mb-4 border-b pb-2">
                    {module.title}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* PDFs */}
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="text-xl font-semibold mb-2 text-gray-800">
                        Archivos PDF
                      </h4>
                      <ul className="list-disc ml-6 space-y-1 text-gray-600">
                        {module.assignments
                          .flatMap((a) => a.resources)
                          .filter((r) => r.type === "PDF")
                          .map((pdf) => (
                            <li key={pdf.id}>
                              <a
                                href={pdf.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:underline text-blue-600"
                              >
                                {pdf.title}
                              </a>
                            </li>
                          ))}
                      </ul>
                    </div>
                    {/* Enlaces y otras cosas qsy */}
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="text-xl font-semibold mb-2 text-gray-800">
                        Enlaces y Videos
                      </h4>
                      <ul className="list-disc ml-6 space-y-1 text-gray-600">
                        {module.assignments
                          .flatMap((a) => a.resources)
                          .filter((r) => r.type !== "PDF")
                          .map((link) => (
                            <li key={link.id}>
                              <a
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:underline text-blue-600"
                              >
                                {link.title} ({link.type})
                              </a>
                            </li>
                          ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">
              Este curso no tiene materiales o unidades disponibles.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
