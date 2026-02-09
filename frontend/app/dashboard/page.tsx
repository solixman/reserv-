'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { reservationApi } from '@/lib/api/reservations';
import { Reservation, ReservationStatus } from '@/lib/types/reservation';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/contexts/AuthContext';

export default function DashboardPage() {
    const { user, token, logout, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!authLoading && !token) {
            router.push('/login');
            return;
        }

        if (token) {
            loadReservations(token);
        }
    }, [token, authLoading, router]);

    const loadReservations = async (token: string) => {
        try {
            setLoading(true);
            setError(null);
            const data = await reservationApi.getMyReservations(token);
            setReservations(data);
        } catch (error: any) {
            console.error('Failed to load reservations:', error);
            setError(error.message || 'Failed to connect to the server. Please ensure the API is running.');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (id: number) => {
        if (!confirm('Are you sure you want to cancel this reservation?')) return;
        try {
            if (!token) return;
            await reservationApi.cancel(id, token);
            loadReservations(token);
        } catch (error: any) {
            alert(error.message || 'Failed to cancel reservation');
        }
    };

    const handleDownload = async (id: number) => {
        try {
            if (!token) return;
            
            const blob = await reservationApi.downloadTicket(id, token);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `ticket-${id}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error: any) {
            alert(error.message || 'Failed to download ticket');
        }
    };

    if (!user && !loading) {
        return null;
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
            <Header />

            <div className="max-w-7xl mx-auto px-6 py-20">
                {error && (
                    <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <p>{error}</p>
                        </div>
                        <button 
                            onClick={() => token && loadReservations(token)}
                            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-xl text-xs font-bold transition-all"
                        >
                            Retry
                        </button>
                    </div>
                )}
                <header className="mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        User <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Dashboard</span>
                    </h1>
                    <p className="text-slate-400 text-lg">Manage your event bookings and profile</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <div className="lg:col-span-1">
                        <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-8 backdrop-blur-md sticky top-8">
                            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-2xl mb-6 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-indigo-500/20">
                                {user?.name?.charAt(0)}
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">{user?.name}</h2>
                            <p className="text-slate-500 text-sm mb-6 pb-6 border-b border-white/5">{user?.email}</p>
                            
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-400">Role</span>
                                    <span className="text-indigo-400 font-bold px-2 py-0.5 bg-indigo-500/10 rounded border border-indigo-500/20">{user?.role}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-400">Reservations</span>
                                    <span className="text-white font-bold">{reservations.length}</span>
                                </div>
                            </div>

                            <Link 
                                href="/events"
                                className="mt-8 w-full flex items-center justify-center gap-2 py-3 bg-white text-black font-bold rounded-xl hover:bg-slate-200 transition-all text-sm"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                                Find More Events
                            </Link>
                        </div>
                    </div>

                    <div className="lg:col-span-3 space-y-6">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-2xl font-bold text-white uppercase tracking-wider text-sm">Your Reservations</h3>
                            <button 
                                onClick={() => token && loadReservations(token)}
                                className="text-slate-400 hover:text-white transition-colors"
                            >
                                <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                            </button>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        ) : reservations.length === 0 ? (
                            <div className="bg-slate-900/30 border border-slate-800 border-dashed rounded-3xl py-20 text-center">
                                <p className="text-slate-500 text-lg mb-4">You haven't made any reservations yet.</p>
                                <Link href="/events" className="text-indigo-400 hover:text-indigo-300 font-bold transition-all underline decoration-indigo-400/30 underline-offset-4">
                                    Discover events to book
                                </Link>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {reservations.map((res) => (
                                    <div key={res.id} className="bg-slate-900/50 border border-white/10 rounded-2xl p-6 hover:bg-slate-900 transition-all group border-l-4 border-l-indigo-500/50">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h4 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors">
                                                        {res.event?.title || 'Unknown Event'}
                                                    </h4>
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${
                                                        res.status === ReservationStatus.CONFIRMED ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                        res.status === ReservationStatus.PENDING ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                                        res.status === ReservationStatus.REFUSED ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                        'bg-slate-500/10 text-slate-400 border-slate-500/20'
                                                    }`}>
                                                        {res.status}
                                                    </span>
                                                </div>
                                                <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                                                    <p>Reserved on: {new Date(res.createdAt).toLocaleDateString()}</p>
                                                    <p>Ref: #{res.id}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {res.status === ReservationStatus.CONFIRMED && (
                                                    <button 
                                                        onClick={() => handleDownload(res.id)}
                                                        className="px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-2"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                                        Download Ticket
                                                    </button>
                                                )}
                                                
                                                {(res.status === ReservationStatus.PENDING || res.status === ReservationStatus.CONFIRMED) && (
                                                    <button 
                                                        onClick={() => handleCancel(res.id)}
                                                        className="px-4 py-2 border border-red-500/20 text-red-400 hover:bg-red-500/10 text-xs font-bold rounded-lg transition-all"
                                                    >
                                                        Cancel
                                                    </button>
                                                )}

                                                <Link 
                                                    href={`/events/${res.eventId}`}
                                                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold rounded-lg transition-all flex items-center gap-2 border border-white/5"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                    View Full Event
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
