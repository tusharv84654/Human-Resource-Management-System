import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Attendance from '@/models/Attendance';
import Leave from '@/models/Leave';
import Payroll from '@/models/Payroll';
import { requireAuth } from '@/lib/middleware';

export async function GET(request: NextRequest) {
    try {
        const authResult = requireAuth(request);
        if (authResult instanceof NextResponse) {
            return authResult;
        }

        await connectDB();

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const currentMonth = today.getMonth() + 1;
        const currentYear = today.getFullYear();

        if (authResult.role === 'employee') {
            // Employee dashboard stats
            const attendance = await Attendance.findOne({
                userId: authResult.userId,
                date: today,
            });

            const monthlyAttendance = await Attendance.countDocuments({
                userId: authResult.userId,
                date: {
                    $gte: new Date(currentYear, currentMonth - 1, 1),
                    $lt: new Date(currentYear, currentMonth, 1),
                },
                status: 'present',
            });

            const pendingLeaves = await Leave.countDocuments({
                userId: authResult.userId,
                status: 'pending',
            });

            const approvedLeaves = await Leave.countDocuments({
                userId: authResult.userId,
                status: 'approved',
                startDate: { $gte: new Date(currentYear, 0, 1) },
            });

            const latestPayroll = await Payroll.findOne({
                userId: authResult.userId,
            }).sort({ year: -1, month: -1 });

            const recentLeaves = await Leave.find({
                userId: authResult.userId,
            })
                .sort({ createdAt: -1 })
                .limit(5);

            return NextResponse.json({
                success: true,
                data: {
                    todayAttendance: attendance || null,
                    monthlyPresentDays: monthlyAttendance,
                    pendingLeaves,
                    approvedLeavesThisYear: approvedLeaves,
                    latestSalary: latestPayroll?.netSalary || null,
                    recentLeaves,
                },
            });
        }

        // Admin/HR dashboard stats
        const totalEmployees = await User.countDocuments();

        const presentToday = await Attendance.countDocuments({
            date: today,
            status: { $in: ['present', 'half-day'] },
        });

        const absentToday = await Attendance.countDocuments({
            date: today,
            status: 'absent',
        });

        const pendingLeaves = await Leave.countDocuments({
            status: 'pending',
        });

        const totalPayroll = await Payroll.aggregate([
            {
                $match: { month: currentMonth, year: currentYear },
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$netSalary' },
                },
            },
        ]);

        const recentEmployees = await User.find()
            .select('firstName lastName email department designation createdAt profilePicture')
            .sort({ createdAt: -1 })
            .limit(5);

        const pendingLeaveRequests = await Leave.find({ status: 'pending' })
            .populate('userId', 'firstName lastName email department')
            .sort({ createdAt: -1 })
            .limit(5);

        const departmentStats = await User.aggregate([
            {
                $group: {
                    _id: '$department',
                    count: { $sum: 1 },
                },
            },
        ]);

        return NextResponse.json({
            success: true,
            data: {
                totalEmployees,
                presentToday,
                absentToday,
                pendingLeaves,
                totalPayroll: totalPayroll[0]?.total || 0,
                recentEmployees,
                pendingLeaveRequests,
                departmentStats,
            },
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
