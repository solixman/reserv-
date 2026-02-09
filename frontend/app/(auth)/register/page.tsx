
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api/auth';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Wait for the backend response
      const res = await authApi.register(formData);
      
      // Validate response structure
      if (!res || !res.accessToken || !res.user || !res.user.role) {
        throw new Error('Invalid response from server');
      }
      
      // Show success message
      setSuccess('Account created successfully! Logging you in...');
      
      // Store auth data
      localStorage.setItem('accessToken', res.accessToken);
      localStorage.setItem('user', JSON.stringify(res.user));
      
      // Determine redirect based on role
      const userRole = res.user.role;
      
      // Use router.replace for immediate redirect
      if (userRole === 'ADMIN') {
        router.replace('/admin/events');
      } else if (userRole === 'PARTICIPANT') {
        router.replace('/events');
      } else {
        router.replace('/events');
      }

    } catch (err: any) {
      console.error("Registration failed:", err);
      
      // Handle different error messages from backend
      let errorMessage = 'Registration failed. Please try again.';
      
      if (err.message) {
        // Backend returns specific error messages like "Email already in use"
        if (err.message.toLowerCase().includes('email already in use')) {
          errorMessage = 'This email is already registered. Please login instead.';
        } else if (err.message.toLowerCase().includes('email')) {
          errorMessage = err.message;
        } else if (err.message.toLowerCase().includes('password')) {
          errorMessage = err.message;
        } else if (err.message.toLowerCase().includes('name')) {
          errorMessage = err.message;
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400">
          Create Account
        </h1>
        <p className="text-zinc-400 mt-2">Join us today</p>
      </div>

      <form onSubmit={handleRegister} className="space-y-5">
        <div className="space-y-2">
            <label className="block text-sm font-medium text-zinc-400">Full Name</label>
            <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full bg-zinc-800/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all focus:border-transparent"
                placeholder="John Doe"
                required
                disabled={loading}
            />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-zinc-400">Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="w-full bg-zinc-800/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all focus:border-transparent"
            placeholder="name@example.com"
            required
            disabled={loading}
          />
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-zinc-400">Password</label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            className="w-full bg-zinc-800/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all focus:border-transparent"
            placeholder="••••••••"
            required
            disabled={loading}
          />
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {error}
          </div>
        )}
        
        {success && (
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
            {success}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-semibold py-3.5 rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20"
        >
          {loading ? 'Creating Account...' : 'Sign Up'}
        </button>
      </form>

      <p className="text-center mt-8 text-zinc-400 text-sm">
        Already have an account?{' '}
        <Link href="/login" className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
