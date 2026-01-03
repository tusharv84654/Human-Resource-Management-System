import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { IUser } from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

export interface JWTPayload {
    userId: string;
    email: string;
    role: 'admin' | 'hr' | 'employee';
    employeeId: string;
}

export function generateToken(user: IUser): string {
    const payload: JWTPayload = {
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
        employeeId: user.employeeId,
    };

    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): JWTPayload | null {
    try {
        return jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch {
        return null;
    }
}

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
}

export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
}

export function generateVerificationToken(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export function validatePassword(password: string): { valid: boolean; message: string } {
    if (password.length < 8) {
        return { valid: false, message: 'Password must be at least 8 characters long' };
    }
    if (!/[A-Z]/.test(password)) {
        return { valid: false, message: 'Password must contain at least one uppercase letter' };
    }
    if (!/[a-z]/.test(password)) {
        return { valid: false, message: 'Password must contain at least one lowercase letter' };
    }
    if (!/[0-9]/.test(password)) {
        return { valid: false, message: 'Password must contain at least one number' };
    }
    if (!/[!@#$%^&*]/.test(password)) {
        return { valid: false, message: 'Password must contain at least one special character (!@#$%^&*)' };
    }
    return { valid: true, message: 'Password is valid' };
}
