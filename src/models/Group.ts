import mongoose, { Document, Schema } from 'mongoose';

// TypeScript interfaces
export interface IGroup extends Document {
  _id: mongoose.Types.ObjectId;
  owner: mongoose.Types.ObjectId;
  members: mongoose.Types.ObjectId[];
  invitationCode: string;
  preferences: Map<string, mongoose.Types.ObjectId[]>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPopulatedGroup extends Omit<IGroup, 'owner' | 'members'> {
  owner: {
    _id: mongoose.Types.ObjectId;
    name: string;
    email: string;
  };
  members: Array<{
    _id: mongoose.Types.ObjectId;
    name: string;
    email: string;
  }>;
}

// Mongoose schema
const groupSchema = new Schema<IGroup>({
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
  },
  preferences: {
    type: Map,
    of: [{
      type: Schema.Types.ObjectId,
      ref: 'Genre'
    }],
    default: new Map()
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