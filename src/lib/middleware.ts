import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, JWTPayload } from './auth';

export interface AuthenticatedRequest extends NextRequest {
    user?: JWTPayload;
}

export function getTokenFromRequest(request: NextRequest): string | null {
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7);
    }

    const cookie = request.cookies.get('token');
    return cookie?.value || null;
}

export function authenticateRequest(request: NextRequest): JWTPayload | null {
    const token = getTokenFromRequest(request);
    if (!token) {
        return null;
    }
    return verifyToken(token);
}

export function requireAuth(request: NextRequest): NextResponse | JWTPayload {
    const user = authenticateRequest(request);
    if (!user) {
        return NextResponse.json(
            { error: 'Unauthorized', message: 'Please login to continue' },
            { status: 401 }
        );
    }
    return user;
}

export function requireAdmin(request: NextRequest): NextResponse | JWTPayload {
    const result = requireAuth(request);
    if (result instanceof NextResponse) {
        return result;
    }

    if (result.role !== 'admin' && result.role !== 'hr') {
        return NextResponse.json(
            { error: 'Forbidden', message: 'Admin or HR access required' },
            { status: 403 }
        );
    }
    return result;
}

export function requireRole(request: NextRequest, allowedRoles: string[]): NextResponse | JWTPayload {
    const result = requireAuth(request);
    if (result instanceof NextResponse) {
        return result;
    }

    if (!allowedRoles.includes(result.role)) {
        return NextResponse.json(
            { error: 'Forbidden', message: 'You do not have permission to access this resource' },
            { status: 403 }
        );
    }
    return result;
}
