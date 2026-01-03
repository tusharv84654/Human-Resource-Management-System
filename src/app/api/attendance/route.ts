import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Attendance from '@/models/Attendance';
import { requireAuth, requireAdmin } from '@/lib/middleware';

// GET - Get attendance records
export async function GET(request: NextRequest) {
    try {
        const authResult = requireAuth(request);
        if (authResult instanceof NextResponse) {
            return authResult;
        }

        await connectDB();

        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '30');

        const query: Record<string, unknown> = {};

        // Employees can only view their own attendance
        if (authResult.role === 'employee') {
            query.userId = authResult.userId;
        } else if (userId) {
            query.userId = userId;
        }

        if (startDate) {
            query.date = { $gte: new Date(startDate) };
        }
        if (endDate) {
            query.date = { ...((query.date as object) || {}), $lte: new Date(endDate) };
        }

        const total = await Attendance.countDocuments(query);
        const attendance = await Attendance.find(query)
            .populate('userId', 'firstName lastName email employeeId department')
            .sort({ date: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        return NextResponse.json({
            success: true,
            data: attendance,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Get attendance error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST - Check in/Check out
export async function POST(request: NextRequest) {
    try {
        const authResult = requireAuth(request);
        if (authResult instanceof NextResponse) {
            return authResult;
        }

        await connectDB();

        const body = await request.json();
        const { action } = body; // 'checkin' or 'checkout'

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let attendance = await Attendance.findOne({
            userId: authResult.userId,
            date: today,
        });

        if (action === 'checkin') {
            if (attendance && attendance.checkIn) {
                return NextResponse.json(
                    { success: false, error: 'Already checked in today' },
                    { status: 400 }
                );
            }

            if (!attendance) {
                attendance = await Attendance.create({
                    userId: authResult.userId,
                    date: today,
                    checkIn: new Date(),
                    status: 'present',
                });
            } else {
                attendance.checkIn = new Date();
                attendance.status = 'present';
                await attendance.save();
            }

            return NextResponse.json({
                success: true,
                message: 'Checked in successfully',
                data: attendance,
            });
        }

        if (action === 'checkout') {
            if (!attendance || !attendance.checkIn) {
                return NextResponse.json(
                    { success: false, error: 'Please check in first' },
                    { status: 400 }
                );
            }

            if (attendance.checkOut) {
                return NextResponse.json(
                    { success: false, error: 'Already checked out today' },
                    { status: 400 }
                );
            }

            attendance.checkOut = new Date();

            // Calculate work hours
            const checkIn = new Date(attendance.checkIn);
            const checkOut = new Date(attendance.checkOut);
            const workHours = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60);
            attendance.workHours = Math.round(workHours * 100) / 100;

            // Update status based on work hours
            if (workHours < 4) {
                attendance.status = 'half-day';
            }

            await attendance.save();

            return NextResponse.json({
                success: true,
                message: 'Checked out successfully',
                data: attendance,
            });
        }

        return NextResponse.json(
            { success: false, error: 'Invalid action' },
            { status: 400 }
        );
    } catch (error) {
        console.error('Attendance action error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// PUT - Update attendance (Admin/HR only)
export async function PUT(request: NextRequest) {
    try {
        const authResult = requireAdmin(request);
        if (authResult instanceof NextResponse) {
            return authResult;
        }

        await connectDB();

        const body = await request.json();
        const { id, status, notes } = body;

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'Attendance ID is required' },
                { status: 400 }
            );
        }

        const attendance = await Attendance.findByIdAndUpdate(
            id,
            { $set: { status, notes } },
            { new: true, runValidators: true }
        ).populate('userId', 'firstName lastName email employeeId');

        if (!attendance) {
            return NextResponse.json(
                { success: false, error: 'Attendance record not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Attendance updated successfully',
            data: attendance,
        });
    } catch (error) {
        console.error('Update attendance error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
