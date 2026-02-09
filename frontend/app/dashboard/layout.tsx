
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    // 1. Check for token
    const token = localStorage.getItem('accessToken');
    if (!token) {
        router.push('/login');
        return;
    }

    // 2. Check for Role (Optional but good for "dashboard")
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
        try {
            const user = JSON.parse(storedUser);
            if (user.role !== 'ADMIN') {
                router.push('/events'); // Redirect non-admins to public events
                return;
            }
        } catch (e) {
            console.error("Auth check failed", e);
            localStorage.removeItem('user'); // Clear corrupt data
            router.push('/login');
            return;
        }
    } else {
         // Token exists but no user data? fetch it or re-login
         // For now, re-login to be safe
         router.push('/login');
         return;
    }

    setAuthorized(true);
  }, [router]);

  if (!authorized) {
    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-zinc-500 text-sm">Verifying access...</p>
            </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex">
        {/* Sidebar could go here */}
        <aside className="w-64 border-r border-white/10 p-6 hidden md:block">
            <div className="mb-8">
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
                    Admin Panel
                </h1>
            </div>
            <nav className="space-y-2">
                <a href="/dashboard/events" className="block px-4 py-2 rounded-lg bg-white/5 text-white font-medium">
                    Events
                </a>
                {/* Add more links here */}
            </nav>
        </aside>
        
        <main className="flex-1 p-8 overflow-y-auto">
            {children}
        </main>
    </div>
  );
}
