
'use client';

import Link from "next/link";
import { useAuth } from '@/contexts/AuthContext';

export function Header() {
  const { user, logout } = useAuth();

  if (user) {
    return (
        <div className="absolute top-6 right-6 z-20 flex items-center gap-4">
          <Link 
            href={user.role === 'ADMIN' ? "/admin/events" : "/dashboard"}
            className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full border border-white/5 hover:border-indigo-500/30 text-xs font-bold text-slate-400 hover:text-indigo-400 transition-all uppercase tracking-widest"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            {user.role === 'ADMIN' ? 'Admin Panel' : 'Dashboard'}
          </Link>
          <div className="text-sm font-medium text-slate-300 hidden md:block">
            Hi, {user.name}
          </div>
          <button 
            onClick={logout}
            className="px-5 py-2.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-white text-sm font-medium transition-all backdrop-blur-md flex items-center gap-2 group cursor-pointer"
          >
            <span>Log Out</span>
            <svg className="w-4 h-4 text-red-400 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
          </button>
        </div>
    );
  }

  return (
    <div className="absolute top-6 right-6 z-20">
      <Link 
        href="/login" 
        className="px-5 py-2.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-white text-sm font-medium transition-all backdrop-blur-md flex items-center gap-2 group"
      >
        <span>Sign In</span>
        <svg className="w-4 h-4 text-indigo-400 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
      </Link>
    </div>
  );
}

