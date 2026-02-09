
import { authApi } from '@/lib/api/auth';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const res = await authApi.register(body);
        return NextResponse.json(res);
    } catch (e: any) {
        return NextResponse.json({ message: e.message }, { status: 400 });
    }
}
