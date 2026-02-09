import { Reservation, CreateReservationDto, EventStatistics } from '../types/reservation';

const API_URL = typeof window === 'undefined' ? 'http://api-gateway:3000' : `${window.location.protocol}//${window.location.hostname}:3000`;

class ReservationService {
    private async request<T>(endpoint: string, method: string = 'GET', body?: any, token?: string): Promise<T> {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const config: RequestInit = {
            method,
            headers,
        };

        if (body) {
            config.body = JSON.stringify(body);
        }

        const res = await fetch(`${API_URL}/reservations${endpoint}`, config);

        let data;
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            data = await res.json();
        } else {
            data = await res.text();
        }

        if (!res.ok) {
            let errorMessage = 'An error occurred';
            if (data) {
                if (typeof data.message === 'string') {
                    errorMessage = data.message;
                } else if (Array.isArray(data.message)) {
                    errorMessage = data.message.join(', ');
                } else if (typeof data === 'string') {
                    errorMessage = data;
                } else if (data.error) {
                    errorMessage = data.error;
                }
            }
            throw new Error(errorMessage);
        }

        return data;
    }

    async create(dto: CreateReservationDto, token: string): Promise<Reservation> {
        return this.request<Reservation>('', 'POST', dto, token);
    }

    async getMyReservations(token: string): Promise<Reservation[]> {
        return this.request<Reservation[]>('/my-reservations', 'GET', undefined, token);
    }

    async findAll(token: string, filters?: { eventId?: number; userId?: string }): Promise<Reservation[]> {
        let query = '';
        if (filters) {
            const params = new URLSearchParams();
            if (filters.eventId) params.append('eventId', filters.eventId.toString());
            if (filters.userId) params.append('userId', filters.userId);
            query = `?${params.toString()}`;
        }
        return this.request<Reservation[]>(`${query}`, 'GET', undefined, token);
    }

    async findByEvent(eventId: number, token: string): Promise<Reservation[]> {
        return this.request<Reservation[]>(`/event/${eventId}`, 'GET', undefined, token);
    }

    async getStatistics(eventId: number, token: string): Promise<EventStatistics> {
        return this.request<EventStatistics>(`/statistics/${eventId}`, 'GET', undefined, token);
    }

    async findOne(id: number, token: string): Promise<Reservation> {
        return this.request<Reservation>(`/${id}`, 'GET', undefined, token);
    }

    async confirm(id: number, token: string): Promise<Reservation> {
        return this.request<Reservation>(`/${id}/confirm`, 'PATCH', undefined, token);
    }

    async refuse(id: number, token: string): Promise<Reservation> {
        return this.request<Reservation>(`/${id}/refuse`, 'PATCH', undefined, token);
    }

    async cancel(id: number, token: string): Promise<Reservation> {
        return this.request<Reservation>(`/${id}/cancel`, 'PATCH', undefined, token);
    }

    async updateStatus(id: number, status: string, token: string): Promise<Reservation> {
        return this.request<Reservation>(`/${id}`, 'PATCH', { status }, token);
    }

    async remove(id: number, token: string): Promise<void> {
        return this.request<void>(`/${id}`, 'DELETE', undefined, token);
    }

    async canDownloadTicket(id: number, token: string): Promise<boolean> {
        return this.request<boolean>(`/${id}/can-download-ticket`, 'GET', undefined, token);
    }

    async downloadTicket(id: number, token: string): Promise<Blob> {
        const res = await fetch(`${API_URL}/reservations/${id}/download-ticket`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.message || 'Failed to download ticket');
        }

        return await res.blob();
    }
}

export const reservationApi = new ReservationService();
