
import { authApi } from '@/lib/api/auth';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export function useAuth() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            // Need a way to get user data from token if no endpoint exists
            // For now, we decode or just assume logged in
            setUser({ token });
        }
        setLoading(false);
    }, []);

    const login = async (data: any) => {
        const res = await authApi.login(data);
        localStorage.setItem('accessToken', res.accessToken);
        setUser(res.user);
        router.push('/dashboard');
    };

    const logout = () => {
        localStorage.removeItem('accessToken');
        setUser(null);
        router.push('/login');
    };

    return { user, login, logout, loading };
}
