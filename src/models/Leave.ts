import mongoose, { Document, Schema } from 'mongoose';

export interface ILeave extends Document {
    userId: mongoose.Types.ObjectId;
    leaveType: 'paid' | 'sick' | 'unpaid' | 'casual';
    startDate: Date;
    endDate: Date;
    reason: string;
    status: 'pending' | 'approved' | 'rejected' | 'cancelled';
    approvedBy?: mongoose.Types.ObjectId;
    adminComments?: string;
    totalDays: number;
    createdAt: Date;
    updatedAt: Date;
}

const LeaveSchema = new Schema<ILeave>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        leaveType: {
            type: String,
            enum: ['paid', 'sick', 'unpaid', 'casual'],
            required: true,
            index: true,
        },
        startDate: {
            type: Date,
            required: true,
            index: true,
        },
        endDate: {
            type: Date,
            required: true,
        },
        reason: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected', 'cancelled'],
            default: 'pending',
            index: true,
        },
        approvedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
        adminComments: String,
        totalDays: {
            type: Number,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for common queries
LeaveSchema.index({ userId: 1, status: 1 });
LeaveSchema.index({ status: 1, createdAt: -1 });
LeaveSchema.index({ userId: 1, startDate: -1 });
LeaveSchema.index({ startDate: 1, endDate: 1 });

export default mongoose.models.Leave || mongoose.model<ILeave>('Leave', LeaveSchema);
