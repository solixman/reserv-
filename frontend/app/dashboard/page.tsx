'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Simple client-side auth check
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
    } else {
       // In a real app, you'd decode the token or fetch user profile here
       setUser({ name: 'User' }); 
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    router.push('/login');
  };

  if (!user) {
      return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-12 border-b border-zinc-800 pb-6">
            <div>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">Dashboard</h1>
                <p className="text-zinc-400 mt-1">Welcome back to your workspace</p>
            </div>
            <button 
                onClick={handleLogout}
                className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-white/10"
            >
                Log Out
            </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
                <div key={i} className="bg-zinc-900/50 border border-white/5 rounded-xl p-6 hover:bg-zinc-900 transition-colors group cursor-pointer">
                    <div className="h-10 w-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg mb-4 flex items-center justify-center text-white font-bold group-hover:scale-110 transition-transform">
                        {i}
                    </div>
                    <h3 className="font-semibold text-lg mb-2">Project {i}</h3>
                    <p className="text-zinc-500 text-sm">Review your latest stats and analytics for this project.</p>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
}
