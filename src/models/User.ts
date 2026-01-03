import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
    employeeId: string;
    email: string;
    password: string;
    role: 'admin' | 'hr' | 'employee';
    firstName: string;
    lastName: string;
    phone?: string;
    address?: string;
    department?: string;
    designation?: string;
    dateOfJoining?: Date;
    dateOfBirth?: Date;
    profilePicture?: string;
    isVerified: boolean;
    isActive: boolean;
    verificationToken?: string;
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
    documents?: {
        name: string;
        url: string;
        uploadedAt: Date;
    }[];
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
    {
        employeeId: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            index: true,
        },
        password: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            enum: ['admin', 'hr', 'employee'],
            default: 'employee',
            index: true,
        },
        firstName: {
            type: String,
            required: true,
        },
        lastName: {
            type: String,
            required: true,
        },
        phone: String,
        address: String,
        department: {
            type: String,
            index: true,
        },
        designation: String,
        dateOfJoining: Date,
        dateOfBirth: Date,
        profilePicture: String,
        isVerified: {
            type: Boolean,
            default: true,
        },
        isActive: {
            type: Boolean,
            default: true,
            index: true,
        },
        verificationToken: String,
        resetPasswordToken: String,
        resetPasswordExpires: Date,
        documents: [
            {
                name: String,
                url: String,
                uploadedAt: { type: Date, default: Date.now },
            },
        ],
    },
    {
        timestamps: true,
    }
);

// Compound indexes for common queries
UserSchema.index({ firstName: 'text', lastName: 'text', email: 'text' });
UserSchema.index({ department: 1, role: 1 });
UserSchema.index({ createdAt: -1 });

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
