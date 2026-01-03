import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { requireAuth } from '@/lib/middleware';

export async function GET(request: NextRequest) {
    try {
        const authResult = requireAuth(request);
        if (authResult instanceof NextResponse) {
            return authResult;
        }

        await connectDB();

        const user = await User.findById(authResult.userId).select('-password -verificationToken -resetPasswordToken');

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: {
                id: user._id,
                email: user.email,
                employeeId: user.employeeId,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                phone: user.phone,
                address: user.address,
                department: user.department,
                designation: user.designation,
                dateOfJoining: user.dateOfJoining,
                dateOfBirth: user.dateOfBirth,
                profilePicture: user.profilePicture,
                documents: user.documents,
                isVerified: user.isVerified,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            },
        });
    } catch (error) {
        console.error('Get user error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
