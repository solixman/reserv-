
import { authApi } from '@/lib/api/auth';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const res = await authApi.login(body);

        // Example: Set HTTP-only cookie if needed (not standard here but for demonstration)
        const response = NextResponse.json(res);
        response.cookies.set('accessToken', res.accessToken, { httpOnly: true });

        return response;
    } catch (e: any) {
        return NextResponse.json({ message: e.message }, { status: 401 });
    }
}
