
import { useState, useEffect } from 'react';
import { Event } from '../types/event';

export const useEvents = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'ALL' | 'DRAFT' | 'PUBLISHED' | 'CANCELED'>('ALL');

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                // In a real app, pass filter to backend
                const data = await fetch('http://localhost:3000/events').then(res => res.json());
                setEvents(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, []);

    const filteredEvents = events.filter(e => filter === 'ALL' || e.status === filter);

    return { events, filteredEvents, loading, filter, setFilter };
};
