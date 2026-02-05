
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

const API_URL = 'http://localhost:3000';

class AuthService {
    private async request<T>(endpoint: string, method: string, body: any): Promise<T> {
        const res = await fetch(`${API_URL}/auth/${endpoint}`, {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || 'An error occurred');
        }

        return data;
    }

    async register(data: RegisterDto): Promise<AuthResponse> {
        return this.request<AuthResponse>('register', 'POST', data);
    }

    async login(data: LoginDto): Promise<AuthResponse> {
        return this.request<AuthResponse>('login', 'POST', data);
    }


}

export const authApi = new AuthService();
