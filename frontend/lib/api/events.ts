import { CreateEventDto, UpdateEventDto, Event } from '../types/event';

const API_URL = typeof window === 'undefined' ? 'http://api-gateway:3000' : `${window.location.protocol}//${window.location.hostname}:3000`;

class EventService {
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

        const res = await fetch(`${API_URL}/events${endpoint}`, config);
        const data = await res.json();

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

    async findAll(): Promise<Event[]> {
        return this.request<Event[]>('', 'GET');
    }

    async findOne(id: number): Promise<Event> {
        return this.request<Event>(`/${id}`, 'GET');
    }

    async create(data: CreateEventDto, token: string): Promise<Event> {
        return this.request<Event>('', 'POST', data, token);
    }

    async update(id: number, data: UpdateEventDto, token: string): Promise<Event> {
        return this.request<Event>(`/${id}`, 'PATCH', { ...data, id }, token);
    }

    async remove(id: number, token: string): Promise<void> {
        return this.request<void>(`/${id}`, 'DELETE', undefined, token);
    }
}

export const eventApi = new EventService();
