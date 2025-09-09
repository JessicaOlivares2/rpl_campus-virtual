import prisma from '@/lib/db';
import CreateCourseForm from "@/components/ui/CreateCourseForm";

export default async function CreateCoursePage() {
  const commissions = await prisma.commission.findMany({
    select: {
      id: true,
      name: true,
      registrationCode: true,
    },
  });

  return (
    <div className="min-h-screen bg-gray-100 p-8 flex items-center justify-center">
      {/* Pasamos las comisiones obtenidas de la base de datos */}
      <CreateCourseForm commissions={commissions} />
    </div>
  );
}
