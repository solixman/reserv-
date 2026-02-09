'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { eventApi } from '@/lib/api/events';
import { reservationApi } from '@/lib/api/reservations';
import { Event } from '@/lib/types/event';
import { EventStatistics } from '@/lib/types/reservation';
import EventModal from '@/components/events/EventModal';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminEventsPage() {
  const { token, user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [eventStats, setEventStats] = useState<Record<number, EventStatistics>>({});
  const [filter, setFilter] = useState<'ALL' | 'DRAFT' | 'PUBLISHED' | 'CANCELED'>('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  useEffect(() => {
    if (!authLoading && (!token || user?.role !== 'ADMIN')) {
      router.push('/login');
      return;
    }

    if (token) {
      loadEvents();
    }
  }, [token, authLoading, user, router]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await eventApi.findAll();
      setEvents(data);
      
      // Load stats for each event
      if (token) {
        data.forEach(async (event) => {
            try {
                const stats = await reservationApi.getStatistics(event.id, token);
                setEventStats(prev => ({ ...prev, [event.id]: stats }));
            } catch (e) {
                console.warn(`Failed to fetch stats for event ${event.id}`);
            }
        });
      }
    } catch (error) {
      console.error('Failed to load events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (data: any) => {
    if (!token) throw new Error('No authentication token');
    await eventApi.create(data, token);
    await loadEvents();
  };

  const handleEditEvent = async (data: any) => {
    if (!selectedEvent || !token) return;
    await eventApi.update(selectedEvent.id, data, token);
    await loadEvents();
  };

  const openCreateModal = () => {
    setSelectedEvent(null);
    setModalMode('create');
    setModalOpen(true);
  };

  const openEditModal = (event: Event) => {
    setSelectedEvent(event);
    setModalMode('edit');
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    try {
      if (!token) return;
      await eventApi.remove(id, token);
      setEvents(events.filter(e => e.id !== id));
    } catch (error) {
      console.error('Failed to delete event:', error);
      alert('Failed to delete event');
    }
  };

  const filteredEvents = filter === 'ALL' 
    ? events 
    : events.filter(e => e.status === filter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'DRAFT': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'CANCELED': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const stats = {
    total: events.length,
    published: events.filter(e => e.status === 'PUBLISHED').length,
    draft: events.filter(e => e.status === 'DRAFT').length,
    canceled: events.filter(e => e.status === 'CANCELED').length,
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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
            Events Management
          </h1>
          <p className="text-slate-400 mt-2">Manage all your events in one place</p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-6 py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-semibold transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2 justify-center"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Create Event
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/50 border border-white/10 rounded-xl p-6 backdrop-blur-sm">
          <div className="text-slate-400 text-sm font-medium mb-1">Total Events</div>
          <div className="text-3xl font-bold text-white">{stats.total}</div>
        </div>
        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-6 backdrop-blur-sm">
          <div className="text-emerald-400 text-sm font-medium mb-1">Published</div>
          <div className="text-3xl font-bold text-emerald-400">{stats.published}</div>
        </div>
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-6 backdrop-blur-sm">
          <div className="text-amber-400 text-sm font-medium mb-1">Drafts</div>
          <div className="text-3xl font-bold text-amber-400">{stats.draft}</div>
        </div>
        <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-6 backdrop-blur-sm">
          <div className="text-red-400 text-sm font-medium mb-1">Canceled</div>
          <div className="text-3xl font-bold text-red-400">{stats.canceled}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {(['ALL', 'PUBLISHED', 'DRAFT', 'CANCELED'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === status
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-white border border-white/10'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Events List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredEvents.map((event) => {
          const statsForEvent = eventStats[event.id];
          const fillRate = statsForEvent ? Math.round(statsForEvent.fillRate) : 0;
          
          return (
            <div
              key={event.id}
              className="bg-slate-900/50 border border-white/10 rounded-xl p-6 hover:border-indigo-500/30 transition-all group"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-start gap-3 mb-2">
                    <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors">
                      {event.title}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-widest ${getStatusColor(event.status)}`}>
                      {event.status}
                    </span>
                  </div>
                  <p className="text-slate-400 text-sm mb-4 line-clamp-1">{event.description}</p>
                  
                  <div className="flex flex-wrap gap-6 text-sm text-slate-500">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      {new Date(event.startDate).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                      {event.capacity} seats
                    </div>
                  </div>
                </div>

                {/* Fill Rate Indicator */}
                <div className="flex items-center gap-4 bg-white/5 border border-white/5 rounded-2xl p-4 md:w-48">
                    <div className="relative w-12 h-12 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-white/10" />
                            <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray={126} strokeDashoffset={126 - (126 * fillRate) / 100} className="text-indigo-500" />
                        </svg>
                        <span className="absolute text-[10px] font-bold text-white">{fillRate}%</span>
                    </div>
                    <div className="flex-1">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Fill Rate</p>
                        <p className="text-sm font-bold text-white leading-tight">
                            {statsForEvent?.confirmed || 0} / {event.capacity}
                        </p>
                    </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(event)}
                    className="p-3 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all border border-white/5"
                    title="Edit"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  </button>
                  <button
                    onClick={() => handleDelete(event.id)}
                    className="p-3 rounded-xl bg-slate-800 text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all border border-white/5"
                    title="Delete"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <EventModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={modalMode === 'create' ? handleCreateEvent : handleEditEvent}
        event={selectedEvent}
        mode={modalMode}
      />
    </div>
  );
}

