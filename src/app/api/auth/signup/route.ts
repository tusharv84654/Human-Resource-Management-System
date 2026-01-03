import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { hashPassword, generateVerificationToken, validatePassword } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const body = await request.json();
        const { employeeId, email, password, firstName, lastName, role = 'employee' } = body;

        // Validate required fields
        if (!employeeId || !email || !password || !firstName || !lastName) {
            return NextResponse.json(
                { success: false, error: 'All fields are required' },
                { status: 400 }
            );
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { success: false, error: 'Invalid email format' },
                { status: 400 }
            );
        }

        // Validate password strength
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.valid) {
            return NextResponse.json(
                { success: false, error: passwordValidation.message },
                { status: 400 }
            );
        }

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [{ email: email.toLowerCase() }, { employeeId }],
        });

        if (existingUser) {
            return NextResponse.json(
                { success: false, error: 'User with this email or employee ID already exists' },
                { status: 409 }
            );
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Generate verification token
        const verificationToken = generateVerificationToken();

        // Create user
        const user = await User.create({
            employeeId,
            email: email.toLowerCase(),
            password: hashedPassword,
            firstName,
            lastName,
            role: role === 'hr' || role === 'admin' ? role : 'employee',
            verificationToken,
            isVerified: true, // Set to true for demo purposes
        });

        return NextResponse.json(
            {
                success: true,
                message: 'Registration successful. Please login to continue.',
                data: {
                    id: user._id,
                    email: user.email,
                    employeeId: user.employeeId,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role,
                },
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Signup error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
