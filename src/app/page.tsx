// src/app/page.tsx
import { Suspense } from 'react';
import ShowCalendar from '@/components/ShowCalendar';
import { getServerSession } from 'next-auth';

export default async function Home() {
  const session = await getServerSession();

  return (
    <div className="min-h-screen p-4 md:p-8">
      <header className="max-w-7xl mx-auto mb-8">
        <h1 className="text-3xl font-bold mb-2">Comedy Slots</h1>
        {session ? (
          <p className="text-gray-600">Welcome back, {session.user?.name || 'Comedian'}!</p>
        ) : (
          <p className="text-gray-600">Sign in to book comedy slots</p>
        )}
      </header>

      <main className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <Suspense fallback={<div>Loading calendar...</div>}>
            <ShowCalendar />
          </Suspense>
        </div>
      </main>
    </div>
  );
}