'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { reservationApi } from '@/lib/api/reservations';
import { Reservation, ReservationStatus } from '@/lib/types/reservation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function AdminReservationsPage() {
  const { token, user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | ReservationStatus>('ALL');

  useEffect(() => {
    if (!authLoading && (!token || user?.role !== 'ADMIN')) {
      router.push('/login');
      return;
    }

    if (token) {
      loadReservations(token);
    }
  }, [token, authLoading, user, router]);

  const loadReservations = async (authToken: string) => {
    try {
      setLoading(true);
      const data = await reservationApi.findAll(authToken);
      setReservations(data);
    } catch (error) {
      console.error('Failed to load reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  // Logic for Indicators
  const stats = useMemo(() => {
    const total = reservations.length;
    const pending = reservations.filter(r => r.status === ReservationStatus.PENDING).length;
    const confirmed = reservations.filter(r => r.status === ReservationStatus.CONFIRMED).length;
    const refused = reservations.filter(r => r.status === ReservationStatus.REFUSED).length;
    const canceled = reservations.filter(r => r.status === ReservationStatus.CANCELED).length;
    
    // Simplistic fill rate calculation (based on confirmed reservations / total seats if we had them)
    // Here we show breakdown instead as requested
    return { total, pending, confirmed, refused, canceled };
  }, [reservations]);

  const handleStatusUpdate = async (id: number, status: ReservationStatus) => {
    try {
      if (!token) return;

      if (status === ReservationStatus.CONFIRMED) {
        await reservationApi.confirm(id, token);
      } else if (status === ReservationStatus.REFUSED) {
        await reservationApi.refuse(id, token);
      } else {
        await reservationApi.updateStatus(id, status, token);
      }

      // Update local state
      setReservations(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    } catch (error: any) {
      alert(error.message || 'Failed to update status');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this reservation?')) return;
    try {
      if (!token) return;
      await reservationApi.remove(id, token);
      setReservations(prev => prev.filter(r => r.id !== id));
    } catch (error: any) {
      alert(error.message || 'Failed to delete reservation');
    }
  };

  const filteredReservations = filter === 'ALL'
    ? reservations
    : reservations.filter(r => r.status === filter);

  const getStatusStyle = (status: ReservationStatus) => {
    switch (status) {
      case ReservationStatus.CONFIRMED: return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case ReservationStatus.PENDING: return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case ReservationStatus.REFUSED: return 'bg-red-500/10 text-red-400 border-red-500/20';
      case ReservationStatus.CANCELED: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
            Reservations Management
          </h1>
          <p className="text-slate-400 mt-2">Oversee all event bookings and user requests</p>
        </div>
        
        <div className="flex gap-4">
            <button 
                onClick={() => loadReservations(token!)}
                className="p-2.5 rounded-xl bg-slate-900 border border-white/5 text-slate-400 hover:text-white transition-all"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            </button>
        </div>
      </div>

      {/* Indicators / Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
            { label: 'Total Requests', value: stats.total, color: 'indigo' },
            { label: 'Pending', value: stats.pending, color: 'amber' },
            { label: 'Confirmed', value: stats.confirmed, color: 'emerald' },
            { label: 'Refused', value: stats.refused, color: 'red' },
            { label: 'Canceled', value: stats.canceled, color: 'slate' },
        ].map((stat) => (
            <div key={stat.label} className="bg-slate-900/50 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">{stat.label}</p>
                <p className={`text-3xl font-bold text-${stat.color}-400`}>{stat.value}</p>
            </div>
        ))}
      </div>

      <div className="flex gap-2 flex-wrap">
        {(['ALL', ...Object.values(ReservationStatus)] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${filter === status
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
              : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-white border border-white/10'
              }`}
          >
            {status}
          </button>
        ))}
      </div>

      <div className="bg-slate-900/50 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm shadow-2xl shadow-black/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="px-6 py-4 text-sm font-semibold text-slate-300">ID</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-300">Event</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-300">User</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-300">Date</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-300">Status</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-300 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredReservations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500 capitalize italic">
                    No reservations found matching the filter.
                  </td>
                </tr>
              ) : (
                filteredReservations.map((res) => (
                  <tr key={res.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4 text-sm font-mono text-slate-400">#{res.id}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-white line-clamp-1 group-hover:text-indigo-400 transition-colors">{res.event?.title || 'Unknown Event'}</div>
                      <div className="text-[10px] text-slate-500">ID: {res.eventId}</div>
                    </td>
                    <td className="px-6 py-4">
                       <div className="text-sm text-slate-300 font-medium">{res.userName || 'Unknown'}</div>
                       <div className="text-[10px] text-slate-500 font-mono">{res.userId}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">
                      {new Date(res.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold border underline-offset-2 tracking-tight ${getStatusStyle(res.status)}`}>
                        {res.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {res.status === ReservationStatus.PENDING && (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(res.id, ReservationStatus.CONFIRMED)}
                              className="p-2 rounded bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all"
                              title="Confirm"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(res.id, ReservationStatus.REFUSED)}
                              className="p-2 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-all"
                              title="Refuse"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDelete(res.id)}
                          className="p-2 rounded bg-slate-800 text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-white/5 transition-all"
                          title="Delete"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

