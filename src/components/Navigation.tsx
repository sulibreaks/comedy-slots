'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const { data: session } = useSession();
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white';
  };

  if (!session) {
    return null;
  }

  return (
    <nav className="bg-gray-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/" className="text-white font-bold text-xl">
                Comedy Slots
              </Link>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link
                  href="/"
                  className={`rounded-md px-3 py-2 text-sm font-medium ${isActive('/')}`}
                >
                  Home
                </Link>

                {session.user.role === 'PROMOTER' && (
                  <>
                    <Link
                      href="/shows/create"
                      className={`rounded-md px-3 py-2 text-sm font-medium ${isActive('/shows/create')}`}
                    >
                      Create Show
                    </Link>
                    <Link
                      href="/dashboard/shows"
                      className={`rounded-md px-3 py-2 text-sm font-medium ${isActive('/dashboard/shows')}`}
                    >
                      My Shows
                    </Link>
                    <Link
                      href="/dashboard/manage-bookings"
                      className={`rounded-md px-3 py-2 text-sm font-medium ${isActive('/dashboard/manage-bookings')}`}
                    >
                      Manage Bookings
                    </Link>
                  </>
                )}

                {session.user.role === 'COMEDIAN' && (
                  <Link
                    href="/dashboard/my-bookings"
                    className={`rounded-md px-3 py-2 text-sm font-medium ${isActive('/dashboard/my-bookings')}`}
                  >
                    My Bookings
                  </Link>
                )}

                <Link
                  href="/profile"
                  className={`rounded-md px-3 py-2 text-sm font-medium ${isActive('/profile')}`}
                >
                  Profile
                </Link>
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              <div className="text-gray-300 px-3 py-2 text-sm font-medium">
                {session.user.email}
              </div>
              <Link
                href="/api/auth/signout"
                className="text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium"
              >
                Sign Out
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="md:hidden">
        <div className="space-y-1 px-2 pb-3 pt-2">
          <Link
            href="/"
            className={`block rounded-md px-3 py-2 text-base font-medium ${isActive('/')}`}
          >
            Home
          </Link>

          {session.user.role === 'PROMOTER' && (
            <>
              <Link
                href="/shows/create"
                className={`block rounded-md px-3 py-2 text-base font-medium ${isActive('/shows/create')}`}
              >
                Create Show
              </Link>
              <Link
                href="/dashboard/shows"
                className={`block rounded-md px-3 py-2 text-base font-medium ${isActive('/dashboard/shows')}`}
              >
                My Shows
              </Link>
              <Link
                href="/dashboard/manage-bookings"
                className={`block rounded-md px-3 py-2 text-base font-medium ${isActive('/dashboard/manage-bookings')}`}
              >
                Manage Bookings
              </Link>
            </>
          )}

          {session.user.role === 'COMEDIAN' && (
            <Link
              href="/dashboard/my-bookings"
              className={`block rounded-md px-3 py-2 text-base font-medium ${isActive('/dashboard/my-bookings')}`}
            >
              My Bookings
            </Link>
          )}

          <Link
            href="/profile"
            className={`block rounded-md px-3 py-2 text-base font-medium ${isActive('/profile')}`}
          >
            Profile
          </Link>

          <Link
            href="/api/auth/signout"
            className="block text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-base font-medium"
          >
            Sign Out
          </Link>
        </div>
      </div>
    </nav>
  );
} 