import mongoose, { Document, Schema } from 'mongoose';

// TypeScript interfaces
export interface IGenre extends Document {
  _id: mongoose.Types.ObjectId;
  tmdbId: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

// Mongoose schema
const genreSchema = new Schema<IGenre>({
  tmdbId: {
    type: Number,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    index: true
  }
}, {
  timestamps: true
});

// Create compound index for efficient queries
genreSchema.index({ tmdbId: 1, name: 1 });

export const Genre = mongoose.model<IGenre>('Genre', genreSchema); 