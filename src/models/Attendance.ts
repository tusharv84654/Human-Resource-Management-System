import mongoose, { Document, Schema } from 'mongoose';

export interface IAttendance extends Document {
    userId: mongoose.Types.ObjectId;
    date: Date;
    checkIn?: Date;
    checkOut?: Date;
    status: 'present' | 'absent' | 'half-day' | 'leave';
    workHours?: number;
    notes?: string;
    location?: {
        checkInLocation?: string;
        checkOutLocation?: string;
    };
    createdAt: Date;
    updatedAt: Date;
}

const AttendanceSchema = new Schema<IAttendance>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        date: {
            type: Date,
            required: true,
            index: true,
        },
        checkIn: Date,
        checkOut: Date,
        status: {
            type: String,
            enum: ['present', 'absent', 'half-day', 'leave'],
            default: 'absent',
            index: true,
        },
        workHours: Number,
        notes: String,
        location: {
            checkInLocation: String,
            checkOutLocation: String,
        },
    },
    {
        timestamps: true,
    }
);

// Compound index for unique attendance per user per day
AttendanceSchema.index({ userId: 1, date: 1 }, { unique: true });
// Index for date range queries
AttendanceSchema.index({ date: -1, status: 1 });
// Index for user attendance history
AttendanceSchema.index({ userId: 1, date: -1 });

export default mongoose.models.Attendance || mongoose.model<IAttendance>('Attendance', AttendanceSchema);
