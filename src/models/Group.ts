import mongoose, { Document, Schema } from 'mongoose';

// TypeScript interfaces
export interface IGroup extends Document {
  name: string;
  owner: mongoose.Types.ObjectId;
  members: mongoose.Types.ObjectId[];
  invitationCode: string;
  createdAt: Date;
  updatedAt: Date;
}

// Mongoose schema
const groupSchema = new Schema<IGroup>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  members: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    index: true
  }],
  invitationCode: {
    type: String,
    required: true,
    unique: true,
    index: true,
    minlength: 6,
    maxlength: 10
  }
}, {
  timestamps: true
});

// Ensure owner is always included in members
groupSchema.pre('save', function(next) {
  if (!this.members.includes(this.owner)) {
    this.members.push(this.owner);
  }
  next();
});

export const Group = mongoose.model<IGroup>('Group', groupSchema); 