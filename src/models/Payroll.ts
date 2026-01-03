import mongoose, { Document, Schema } from 'mongoose';

export interface IPayroll extends Document {
    userId: mongoose.Types.ObjectId;
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
    grossSalary: number;
    status: 'pending' | 'processed' | 'paid';
    paymentDate?: Date;
    paymentMethod?: string;
    transactionId?: string;
    createdAt: Date;
    updatedAt: Date;
}

const PayrollSchema = new Schema<IPayroll>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        month: {
            type: Number,
            required: true,
            min: 1,
            max: 12,
            index: true,
        },
        year: {
            type: Number,
            required: true,
            index: true,
        },
        basicSalary: {
            type: Number,
            required: true,
        },
        allowances: {
            hra: { type: Number, default: 0 },
            transport: { type: Number, default: 0 },
            medical: { type: Number, default: 0 },
            other: { type: Number, default: 0 },
        },
        deductions: {
            tax: { type: Number, default: 0 },
            pf: { type: Number, default: 0 },
            insurance: { type: Number, default: 0 },
            other: { type: Number, default: 0 },
        },
        netSalary: {
            type: Number,
            required: true,
        },
        grossSalary: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: ['pending', 'processed', 'paid'],
            default: 'pending',
            index: true,
        },
        paymentDate: Date,
        paymentMethod: String,
        transactionId: String,
    },
    {
        timestamps: true,
    }
);

// Compound index for unique payroll per user per month/year
PayrollSchema.index({ userId: 1, month: 1, year: 1 }, { unique: true });
// Index for payroll queries
PayrollSchema.index({ year: 1, month: 1, status: 1 });
PayrollSchema.index({ userId: 1, year: -1, month: -1 });

export default mongoose.models.Payroll || mongoose.model<IPayroll>('Payroll', PayrollSchema);
