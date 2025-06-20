import mongoose, { Document, Schema } from 'mongoose';

// TypeScript interfaces
export interface IMovie extends Document {
  _id: mongoose.Types.ObjectId;
  tmdbId: number;
  title: string;
  overview: string;
  posterPath: string;
  backdropPath: string;
  releaseDate: Date;
  voteAverage: number;
  voteCount: number;
  genres: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IPopulatedMovie extends Omit<IMovie, 'genres'> {
  genres: Array<{
    _id: mongoose.Types.ObjectId;
    tmdbId: number;
    name: string;
  }>;
}

// Mongoose schema
const movieSchema = new Schema<IMovie>({
  tmdbId: {
    type: Number,
    required: true,
    unique: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  overview: {
    type: String,
    required: true,
    trim: true
  },
  posterPath: {
    type: String,
    required: false,
    trim: true
  },
  backdropPath: {
    type: String,
    required: false,
    trim: true
  },
  releaseDate: {
    type: Date,
    required: true,
    index: true
  },
  voteAverage: {
    type: Number,
    required: true,
    min: 0,
    max: 10,
    default: 0
  },
  voteCount: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  genres: [{
    type: Schema.Types.ObjectId,
    ref: 'Genre',
    required: true,
    index: true
  }]
}, {
  timestamps: true
});

// Create compound indexes for efficient queries
movieSchema.index({ tmdbId: 1, title: 1 });
movieSchema.index({ releaseDate: -1, voteAverage: -1 });
movieSchema.index({ genres: 1, voteAverage: -1 });

export const Movie = mongoose.model<IMovie>('Movie', movieSchema);
