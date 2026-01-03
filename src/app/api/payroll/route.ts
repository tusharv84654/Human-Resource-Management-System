import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Payroll from '@/models/Payroll';
import { requireAuth, requireAdmin } from '@/lib/middleware';

// GET - Get payroll records
export async function GET(request: NextRequest) {
    try {
        const authResult = requireAuth(request);
        if (authResult instanceof NextResponse) {
            return authResult;
        }

        await connectDB();

        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const month = searchParams.get('month');
        const year = searchParams.get('year');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '12');

        const query: Record<string, unknown> = {};

        // Employees can only view their own payroll
        if (authResult.role === 'employee') {
            query.userId = authResult.userId;
        } else if (userId) {
            query.userId = userId;
        }

        if (month) {
            query.month = parseInt(month);
        }
        if (year) {
            query.year = parseInt(year);
        }

        const total = await Payroll.countDocuments(query);
        const payrolls = await Payroll.find(query)
            .populate('userId', 'firstName lastName email employeeId department designation')
            .sort({ year: -1, month: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        return NextResponse.json({
            success: true,
            data: payrolls,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Get payroll error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST - Create payroll (Admin/HR only)
export async function POST(request: NextRequest) {
    try {
        const authResult = requireAdmin(request);
        if (authResult instanceof NextResponse) {
            return authResult;
        }

        await connectDB();

        const body = await request.json();
        const { userId, month, year, basicSalary, allowances, deductions, status } = body;

        if (!userId || !month || !year || !basicSalary) {
            return NextResponse.json(
                { success: false, error: 'User ID, month, year, and basic salary are required' },
                { status: 400 }
            );
        }

        // Check if payroll already exists
        const existing = await Payroll.findOne({ userId, month, year });
        if (existing) {
            return NextResponse.json(
                { success: false, error: 'Payroll already exists for this month' },
                { status: 400 }
            );
        }

        // Calculate gross and net salary
        const totalAllowances = Object.values(allowances || {}).reduce(
            (sum: number, val) => sum + (Number(val) || 0),
            0
        );
        const totalDeductions = Object.values(deductions || {}).reduce(
            (sum: number, val) => sum + (Number(val) || 0),
            0
        );
        const grossSalary = basicSalary + totalAllowances;
        const netSalary = grossSalary - totalDeductions;

        const payroll = await Payroll.create({
            userId,
            month,
            year,
            basicSalary,
            allowances: {
                hra: allowances?.hra || 0,
                transport: allowances?.transport || 0,
                medical: allowances?.medical || 0,
                other: allowances?.other || 0,
            },
            deductions: {
                tax: deductions?.tax || 0,
                pf: deductions?.pf || 0,
                insurance: deductions?.insurance || 0,
                other: deductions?.other || 0,
            },
            grossSalary,
            netSalary,
            status: status || 'pending',
        });

        const populatedPayroll = await Payroll.findById(payroll._id).populate(
            'userId',
            'firstName lastName email employeeId department designation'
        );

        return NextResponse.json({
            success: true,
            message: 'Payroll created successfully',
            data: populatedPayroll,
        }, { status: 201 });
    } catch (error) {
        console.error('Create payroll error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// PUT - Update payroll (Admin/HR only)
export async function PUT(request: NextRequest) {
    try {
        const authResult = requireAdmin(request);
        if (authResult instanceof NextResponse) {
            return authResult;
        }

        await connectDB();

        const body = await request.json();
        const { id, basicSalary, allowances, deductions, status, paymentDate } = body;

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'Payroll ID is required' },
                { status: 400 }
            );
        }

        const payroll = await Payroll.findById(id);
        if (!payroll) {
            return NextResponse.json(
                { success: false, error: 'Payroll not found' },
                { status: 404 }
            );
        }

        // Update fields
        if (basicSalary !== undefined) payroll.basicSalary = basicSalary;
        if (allowances) payroll.allowances = { ...payroll.allowances, ...allowances };
        if (deductions) payroll.deductions = { ...payroll.deductions, ...deductions };
        if (status) payroll.status = status;
        if (paymentDate) payroll.paymentDate = new Date(paymentDate);

        // Recalculate gross and net salary
        const totalAllowances = Object.values(payroll.allowances).reduce(
            (sum: number, val) => sum + (Number(val) || 0),
            0
        );
        const totalDeductions = Object.values(payroll.deductions).reduce(
            (sum: number, val) => sum + (Number(val) || 0),
            0
        );
        payroll.grossSalary = payroll.basicSalary + totalAllowances;
        payroll.netSalary = payroll.grossSalary - totalDeductions;

        await payroll.save();

        const updatedPayroll = await Payroll.findById(id).populate(
            'userId',
            'firstName lastName email employeeId department'
        );

        return NextResponse.json({
            success: true,
            message: 'Payroll updated successfully',
            data: updatedPayroll,
        });
    } catch (error) {
        console.error('Update payroll error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// DELETE - Delete payroll (Admin only)
export async function DELETE(request: NextRequest) {
    try {
        const authResult = requireAdmin(request);
        if (authResult instanceof NextResponse) {
            return authResult;
        }

        await connectDB();

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'Payroll ID is required' },
                { status: 400 }
            );
        }

        const payroll = await Payroll.findByIdAndDelete(id);
        if (!payroll) {
            return NextResponse.json(
                { success: false, error: 'Payroll not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Payroll deleted successfully',
        });
    } catch (error) {
        console.error('Delete payroll error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
