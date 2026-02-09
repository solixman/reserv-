

const API_URL = typeof window === 'undefined' ? 'http://api-gateway:3000' : `${window.location.protocol}//${window.location.hostname}:3000`;
if (typeof window !== 'undefined') console.log('[API Auth] Base URL:', API_URL);


export interface RegisterDto {
    email: string;
    password: string;
    name: string;
}

export interface LoginDto {
    email: string;
    password: string;
}

export interface AuthResponse {
    accessToken: string;
    user: {
        id: string;
        email: string;
        name: string;
        role: string;
    };
}

class AuthService {
    async register(data: RegisterDto): Promise<AuthResponse> {
        return this.request<AuthResponse>('/auth/register', 'POST', data);
    }

    async login(data: LoginDto): Promise<AuthResponse> {
        return this.request<AuthResponse>('/auth/login', 'POST', data);
    }

    private async request<T>(endpoint: string, method: string, body: any): Promise<T> {
        try {
            const res = await fetch(`${API_URL}${endpoint}`, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

            // Try to parse JSON response
            let data;
            try {
                data = await res.json();
            } catch (jsonError) {
                console.error('[API] Failed to parse JSON response:', jsonError);
                throw new Error('Invalid JSON response from server');
            }

            if (!res.ok) {
                console.error(`[API] Request failed: ${res.status} ${res.statusText}`, data);
                throw new Error(data.message || data.error || 'An error occurred');
            }

            return data;
        } catch (error) {
            throw error;
        }
    }
}

export const authApi = new AuthService();
