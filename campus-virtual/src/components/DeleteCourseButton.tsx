"use client";

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { deleteCourse } from '@/lib/actions';

export default function DeleteCourseButton({ courseId }: { courseId: number }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleDelete = async (formData: FormData) => {
    startTransition(async () => {
      await deleteCourse(formData);
      router.refresh();
    });
  };

  return (
    <form action={handleDelete}>
      <input type="hidden" name="courseId" value={courseId} />
      <button 
        type="submit" 
        disabled={isPending}
        className="bg-red-600 text-white p-2 rounded-full text-xs hover:bg-red-700 transition">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 112 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                          </svg>
        {isPending ? 'Eliminando...' : 'Eliminar'}
      </button>
    </form>
  );
}
