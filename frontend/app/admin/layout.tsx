'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check for token
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.replace('/login');
      return;
    }

    // Check for ADMIN role
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.role !== 'ADMIN') {
          router.replace('/events'); // Redirect non-admins
          return;
        }
        setUser(parsedUser);
        setAuthorized(true);
      } catch (e) {
        console.error("Auth check failed", e);
        localStorage.clear();
        router.replace('/login');
      }
    } else {
      router.replace('/login');
    }
  }, [router]);

  if (!authorized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 text-sm">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Top Navigation Bar */}
      <header className="border-b border-white/10 bg-slate-950/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/admin/events" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
              Admin Panel
            </Link>
            <nav className="hidden md:flex items-center gap-1">
              <Link 
                href="/admin/events" 
                className="px-4 py-2 rounded-lg hover:bg-white/5 text-slate-300 hover:text-white transition-all font-medium"
              >
                Events
              </Link>
              <Link 
                href="/events" 
                className="px-4 py-2 rounded-lg hover:bg-white/5 text-slate-300 hover:text-white transition-all font-medium"
              >
                Public View
              </Link>
            </nav>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-sm text-slate-400 hidden md:block">
              {user?.name}
            </div>
            <button
              onClick={() => {
                localStorage.clear();
                router.replace('/login');
              }}
              className="px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 text-sm font-medium transition-all"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
}
