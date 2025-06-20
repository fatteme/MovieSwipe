import mongoose, { Document, Schema } from 'mongoose';

// TypeScript interfaces
export interface IUser extends Document {
  googleId: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

// Mongoose schema
const userSchema = new Schema<IUser>({
  googleId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
}, {
  timestamps: true
});

export const User = mongoose.model<IUser>('User', userSchema); 