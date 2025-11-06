import { notFound } from "next/navigation";
import prisma from "@/lib/db";
import Link from "next/link";

export default async function MaterialsPage({
  params,
}: {
  params: { courseId: string; courseSlug: string };
}) {
  const course = await prisma.course.findUnique({
    where: { id: parseInt(params.courseId) },
    include: {
      modules: {
        include: {
          assignments: {
            include: { resources: true },
          },
        },
      },
      teacher: true,
    },
  });

  if (!course) notFound();

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="container mx-auto">
        {/* Encabezado */}
        <div className="bg-gradient-to-r from-blue-900 to-blue-600 text-white p-8 rounded-2xl shadow-lg mb-8">
          <Link href={`/dashboard/${course.id}/${params.courseSlug}`}>
            <button className="mt-4 px-4 py-2 bg-white text-blue-800 font-bold rounded-xl shadow-md hover:bg-gray-100 transition">
              ← Atrás
            </button>
          </Link>
          <h1 className="text-4xl font-extrabold mt-4">Materiales del Curso</h1>
          <p className="mt-2 text-blue-200 text-lg">{course.title}</p>
        </div>

        {/* Materiales */}
        <div className="space-y-8">
          {course.modules.length > 0 ? (
            course.modules.map((module) => (
              <div
                key={module.id}
                className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition"
              >
                <h3 className="text-2xl font-bold mb-4 border-b pb-2 text-blue-900">
                  {module.title}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* PDFs */}
                  <div className="p-4 bg-blue-50 rounded-xl border-l-4 border-blue-400">
                    <h4 className="text-xl font-semibold mb-2 text-blue-900">
                      Archivos PDF
                    </h4>
                    <ul className="list-disc ml-6 space-y-1 text-blue-700">
                      {module.assignments
                        .flatMap((a) => a.resources)
                        .filter((r) => r.type === "PDF")
                        .map((pdf) => (
                          <li key={pdf.id}>
                            <a
                              href={pdf.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:underline"
                            >
                              {pdf.title}
                            </a>
                          </li>
                        ))}
                    </ul>
                  </div>

                  {/* Enlaces y otros */}
                  <div className="p-4 bg-blue-50 rounded-xl border-l-4 border-yellow-400">
                    <h4 className="text-xl font-semibold mb-2 text-blue-900">
                      Enlaces y Videos
                    </h4>
                    <ul className="list-disc ml-6 space-y-1 text-blue-700">
                      {module.assignments
                        .flatMap((a) => a.resources)
                        .filter((r) => r.type !== "PDF")
                        .map((link) => (
                          <li key={link.id}>
                            <a
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:underline"
                            >
                              {link.title} ({link.type})
                            </a>
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center text-lg">
              Este curso no tiene materiales o unidades disponibles.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
