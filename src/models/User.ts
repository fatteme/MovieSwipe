// User model and types
// This file will contain both the Mongoose User schema and TypeScript User interfaces 

import mongoose, { Document, Schema } from 'mongoose';

// TypeScript interfaces
export interface IUser extends Document {
  googleId: string;
  email: string;
  name: string;
  picture?: string;
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
  picture: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Create indexes for better query performance
userSchema.index({ email: 1 });
userSchema.index({ googleId: 1 });

export const User = mongoose.model<IUser>('User', userSchema); 