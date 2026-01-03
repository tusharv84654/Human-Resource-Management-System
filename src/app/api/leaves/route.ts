import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Leave from '@/models/Leave';
import { requireAuth, requireAdmin } from '@/lib/middleware';

// GET - Get leave requests
export async function GET(request: NextRequest) {
    try {
        const authResult = requireAuth(request);
        if (authResult instanceof NextResponse) {
            return authResult;
        }

        await connectDB();

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');

        const query: Record<string, unknown> = {};

        // Employees can only view their own leave requests
        if (authResult.role === 'employee') {
            query.userId = authResult.userId;
        }

        if (status) {
            query.status = status;
        }

        const total = await Leave.countDocuments(query);
        const leaves = await Leave.find(query)
            .populate('userId', 'firstName lastName email employeeId department')
            .populate('approvedBy', 'firstName lastName')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        return NextResponse.json({
            success: true,
            data: leaves,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Get leaves error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST - Apply for leave
export async function POST(request: NextRequest) {
    try {
        const authResult = requireAuth(request);
        if (authResult instanceof NextResponse) {
            return authResult;
        }

        await connectDB();

        const body = await request.json();
        const { leaveType, startDate, endDate, reason } = body;

        if (!leaveType || !startDate || !endDate || !reason) {
            return NextResponse.json(
                { success: false, error: 'All fields are required' },
                { status: 400 }
            );
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        if (start > end) {
            return NextResponse.json(
                { success: false, error: 'End date must be after start date' },
                { status: 400 }
            );
        }

        // Calculate total days
        const timeDiff = end.getTime() - start.getTime();
        const totalDays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)) + 1;

        // Check for overlapping leave requests
        const overlapping = await Leave.findOne({
            userId: authResult.userId,
            status: { $ne: 'rejected' },
            $or: [
                { startDate: { $lte: end }, endDate: { $gte: start } },
            ],
        });

        if (overlapping) {
            return NextResponse.json(
                { success: false, error: 'You already have a leave request for these dates' },
                { status: 400 }
            );
        }

        const leave = await Leave.create({
            userId: authResult.userId,
            leaveType,
            startDate: start,
            endDate: end,
            reason,
            totalDays,
            status: 'pending',
        });

        return NextResponse.json({
            success: true,
            message: 'Leave request submitted successfully',
            data: leave,
        });
    } catch (error) {
        console.error('Apply leave error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// PUT - Approve/Reject leave (Admin/HR only)
export async function PUT(request: NextRequest) {
    try {
        const authResult = requireAdmin(request);
        if (authResult instanceof NextResponse) {
            return authResult;
        }

        await connectDB();

        const body = await request.json();
        const { id, status, adminComments } = body;

        if (!id || !status) {
            return NextResponse.json(
                { success: false, error: 'Leave ID and status are required' },
                { status: 400 }
            );
        }

        if (!['approved', 'rejected'].includes(status)) {
            return NextResponse.json(
                { success: false, error: 'Invalid status' },
                { status: 400 }
            );
        }

        const leave = await Leave.findByIdAndUpdate(
            id,
            {
                $set: {
                    status,
                    adminComments,
                    approvedBy: authResult.userId,
                },
            },
            { new: true, runValidators: true }
        )
            .populate('userId', 'firstName lastName email employeeId')
            .populate('approvedBy', 'firstName lastName');

        if (!leave) {
            return NextResponse.json(
                { success: false, error: 'Leave request not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: `Leave request ${status} successfully`,
            data: leave,
        });
    } catch (error) {
        console.error('Update leave error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// DELETE - Cancel leave request
export async function DELETE(request: NextRequest) {
    try {
        const authResult = requireAuth(request);
        if (authResult instanceof NextResponse) {
            return authResult;
        }

        await connectDB();

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'Leave ID is required' },
                { status: 400 }
            );
        }

        const leave = await Leave.findById(id);

        if (!leave) {
            return NextResponse.json(
                { success: false, error: 'Leave request not found' },
                { status: 404 }
            );
        }

        // Employees can only cancel their own pending leave requests
        if (authResult.role === 'employee') {
            if (leave.userId.toString() !== authResult.userId) {
                return NextResponse.json(
                    { success: false, error: 'Access denied' },
                    { status: 403 }
                );
            }
            if (leave.status !== 'pending') {
                return NextResponse.json(
                    { success: false, error: 'Can only cancel pending leave requests' },
                    { status: 400 }
                );
            }
        }

        await Leave.findByIdAndDelete(id);

        return NextResponse.json({
            success: true,
            message: 'Leave request cancelled successfully',
        });
    } catch (error) {
        console.error('Delete leave error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
