
'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function Header() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    // Check for user in localStorage
    const storedUser = localStorage.getItem('user');
    console.log('Header: storedUser from localStorage:', storedUser);

    if (storedUser && storedUser !== "undefined") {
      try {
        const parsedUser = JSON.parse(storedUser);
        console.log('Header: successfully parsed user:', parsedUser);
        setUser(parsedUser);
      } catch (e) {
        console.error("Header: Failed to parse user", e);
        // If parsing fails, it might be corrupt, so clear it
        localStorage.removeItem('user');
      }
    } else {
        console.log('Header: No valid user found in localStorage');
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    setUser(null);
    router.refresh();
  };

  if (user) {
    return (
        <div className="absolute top-6 right-6 z-20 flex items-center gap-4">
          <div className="text-sm font-medium text-slate-300 hidden md:block">
            Hi, {user.name}
          </div>
          <button 
            onClick={handleLogout}
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
