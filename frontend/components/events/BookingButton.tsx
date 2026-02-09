
'use client';

import { useState, useEffect } from 'react';
import { reservationApi } from '@/lib/api/reservations';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ReservationStatus } from '@/lib/types/reservation';

interface BookingButtonProps {
    eventId: number;
    capacity: number;
}

export function BookingButton({ eventId, capacity }: BookingButtonProps) {
    const { token, user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error' | 'already_reserved'>('idle');
    const [message, setMessage] = useState('');
    const router = useRouter();

    useEffect(() => {
        if (token && user) {
            checkExistingReservation();
        }
    }, [token, user, eventId]);

    const checkExistingReservation = async () => {
        try {
            const reservations = await reservationApi.getMyReservations(token!);
            const existing = reservations.find(r => 
                r.eventId === eventId && 
                r.status !== ReservationStatus.CANCELED && 
                r.status !== ReservationStatus.REFUSED
            );
            if (existing) {
                setStatus('already_reserved');
            }
        } catch (error) {
            console.error('Failed to check existing reservation:', error);
        }
    };

    const handleBooking = async () => {
        if (!token) {
            router.push('/login');
            return;
        }

        setLoading(true);
        setStatus('idle');
        setMessage('');

        try {
            await reservationApi.create({ eventId }, token);
            setStatus('success');
            setMessage('Reservation requested! Waiting for admin approval.');
            router.refresh();
        } catch (error: any) {
            setStatus('error');
            setMessage(error.message || 'Failed to book spot');
        } finally {
            setLoading(false);
        }
    };

    if (status === 'success' || status === 'already_reserved') {
        return (
            <div className="text-center p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl animate-in fade-in zoom-in slide-in-from-bottom-4">
                <div className="flex items-center justify-center mb-3">
                    <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                    </div>
                </div>
                <p className="text-emerald-400 font-bold">
                    {status === 'already_reserved' ? 'Spot Already Reserved' : 'Reservation Requested!'}
                </p>
                <p className="text-xs text-slate-400 mt-2">
                    {status === 'already_reserved' 
                        ? 'You have already booked a spot for this event. Check your dashboard for status.' 
                        : 'Waiting for administrator approval.'}
                </p>
                <button 
                    onClick={() => router.push('/dashboard')}
                    className="mt-6 w-full py-3 bg-emerald-500 text-black font-bold rounded-xl hover:bg-emerald-400 transition-all text-sm"
                >
                    View Your Reservations
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <button 
                onClick={handleBooking}
                disabled={loading || capacity <= 0}
                className="w-full bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-400 hover:to-blue-500 text-white font-bold py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] transform hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-50 disabled:transform-none disabled:shadow-none"
            >
                {loading ? (
                    <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        Booking...
                    </span>
                ) : (
                    capacity > 0 ? 'Book Your Spot Now' : 'Sold Out'
                )}
            </button>
            
            {status === 'error' && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-[11px] text-center animate-shake leading-relaxed">
                    <span className="font-bold block mb-1">Booking failed</span>
                    {message}
                </div>
            )}

            {capacity > 0 && capacity <= 5 && (
                <p className="text-center text-amber-500 text-[10px] font-bold uppercase tracking-widest animate-pulse">
                    Only {capacity} spots left!
                </p>
            )}
        </div>
    );
}

