import Header from '@/components/ui/Header';
import CreateModuleForm from '@/components/CreateModuleForm';
import { notFound, redirect } from 'next/navigation';
import prisma from '@/lib/db';
import { cookies } from 'next/headers';

export default async function CreateModulePage({ params }: { params: { courseId: string } }) {
  const sessionCookie = (await cookies()).get('session');
  if (!sessionCookie) redirect('/login');

  const session = JSON.parse(sessionCookie.value);
  if (session.role !== "TEACHER") notFound();

  const courseId = parseInt(params.courseId);

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { title: true, slug: true }
  });
  if (!course) notFound();

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />
      <main className="flex-1 p-8">
        <div className="container mx-auto">
          <div className="bg-blue-800 text-white p-8 rounded-lg shadow-md mb-8">
            <h1 className="text-4xl font-bold">Crear Unidad Temática para {course.title}</h1>
          </div>
          
          <div className="bg-white p-8 rounded-lg shadow-md max-w-lg mx-auto">
            <CreateModuleForm courseId={courseId} courseSlug={course.slug} />
          </div>
        </div>
      </main>
    </div>
  );
}
