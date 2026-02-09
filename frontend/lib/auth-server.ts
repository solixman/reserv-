
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function checkAuth() {
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken');

    if (!token) {
        redirect('/login');
    }

    return token.value;
}
