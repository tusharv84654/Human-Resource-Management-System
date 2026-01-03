import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Attendance from '@/models/Attendance';
import Leave from '@/models/Leave';
import Payroll from '@/models/Payroll';
import { hashPassword } from '@/lib/auth';

export async function GET() {
    try {
        await connectDB();

        // Check if data already exists
        const existingUsers = await User.countDocuments();
        if (existingUsers > 0) {
            return NextResponse.json({
                success: true,
                message: 'Database already seeded',
                counts: {
                    users: existingUsers,
                    attendance: await Attendance.countDocuments(),
                    leaves: await Leave.countDocuments(),
                    payroll: await Payroll.countDocuments(),
                },
            });
        }

        // Create users with Indian names
        const hashedAdminPass = await hashPassword('Admin@123');
        const hashedEmpPass = await hashPassword('Employee@123');

        const users = await User.insertMany([
            {
                employeeId: 'EMP1001',
                email: 'admin@hrms.com',
                password: hashedAdminPass,
                firstName: 'Rajesh',
                lastName: 'Sharma',
                role: 'admin',
                department: 'Management',
                designation: 'System Administrator',
                phone: '+91 98765 43210',
                dateOfJoining: new Date('2023-01-01'),
                isVerified: true,
                isActive: true,
            },
            {
                employeeId: 'EMP1002',
                email: 'hr@hrms.com',
                password: hashedAdminPass,
                firstName: 'Priya',
                lastName: 'Patel',
                role: 'hr',
                department: 'HR',
                designation: 'HR Manager',
                phone: '+91 98765 43211',
                dateOfJoining: new Date('2023-03-15'),
                isVerified: true,
                isActive: true,
            },
            {
                employeeId: 'EMP1003',
                email: 'amit@hrms.com',
                password: hashedEmpPass,
                firstName: 'Amit',
                lastName: 'Kumar',
                role: 'employee',
                department: 'Engineering',
                designation: 'Senior Developer',
                phone: '+91 98765 43212',
                dateOfJoining: new Date('2023-06-01'),
                isVerified: true,
                isActive: true,
            },
            {
                employeeId: 'EMP1004',
                email: 'sneha@hrms.com',
                password: hashedEmpPass,
                firstName: 'Sneha',
                lastName: 'Gupta',
                role: 'employee',
                department: 'Design',
                designation: 'UI/UX Designer',
                phone: '+91 98765 43213',
                dateOfJoining: new Date('2023-07-15'),
                isVerified: true,
                isActive: true,
            },
            {
                employeeId: 'EMP1005',
                email: 'vikram@hrms.com',
                password: hashedEmpPass,
                firstName: 'Vikram',
                lastName: 'Singh',
                role: 'employee',
                department: 'Engineering',
                designation: 'Backend Developer',
                phone: '+91 98765 43214',
                dateOfJoining: new Date('2023-09-01'),
                isVerified: true,
                isActive: true,
            },
            {
                employeeId: 'EMP1006',
                email: 'neha@hrms.com',
                password: hashedEmpPass,
                firstName: 'Neha',
                lastName: 'Verma',
                role: 'employee',
                department: 'Marketing',
                designation: 'Marketing Executive',
                phone: '+91 98765 43215',
                dateOfJoining: new Date('2023-10-01'),
                isVerified: true,
                isActive: true,
            },
            {
                employeeId: 'EMP1007',
                email: 'rahul@hrms.com',
                password: hashedEmpPass,
                firstName: 'Rahul',
                lastName: 'Joshi',
                role: 'employee',
                department: 'Sales',
                designation: 'Sales Manager',
                phone: '+91 98765 43216',
                dateOfJoining: new Date('2023-08-15'),
                isVerified: true,
                isActive: true,
            },
            {
                employeeId: 'EMP1008',
                email: 'ananya@hrms.com',
                password: hashedEmpPass,
                firstName: 'Ananya',
                lastName: 'Reddy',
                role: 'employee',
                department: 'Finance',
                designation: 'Financial Analyst',
                phone: '+91 98765 43217',
                dateOfJoining: new Date('2023-11-01'),
                isVerified: true,
                isActive: true,
            },
        ]);

        // Create attendance records for today and past days
        const attendanceRecords = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Create today's attendance - some present, some absent
        const presentUserIndexes = [0, 1, 2, 5]; // Rajesh, Priya, Amit, Neha present today

        for (let idx = 0; idx < users.length; idx++) {
            const user = users[idx];

            // Today's attendance
            if (presentUserIndexes.includes(idx)) {
                const checkIn = new Date(today);
                checkIn.setHours(9, Math.floor(Math.random() * 30), 0);

                attendanceRecords.push({
                    userId: user._id,
                    date: new Date(today),
                    checkIn,
                    status: 'present',
                    workHours: 0,
                });
            }

            // Past 30 days attendance
            for (let i = 1; i < 30; i++) {
                const date = new Date(today);
                date.setDate(date.getDate() - i);

                // Skip weekends
                if (date.getDay() === 0 || date.getDay() === 6) continue;

                const rand = Math.random();
                let status: 'present' | 'absent' | 'half-day' = 'present';
                if (rand > 0.9) status = 'absent';
                else if (rand > 0.85) status = 'half-day';

                const checkIn = new Date(date);
                checkIn.setHours(9, Math.floor(Math.random() * 30), 0);

                const checkOut = new Date(date);
                checkOut.setHours(18, Math.floor(Math.random() * 30), 0);

                const workHours = status === 'present' ? 8 + Math.random() * 2 : status === 'half-day' ? 4 : 0;

                attendanceRecords.push({
                    userId: user._id,
                    date: new Date(date.setHours(0, 0, 0, 0)),
                    checkIn: status !== 'absent' ? checkIn : undefined,
                    checkOut: status !== 'absent' ? checkOut : undefined,
                    status,
                    workHours: parseFloat(workHours.toFixed(2)),
                });
            }
        }

        await Attendance.insertMany(attendanceRecords);

        // Create leave records - some approved for today (on leave)
        const leaveRecords = [];

        // Sneha (index 3) is on approved leave today
        const snehaLeaveStart = new Date(today);
        snehaLeaveStart.setDate(snehaLeaveStart.getDate() - 1);
        const snehaLeaveEnd = new Date(today);
        snehaLeaveEnd.setDate(snehaLeaveEnd.getDate() + 2);

        leaveRecords.push({
            userId: users[3]._id, // Sneha Gupta
            leaveType: 'paid',
            startDate: snehaLeaveStart,
            endDate: snehaLeaveEnd,
            reason: 'Family wedding ceremony',
            status: 'approved',
            totalDays: 4,
            approvedBy: users[1]._id, // Approved by Priya (HR)
        });

        // Vikram (index 4) is on approved leave today
        const vikramLeaveStart = new Date(today);
        const vikramLeaveEnd = new Date(today);
        vikramLeaveEnd.setDate(vikramLeaveEnd.getDate() + 1);

        leaveRecords.push({
            userId: users[4]._id, // Vikram Singh
            leaveType: 'sick',
            startDate: vikramLeaveStart,
            endDate: vikramLeaveEnd,
            reason: 'Medical appointment',
            status: 'approved',
            totalDays: 2,
            approvedBy: users[1]._id,
        });

        // Add some past leave records
        for (const user of users.filter(u => u.role === 'employee')) {
            const numLeaves = 1 + Math.floor(Math.random() * 2);
            for (let i = 0; i < numLeaves; i++) {
                const startDate = new Date(today);
                startDate.setDate(startDate.getDate() - Math.floor(Math.random() * 60) - 10);

                const totalDays = 1 + Math.floor(Math.random() * 3);
                const endDate = new Date(startDate);
                endDate.setDate(endDate.getDate() + totalDays - 1);

                const leaveTypes: ('paid' | 'sick' | 'casual')[] = ['paid', 'sick', 'casual'];
                const statuses: ('pending' | 'approved' | 'rejected')[] = ['approved', 'approved', 'rejected'];

                leaveRecords.push({
                    userId: user._id,
                    leaveType: leaveTypes[Math.floor(Math.random() * leaveTypes.length)],
                    startDate,
                    endDate,
                    reason: ['Family function', 'Medical appointment', 'Personal work', 'Festival celebration'][Math.floor(Math.random() * 4)],
                    status: statuses[Math.floor(Math.random() * statuses.length)],
                    totalDays,
                    approvedBy: users[1]._id,
                });
            }
        }

        // Add one pending leave request
        const pendingLeaveStart = new Date(today);
        pendingLeaveStart.setDate(pendingLeaveStart.getDate() + 5);
        const pendingLeaveEnd = new Date(pendingLeaveStart);
        pendingLeaveEnd.setDate(pendingLeaveEnd.getDate() + 2);

        leaveRecords.push({
            userId: users[5]._id, // Neha Verma
            leaveType: 'casual',
            startDate: pendingLeaveStart,
            endDate: pendingLeaveEnd,
            reason: 'Personal travel planned',
            status: 'pending',
            totalDays: 3,
        });

        await Leave.insertMany(leaveRecords);

        // Create payroll records
        const payrollRecords = [];
        const months = [
            { month: 12, year: 2025 },
            { month: 11, year: 2025 },
            { month: 10, year: 2025 },
        ];

        for (const user of users) {
            const baseSalary = user.role === 'admin' ? 150000 : user.role === 'hr' ? 80000 : 60000 + Math.floor(Math.random() * 40000);

            for (const { month, year } of months) {
                const hra = Math.floor(baseSalary * 0.4);
                const transport = 3000;
                const medical = 2000;
                const tax = Math.floor(baseSalary * 0.1);
                const pf = Math.floor(baseSalary * 0.12);
                const insurance = 1500;

                const grossSalary = baseSalary + hra + transport + medical;
                const netSalary = grossSalary - tax - pf - insurance;

                payrollRecords.push({
                    userId: user._id,
                    month,
                    year,
                    basicSalary: baseSalary,
                    allowances: { hra, transport, medical, other: 0 },
                    deductions: { tax, pf, insurance, other: 0 },
                    grossSalary,
                    netSalary,
                    status: month === 12 ? 'pending' : 'paid',
                    paymentDate: month !== 12 ? new Date(year, month, 28) : undefined,
                });
            }
        }

        await Payroll.insertMany(payrollRecords);

        return NextResponse.json({
            success: true,
            message: 'Database seeded successfully with Indian demo data',
            counts: {
                users: users.length,
                attendance: attendanceRecords.length,
                leaves: leaveRecords.length,
                payroll: payrollRecords.length,
            },
            demoCredentials: {
                admin: { email: 'admin@hrms.com', password: 'Admin@123' },
                hr: { email: 'hr@hrms.com', password: 'Admin@123' },
                employee: { email: 'amit@hrms.com', password: 'Employee@123' },
            },
            statusPreview: {
                present: ['Rajesh Sharma', 'Priya Patel', 'Amit Kumar', 'Neha Verma'],
                onLeave: ['Sneha Gupta', 'Vikram Singh'],
                absent: ['Rahul Joshi', 'Ananya Reddy'],
            },
        });
    } catch (error) {
        console.error('Seed error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to seed database' },
            { status: 500 }
        );
    }
}

// POST to force reseed (delete all and recreate)
export async function POST() {
    try {
        await connectDB();

        // Delete all existing data
        await Promise.all([
            User.deleteMany({}),
            Attendance.deleteMany({}),
            Leave.deleteMany({}),
            Payroll.deleteMany({}),
        ]);

        // Call GET to seed fresh data
        const response = await GET();
        return response;
    } catch (error) {
        console.error('Force seed error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to reseed database' },
            { status: 500 }
        );
    }
}
