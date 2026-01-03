import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { requireAuth, requireAdmin } from '@/lib/middleware';
import { hashPassword } from '@/lib/auth';

// GET - Get all employees (Admin/HR) or single employee
export async function GET(request: NextRequest) {
    try {
        const authResult = requireAuth(request);
        if (authResult instanceof NextResponse) {
            return authResult;
        }

        await connectDB();

        const { searchParams } = new URL(request.url);
        const employeeId = searchParams.get('id');

        // If specific employee requested
        if (employeeId) {
            const employee = await User.findById(employeeId).select('-password -verificationToken -resetPasswordToken');

            // Employees can only view their own profile
            if (authResult.role === 'employee' && authResult.userId !== employeeId) {
                return NextResponse.json(
                    { success: false, error: 'Access denied' },
                    { status: 403 }
                );
            }

            if (!employee) {
                return NextResponse.json(
                    { success: false, error: 'Employee not found' },
                    { status: 404 }
                );
            }

            return NextResponse.json({ success: true, data: employee });
        }

        // Get all employees (Admin/HR only)
        if (authResult.role === 'employee') {
            return NextResponse.json(
                { success: false, error: 'Access denied' },
                { status: 403 }
            );
        }

        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '100');
        const search = searchParams.get('search') || '';
        const department = searchParams.get('department') || '';
        const role = searchParams.get('role') || '';

        const query: Record<string, unknown> = { isActive: { $ne: false } };

        if (search) {
            query.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { employeeId: { $regex: search, $options: 'i' } },
            ];
        }

        if (department) {
            query.department = department;
        }

        if (role) {
            query.role = role;
        }

        const total = await User.countDocuments(query);
        const employees = await User.find(query)
            .select('-password -verificationToken -resetPasswordToken')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        return NextResponse.json({
            success: true,
            data: employees,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Get employees error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST - Create new employee (Admin/HR only)
export async function POST(request: NextRequest) {
    try {
        const authResult = requireAdmin(request);
        if (authResult instanceof NextResponse) {
            return authResult;
        }

        await connectDB();

        const body = await request.json();
        const { email, password, firstName, lastName, role, department, designation, phone, dateOfJoining } = body;

        // Validate required fields
        if (!email || !password || !firstName || !lastName) {
            return NextResponse.json(
                { success: false, error: 'Email, password, first name, and last name are required' },
                { status: 400 }
            );
        }

        // Check if email already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return NextResponse.json(
                { success: false, error: 'Email already exists' },
                { status: 400 }
            );
        }

        // Generate employee ID
        const lastEmployee = await User.findOne().sort({ createdAt: -1 });
        let employeeNumber = 1001;
        if (lastEmployee && lastEmployee.employeeId) {
            const lastNumber = parseInt(lastEmployee.employeeId.replace('EMP', ''));
            if (!isNaN(lastNumber)) {
                employeeNumber = lastNumber + 1;
            }
        }
        const employeeId = `EMP${employeeNumber}`;

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Create new employee
        const newEmployee = await User.create({
            employeeId,
            email: email.toLowerCase(),
            password: hashedPassword,
            firstName,
            lastName,
            role: role || 'employee',
            department,
            designation,
            phone,
            dateOfJoining: dateOfJoining ? new Date(dateOfJoining) : new Date(),
            isVerified: true,
            isActive: true,
        });

        // Return without password
        const employee = await User.findById(newEmployee._id).select('-password -verificationToken -resetPasswordToken');

        return NextResponse.json({
            success: true,
            message: 'Employee created successfully',
            data: employee,
        }, { status: 201 });
    } catch (error) {
        console.error('Create employee error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// PUT - Update employee
export async function PUT(request: NextRequest) {
    try {
        const authResult = requireAuth(request);
        if (authResult instanceof NextResponse) {
            return authResult;
        }

        await connectDB();

        const body = await request.json();
        const { id, ...updateData } = body;

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'Employee ID is required' },
                { status: 400 }
            );
        }

        // Employees can only update certain fields of their own profile
        if (authResult.role === 'employee') {
            if (authResult.userId !== id) {
                return NextResponse.json(
                    { success: false, error: 'Access denied' },
                    { status: 403 }
                );
            }
            // Only allow updating specific fields for employees
            const allowedFields = ['phone', 'address', 'profilePicture'];
            const filteredData: Record<string, unknown> = {};
            allowedFields.forEach((field) => {
                if (updateData[field] !== undefined) {
                    filteredData[field] = updateData[field];
                }
            });
            Object.keys(updateData).forEach(key => delete updateData[key]);
            Object.assign(updateData, filteredData);
        }

        // Remove sensitive fields that shouldn't be updated directly
        delete updateData.password;
        delete updateData.employeeId;
        delete updateData.verificationToken;
        delete updateData.resetPasswordToken;

        const employee = await User.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select('-password -verificationToken -resetPasswordToken');

        if (!employee) {
            return NextResponse.json(
                { success: false, error: 'Employee not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Employee updated successfully',
            data: employee,
        });
    } catch (error) {
        console.error('Update employee error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// DELETE - Delete employee (Admin only)
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
                { success: false, error: 'Employee ID is required' },
                { status: 400 }
            );
        }

        // Soft delete - just mark as inactive
        const employee = await User.findByIdAndUpdate(
            id,
            { $set: { isActive: false } },
            { new: true }
        );

        if (!employee) {
            return NextResponse.json(
                { success: false, error: 'Employee not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Employee deleted successfully',
        });
    } catch (error) {
        console.error('Delete employee error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
