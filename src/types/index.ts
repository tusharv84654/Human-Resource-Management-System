// Type definitions for the HRMS application

export interface UserType {
    _id: string;
    employeeId: string;
    email: string;
    role: 'admin' | 'hr' | 'employee';
    firstName: string;
    lastName: string;
    phone?: string;
    address?: string;
    department?: string;
    designation?: string;
    dateOfJoining?: string;
    dateOfBirth?: string;
    profilePicture?: string;
    isVerified: boolean;
    documents?: {
        name: string;
        url: string;
        uploadedAt: string;
    }[];
    createdAt: string;
    updatedAt: string;
}

export interface AttendanceType {
    _id: string;
    userId: string | UserType;
    date: string;
    checkIn?: string;
    checkOut?: string;
    status: 'present' | 'absent' | 'half-day' | 'leave';
    workHours?: number;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface LeaveType {
    _id: string;
    userId: string | UserType;
    leaveType: 'paid' | 'sick' | 'unpaid' | 'casual';
    startDate: string;
    endDate: string;
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
    approvedBy?: string | UserType;
    adminComments?: string;
    totalDays: number;
    createdAt: string;
    updatedAt: string;
}

export interface PayrollType {
    _id: string;
    userId: string | UserType;
    month: number;
    year: number;
    basicSalary: number;
    allowances: {
        hra: number;
        transport: number;
        medical: number;
        other: number;
    };
    deductions: {
        tax: number;
        pf: number;
        insurance: number;
        other: number;
    };
    netSalary: number;
    status: 'pending' | 'processed' | 'paid';
    paymentDate?: string;
    createdAt: string;
    updatedAt: string;
}

export interface DashboardStats {
    totalEmployees: number;
    presentToday: number;
    pendingLeaves: number;
    totalPayroll: number;
}

export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}
