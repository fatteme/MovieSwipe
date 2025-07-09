# Add preferences and API for groups
_Exported on 7/8/2025 at 17:08:54 PDT from Cursor (1.2.2)_

---

**User**

each group member can have a prefrence which is a list of genres (that we hold in the db), lets add the corresponding properties as well as an api to add prefrences (\groups\preferences)

---

**Cursor**

I'll help you add member preferences to the Group model and create an API endpoint to manage them. Let me first examine the current structure and then implement the changes.


Now let me check the group service to understand the current implementation:


Now I'll implement the changes to add member preferences to the Group model and create the API endpoint. Let me start by updating the Group model:


```typescript
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
```

Now let me add the preferences endpoint to the group routes:


```typescript
import { Router } from 'express';
import { createGroup, getGroupById, getUserGroups, joinGroup, updateMemberPreferences } from '../controllers/groupController';

const router = Router();

/**
 * @route   POST /groups/
 * @desc    Create a new group
 */
router.post('/', createGroup);

/**
 * @route   POST /groups/join
 * @desc    Join a group using invitation code
 */
router.post('/join', joinGroup);

/**
 * @route   POST /groups/:groupId/preferences
 * @desc    Update member preferences for a group
 */
router.post('/:groupId/preferences', updateMemberPreferences);

/**
 * @route   GET /groups/:groupId
 * @desc    Get a specific group by ID (user must be a member)
 */
router.get('/:groupId', getGroupById);

/**
 * @route   GET /groups
 * @desc    Get all user's groups
 */
router.get('/', getUserGroups);

export default router;
```

Now I need to add the `updateMemberPreferences` controller function. Let me add it to the group controller:


```typescript
import { Response } from 'express';
import { groupService} from '../services/groupService';
import { logger } from '../utils/logger';
import { IGroup, IPopulatedGroup } from '../models';
import { AuthenticatedRequest } from '../middleware/auth';
import mongoose from 'mongoose';

export interface CreateGroupRequest extends AuthenticatedRequest {
   body: {}
}

export interface JoinGroupRequest extends AuthenticatedRequest {
  body: {
    invitationCode: string;
  };
}

export interface UpdatePreferencesRequest extends AuthenticatedRequest {
  params: {
    groupId: string;
  };
  body: {
    genreIds: string[];
  };
}

export interface GroupResponse {
  message: string;
  data?: IGroup | IPopulatedGroup | IPopulatedGroup[];
}

// ... existing code ...

export const updateMemberPreferences = async (req: UpdatePreferencesRequest, res: Response<GroupResponse>) => {
  try {
    const { groupId } = req.params;
    const { genreIds } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        message: 'User not authenticated'
      });
    }

    if (!groupId) {
      return res.status(400).json({
        message: 'Group ID is required'
      });
    }

    if (!genreIds || !Array.isArray(genreIds)) {
      return res.status(400).json({
        message: 'Genre IDs array is required'
      });
    }

    // Validate that all genre IDs are valid ObjectIds
    const validGenreIds = genreIds.filter(id => mongoose.Types.ObjectId.isValid(id));
    if (validGenreIds.length !== genreIds.length) {
      return res.status(400).json({
        message: 'Invalid genre ID format'
      });
    }

    const group = await groupService.updateMemberPreferences(groupId, userId.toString(), validGenreIds);

    return res.status(200).json({
      message: 'Member preferences updated successfully',
      data: group
    });

  } catch (error) {
    logger.error('Update member preferences error:', error);
    
    if (error instanceof Error) {
      if (error.message === 'Group not found') {
        return res.status(404).json({
          message: 'Group not found'
        });
      }
      
      if (error.message === 'User is not a member of this group') {
        return res.status(403).json({
          message: 'You are not a member of this group'
        });
      }

      if (error.message === 'Invalid genre IDs') {
        return res.status(400).json({
          message: 'One or more genre IDs are invalid'
        });
      }
    }

    return res.status(500).json({
      message: 'Internal server error'
    });
  }
};
```

Now I need to add the `updateMemberPreferences` method to the GroupService. Let me update the service:


```typescript
import mongoose from 'mongoose';
import { Group, IPopulatedGroup } from '../models/Group';
import { IUser, User } from '../models/User';
import { Genre } from '../models/Genre';
import { logger } from '../utils/logger';

// ... existing code ...

  async joinGroup(invitationCode: string, userId: mongoose.Types.ObjectId): Promise<IPopulatedGroup> {
    try {
      const group = await Group.findOne({ invitationCode });
      if (!group) {
        throw new Error('Invalid invitation code');
      }

      if (group.members.includes(userId)) {
        throw new Error('User is already a member of this group');
      }

      group.members.push(userId);
      await group.save();

      const populatedGroup = await Group.findById(group._id)
        .populate<{ owner: IUser }>('owner', 'name email')
        .populate<{ members: IUser[] }>('members', 'name email');
      
      if (!populatedGroup) {
        throw new Error('Failed to retrieve updated group');
      }

      logger.info(`User ${userId} joined group ${group._id}`);
      return populatedGroup;
    } catch (error) {
      logger.error('Error joining group:', error);
      throw error;
    }
  }

  async updateMemberPreferences(groupId: string, userId: string, genreIds: string[]): Promise<IPopulatedGroup> {
    try {
      const group = await Group.findById(groupId);
      if (!group) {
        throw new Error('Group not found');
      }

      // Check if user is a member of the group
      if (!group.members.includes(new mongoose.Types.ObjectId(userId))) {
        throw new Error('User is not a member of this group');
      }

      // Validate that all genre IDs exist in the database
      if (genreIds.length > 0) {
        const genres = await Genre.find({ _id: { $in: genreIds } });
        if (genres.length !== genreIds.length) {
          throw new Error('Invalid genre IDs');
        }
      }

      // Convert genre IDs to ObjectIds
      const genreObjectIds = genreIds.map(id => new mongoose.Types.ObjectId(id));

      // Update preferences for the user
      group.preferences.set(userId, genreObjectIds);
      await group.save();

      const populatedGroup = await Group.findById(group._id)
        .populate<{ owner: IUser }>('owner', 'name email')
        .populate<{ members: IUser[] }>('members', 'name email');
      
      if (!populatedGroup) {
        throw new Error('Failed to retrieve updated group');
      }

      logger.info(`User ${userId} updated preferences for group ${group._id}`);
      return populatedGroup;
    } catch (error) {
      logger.error('Error updating member preferences:', error);
      throw error;
    }
  }
}
```

Now let me also add a method to get member preferences and update the existing methods to populate preferences when needed. Let me also add a GET endpoint to retrieve preferences:


```typescript
import { Router } from 'express';
import { createGroup, getGroupById, getUserGroups, joinGroup, updateMemberPreferences, getMemberPreferences } from '../controllers/groupController';

const router = Router();

/**
 * @route   POST /groups/
 * @desc    Create a new group
 */
router.post('/', createGroup);

/**
 * @route   POST /groups/join
 * @desc    Join a group using invitation code
 */
router.post('/join', joinGroup);

/**
 * @route   POST /groups/:groupId/preferences
 * @desc    Update member preferences for a group
 */
router.post('/:groupId/preferences', updateMemberPreferences);

/**
 * @route   GET /groups/:groupId/preferences
 * @desc    Get member preferences for a group
 */
router.get('/:groupId/preferences', getMemberPreferences);

/**
 * @route   GET /groups/:groupId
 * @desc    Get a specific group by ID (user must be a member)
 */
router.get('/:groupId', getGroupById);

/**
 * @route   GET /groups
 * @desc    Get all user's groups
 */
router.get('/', getUserGroups);

export default router;
```

Let me add the `getMemberPreferences` controller function:


```typescript
// ... existing code ...

export const updateMemberPreferences = async (req: UpdatePreferencesRequest, res: Response<GroupResponse>) => {
  try {
    const { groupId } = req.params;
    const { genreIds } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        message: 'User not authenticated'
      });
    }

    if (!groupId) {
      return res.status(400).json({
        message: 'Group ID is required'
      });
    }

    if (!genreIds || !Array.isArray(genreIds)) {
      return res.status(400).json({
        message: 'Genre IDs array is required'
      });
    }

    // Validate that all genre IDs are valid ObjectIds
    const validGenreIds = genreIds.filter(id => mongoose.Types.ObjectId.isValid(id));
    if (validGenreIds.length !== genreIds.length) {
      return res.status(400).json({
        message: 'Invalid genre ID format'
      });
    }

    const group = await groupService.updateMemberPreferences(groupId, userId.toString(), validGenreIds);

    return res.status(200).json({
      message: 'Member preferences updated successfully',
      data: group
    });

  } catch (error) {
    logger.error('Update member preferences error:', error);
    
    if (error instanceof Error) {
      if (error.message === 'Group not found') {
        return res.status(404).json({
          message: 'Group not found'
        });
      }
      
      if (error.message === 'User is not a member of this group') {
        return res.status(403).json({
          message: 'You are not a member of this group'
        });
      }

      if (error.message === 'Invalid genre IDs') {
        return res.status(400).json({
          message: 'One or more genre IDs are invalid'
        });
      }
    }

    return res.status(500).json({
      message: 'Internal server error'
    });
  }
};

export const getMemberPreferences = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { groupId } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        message: 'User not authenticated'
      });
    }

    if (!groupId) {
      return res.status(400).json({
        message: 'Group ID is required'
      });
    }

    const preferences = await groupService.getMemberPreferences(groupId, userId.toString());

    return res.status(200).json({
      message: 'Member preferences retrieved successfully',
      data: preferences
    });

  } catch (error) {
    logger.error('Get member preferences error:', error);
    
    if (error instanceof Error) {
      if (error.message === 'Group not found') {
        return res.status(404).json({
          message: 'Group not found'
        });
      }
      
      if (error.message === 'User is not a member of this group') {
        return res.status(403).json({
          message: 'You are not a member of this group'
        });
      }
    }

    return res.status(500).json({
      message: 'Internal server error'
    });
  }
};
```

Now I need to add the `getMemberPreferences` method to the GroupService:


```typescript
  async updateMemberPreferences(groupId: string, userId: string, genreIds: string[]): Promise<IPopulatedGroup> {
    try {
      const group = await Group.findById(groupId);
      if (!group) {
        throw new Error('Group not found');
      }

      // Check if user is a member of the group
      if (!group.members.includes(new mongoose.Types.ObjectId(userId))) {
        throw new Error('User is not a member of this group');
      }

      // Validate that all genre IDs exist in the database
      if (genreIds.length > 0) {
        const genres = await Genre.find({ _id: { $in: genreIds } });
        if (genres.length !== genreIds.length) {
          throw new Error('Invalid genre IDs');
        }
      }

      // Convert genre IDs to ObjectIds
      const genreObjectIds = genreIds.map(id => new mongoose.Types.ObjectId(id));

      // Update preferences for the user
      group.preferences.set(userId, genreObjectIds);
      await group.save();

      const populatedGroup = await Group.findById(group._id)
        .populate<{ owner: IUser }>('owner', 'name email')
        .populate<{ members: IUser[] }>('members', 'name email');
      
      if (!populatedGroup) {
        throw new Error('Failed to retrieve updated group');
      }

      logger.info(`User ${userId} updated preferences for group ${group._id}`);
      return populatedGroup;
    } catch (error) {
      logger.error('Error updating member preferences:', error);
      throw error;
    }
  }

  async getMemberPreferences(groupId: string, userId: string): Promise<{ [key: string]: any[] }> {
    try {
      const group = await Group.findById(groupId);
      if (!group) {
        throw new Error('Group not found');
      }

      // Check if user is a member of the group
      if (!group.members.includes(new mongoose.Types.ObjectId(userId))) {
        throw new Error('User is not a member of this group');
      }

      // Get all preferences with populated genres
      const preferences: { [key: string]: any[] } = {};
      
      for (const [memberId, genreIds] of group.preferences.entries()) {
        if (genreIds && genreIds.length > 0) {
          const genres = await Genre.find({ _id: { $in: genreIds } }).select('_id name tmdbId');
          preferences[memberId] = genres;
        } else {
          preferences[memberId] = [];
        }
      }

      return preferences;
    } catch (error) {
      logger.error('Error getting member preferences:', error);
      throw error;
    }
  }
}
```

Now let me also update the existing group retrieval methods to optionally populate preferences. Let me update the `getGroupById` method to include preferences:


```typescript
  async getGroupById(groupId: string, includePreferences: boolean = false): Promise<IPopulatedGroup | null> {
    try {
      const group = await Group.findById(groupId)
        .populate('owner', 'name email')
        .populate('members', 'name email') as IPopulatedGroup | null;

      if (group && includePreferences) {
        // Populate preferences with genre details
        const preferencesWithGenres: { [key: string]: any[] } = {};
        
        for (const [memberId, genreIds] of group.preferences.entries()) {
          if (genreIds && genreIds.length > 0) {
            const genres = await Genre.find({ _id: { $in: genreIds } }).select('_id name tmdbId');
            preferencesWithGenres[memberId] = genres;
          } else {
            preferencesWithGenres[memberId] = [];
          }
        }
        
        // Add populated preferences to the group object
        (group as any).preferencesWithGenres = preferencesWithGenres;
      }

      return group;
    } catch (error) {
      logger.error('Error fetching group:', error);
      throw error;
    }
  }
```

Now let me update the controller to use the new parameter:


```typescript
export const getGroupById = async (req: AuthenticatedRequest, res: Response<GroupResponse>) => {
  try {
    const { groupId } = req.params;
    const { includePreferences } = req.query;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        message: 'User not authenticated'
      });
    }

    if (!groupId) {
      return res.status(400).json({
        message: 'Group ID is required'
      });
    }

    const group = await groupService.getGroupById(groupId, includePreferences === 'true');

    if (!group) {
      return res.status(404).json({
        message: 'Group not found'
      });
    }

    const isMember = group.members.some(member => member._id.toString() === userId.toString());
    if (!isMember) {
      return res.status(403).json({
        message: 'Access denied. You are not a member of this group.'
      });
    }

    return res.status(200).json({
      message: 'Group retrieved successfully',
      data: group
    });

  } catch (error) {
    logger.error('Get group error:', error);
    return res.status(500).json({
      message: 'Internal server error'
    });
  }
};
```

Now let me create a simple test to verify the implementation works. Let me also check if there are any existing tests to understand the testing pattern:


Let me add a test for the preferences functionality:


```typescript
import mongoose from 'mongoose';
import { Group, IGroup } from '../models/Group';
import { User, IUser } from '../models/User';
import { Genre, IGenre } from '../models/Genre';
import { groupService } from '../services/groupService';

describe('Group Service', () => {
  let testUser: IUser;
  let testGenres: IGenre[];

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/test');
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Group.deleteMany({});
    await Genre.deleteMany({});

    testUser = new User({
      googleId: 'test-google-id',
      email: 'test@example.com',
      name: 'Test User'
    });

    await testUser.save();

    // Create test genres
    testGenres = [
      new Genre({ tmdbId: 28, name: 'Action' }),
      new Genre({ tmdbId: 12, name: 'Adventure' }),
      new Genre({ tmdbId: 16, name: 'Animation' })
    ];
    await Genre.insertMany(testGenres);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  // ... existing tests ...

  describe('updateMemberPreferences', () => {
    it('should update member preferences successfully', async () => {
      const group = await groupService.createGroup({ ownerId: testUser._id.toString() });
      const genreIds = testGenres.map(genre => genre._id.toString());

      const result = await groupService.updateMemberPreferences(
        group._id.toString(),
        testUser._id.toString(),
        genreIds
      );

      expect(result).toBeDefined();
      expect(result.preferences.get(testUser._id.toString())).toHaveLength(3);
    });

    it('should throw error for non-existent group', async () => {
      await expect(groupService.updateMemberPreferences(
        new mongoose.Types.ObjectId().toString(),
        testUser._id.toString(),
        []
      )).rejects.toThrow('Group not found');
    });

    it('should throw error for non-member user', async () => {
      const group = await groupService.createGroup({ ownerId: testUser._id.toString() });
      const nonMemberId = new mongoose.Types.ObjectId().toString();

      await expect(groupService.updateMemberPreferences(
        group._id.toString(),
        nonMemberId,
        []
      )).rejects.toThrow('User is not a member of this group');
    });

    it('should throw error for invalid genre IDs', async () => {
      const group = await groupService.createGroup({ ownerId: testUser._id.toString() });
      const invalidGenreIds = [new mongoose.Types.ObjectId().toString()];

      await expect(groupService.updateMemberPreferences(
        group._id.toString(),
        testUser._id.toString(),
        invalidGenreIds
      )).rejects.toThrow('Invalid genre IDs');
    });
  });

  describe('getMemberPreferences', () => {
    it('should get member preferences successfully', async () => {
      const group = await groupService.createGroup({ ownerId: testUser._id.toString() });
      const genreIds = testGenres.map(genre => genre._id.toString());
      
      await groupService.updateMemberPreferences(
        group._id.toString(),
        testUser._id.toString(),
        genreIds
      );

      const preferences = await groupService.getMemberPreferences(
        group._id.toString(),
        testUser._id.toString()
      );

      expect(preferences).toBeDefined();
      expect(preferences[testUser._id.toString()]).toHaveLength(3);
      expect(preferences[testUser._id.toString()][0]).toHaveProperty('name');
      expect(preferences[testUser._id.toString()][0]).toHaveProperty('tmdbId');
    });

    it('should return empty preferences for members without preferences', async () => {
      const group = await groupService.createGroup({ ownerId: testUser._id.toString() });

      const preferences = await groupService.getMemberPreferences(
        group._id.toString(),
        testUser._id.toString()
      );

      expect(preferences).toBeDefined();
      expect(preferences[testUser._id.toString()]).toHaveLength(0);
    });
  });
});
```

Now let me run the tests to make sure everything is working correctly:


Let me fix the TypeScript errors in the test file:


```typescript
import mongoose from 'mongoose';
import { Group } from '../models/Group';
import { User, IUser } from '../models/User';
import { Genre, IGenre } from '../models/Genre';
import { groupService } from '../services/groupService';

describe('Group Service', () => {
  let testUser: IUser;
  let testGenres: IGenre[];

  beforeAll(async () => {
    await mongoose.connect(process.env['MONGODB_URI_TEST'] || 'mongodb://localhost:27017/test');
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Group.deleteMany({});
    await Genre.deleteMany({});

    testUser = new User({
      googleId: 'test-google-id',
      email: 'test@example.com',
      name: 'Test User'
    });

    await testUser.save();

    // Create test genres
    testGenres = [
      new Genre({ tmdbId: 28, name: 'Action' }),
      new Genre({ tmdbId: 12, name: 'Adventure' }),
      new Genre({ tmdbId: 16, name: 'Animation' })
    ];
    await Genre.insertMany(testGenres);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('createGroup', () => {
    it('should create a group with valid data', async () => {
      const groupData = {
        ownerId: testUser._id.toString()
      };

      const result = await groupService.createGroup(groupData);

      expect(result).toBeDefined();
      expect(result.owner.toString()).toBe(testUser._id.toString());
      expect(result.members).toHaveLength(1);
      expect(result.members[0]?.toString()).toBe(testUser._id.toString());
      expect(result.invitationCode).toHaveLength(8);
    });

    it('should throw error for non-existent owner', async () => {
      await expect(groupService.createGroup({
        ownerId: new mongoose.Types.ObjectId().toString()
      })).rejects.toThrow('User not found');
    });
  });

  describe('getGroupById', () => {
    it('should get a group by id', async () => {
      const group = await groupService.createGroup({ownerId:  testUser._id.toString()});
      const groupId = group._id.toString();
      
      const result = await groupService.getGroupById(groupId);
      const resultId = result?._id.toString();

      expect(result).toBeDefined();
      expect(resultId).toBeDefined();
      expect(resultId).toBe(groupId);
    });

    it('should throw error for non-existent group', async () => {
      await expect(groupService.getGroupById('non-existent-id')).rejects.toThrow('Group not found');
    });

    it('should throw error for invalid group id', async () => {
      await expect(groupService.getGroupById('invalid-id')).rejects.toThrow('Invalid group id');
    });

    it('should throw error for unauthorized access', async () => {
    });
  });

  describe('updateMemberPreferences', () => {
    it('should update member preferences successfully', async () => {
      const group = await groupService.createGroup({ ownerId: testUser._id.toString() });
      const genreIds = testGenres.map(genre => genre._id.toString());

      const result = await groupService.updateMemberPreferences(
        group._id.toString(),
        testUser._id.toString(),
        genreIds
      );

      expect(result).toBeDefined();
      expect(result.preferences.get(testUser._id.toString())).toHaveLength(3);
    });

    it('should throw error for non-existent group', async () => {
      await expect(groupService.updateMemberPreferences(
        new mongoose.Types.ObjectId().toString(),
        testUser._id.toString(),
        []
      )).rejects.toThrow('Group not found');
    });

    it('should throw error for non-member user', async () => {
      const group = await groupService.createGroup({ ownerId: testUser._id.toString() });
      const nonMemberId = new mongoose.Types.ObjectId().toString();

      await expect(groupService.updateMemberPreferences(
        group._id.toString(),
        nonMemberId,
        []
      )).rejects.toThrow('User is not a member of this group');
    });

    it('should throw error for invalid genre IDs', async () => {
      const group = await groupService.createGroup({ ownerId: testUser._id.toString() });
      const invalidGenreIds = [new mongoose.Types.ObjectId().toString()];

      await expect(groupService.updateMemberPreferences(
        group._id.toString(),
        testUser._id.toString(),
        invalidGenreIds
      )).rejects.toThrow('Invalid genre IDs');
    });
  });

  describe('getMemberPreferences', () => {
    it('should get member preferences successfully', async () => {
      const group = await groupService.createGroup({ ownerId: testUser._id.toString() });
      const genreIds = testGenres.map(genre => genre._id.toString());
      
      await groupService.updateMemberPreferences(
        group._id.toString(),
        testUser._id.toString(),
        genreIds
      );

      const preferences = await groupService.getMemberPreferences(
        group._id.toString(),
        testUser._id.toString()
      );

      expect(preferences).toBeDefined();
      expect(preferences[testUser._id.toString()]).toHaveLength(3);
      expect(preferences[testUser._id.toString()]?.[0]).toHaveProperty('name');
      expect(preferences[testUser._id.toString()]?.[0]).toHaveProperty('tmdbId');
    });

    it('should return empty preferences for members without preferences', async () => {
      const group = await groupService.createGroup({ ownerId: testUser._id.toString() });

      const preferences = await groupService.getMemberPreferences(
        group._id.toString(),
        testUser._id.toString()
      );

      expect(preferences).toBeDefined();
      expect(preferences[testUser._id.toString()]).toHaveLength(0);
    });
  });
});
```

Let me check what the actual issue is by looking at the specific lines:


Let me fix the specific issues:


```typescript
import mongoose from 'mongoose';
import { Group } from '../models/Group';
import { User, IUser } from '../models/User';
import { Genre, IGenre } from '../models/Genre';
import { groupService } from '../services/groupService';

describe('Group Service', () => {
  let testUser: IUser;
  let testGenres: IGenre[];

  beforeAll(async () => {
    await mongoose.connect(process.env['MONGODB_URI_TEST'] || 'mongodb://localhost:27017/test');
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Group.deleteMany({});
    await Genre.deleteMany({});

    testUser = new User({
      googleId: 'test-google-id',
      email: 'test@example.com',
      name: 'Test User'
    });

    await testUser.save();

    // Create test genres
    testGenres = [
      new Genre({ tmdbId: 28, name: 'Action' }),
      new Genre({ tmdbId: 12, name: 'Adventure' }),
      new Genre({ tmdbId: 16, name: 'Animation' })
    ];
    await Genre.insertMany(testGenres);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('createGroup', () => {
    it('should create a group with valid data', async () => {
      const groupData = {
        ownerId: testUser._id.toString()
      };

      const result = await groupService.createGroup(groupData);

      expect(result).toBeDefined();
      expect(result.owner.toString()).toBe(testUser._id.toString());
      expect(result.members).toHaveLength(1);
      expect(result.members[0]?.toString()).toBe(testUser._id.toString());
      expect(result.invitationCode).toHaveLength(8);
    });

    it('should throw error for non-existent owner', async () => {
      await expect(groupService.createGroup({
        ownerId: new mongoose.Types.ObjectId().toString()
      })).rejects.toThrow('User not found');
    });
  });

  describe('getGroupById', () => {
    it('should get a group by id', async () => {
      const group = await groupService.createGroup({ownerId:  testUser._id.toString()});
      const groupId = group._id.toString();
      
      const result = await groupService.getGroupById(groupId);
      const resultId = result?._id.toString();

      expect(result).toBeDefined();
      expect(resultId).toBeDefined();
      expect(resultId).toBe(groupId);
    });

    it('should throw error for non-existent group', async () => {
      await expect(groupService.getGroupById('non-existent-id')).rejects.toThrow('Group not found');
    });

    it('should throw error for invalid group id', async () => {
      await expect(groupService.getGroupById('invalid-id')).rejects.toThrow('Invalid group id');
    });

    it('should throw error for unauthorized access', async () => {
    });
  });

  describe('updateMemberPreferences', () => {
    it('should update member preferences successfully', async () => {
      const group = await groupService.createGroup({ ownerId: testUser._id.toString() });
      const genreIds = testGenres.map(genre => genre._id.toString());

      const result = await groupService.updateMemberPreferences(
        group._id.toString(),
        testUser._id.toString(),
        genreIds
      );

      expect(result).toBeDefined();
      expect(result.preferences.get(testUser._id.toString())).toHaveLength(3);
    });

    it('should throw error for non-existent group', async () => {
      await expect(groupService.updateMemberPreferences(
        new mongoose.Types.ObjectId().toString(),
        testUser._id.toString(),
        []
      )).rejects.toThrow('Group not found');
    });

    it('should throw error for non-member user', async () => {
      const group = await groupService.createGroup({ ownerId: testUser._id.toString() });
      const nonMemberId = new mongoose.Types.ObjectId().toString();

      await expect(groupService.updateMemberPreferences(
        group._id.toString(),
        nonMemberId,
        []
      )).rejects.toThrow('User is not a member of this group');
    });

    it('should throw error for invalid genre IDs', async () => {
      const group = await groupService.createGroup({ ownerId: testUser._id.toString() });
      const invalidGenreIds = [new mongoose.Types.ObjectId().toString()];

      await expect(groupService.updateMemberPreferences(
        group._id.toString(),
        testUser._id.toString(),
        invalidGenreIds
      )).rejects.toThrow('Invalid genre IDs');
    });
  });

  describe('getMemberPreferences', () => {
    it('should get member preferences successfully', async () => {
      const group = await groupService.createGroup({ ownerId: testUser._id.toString() });
      const genreIds = testGenres.map(genre => genre._id.toString());
      
      await groupService.updateMemberPreferences(
        group._id.toString(),
        testUser._id.toString(),
        genreIds
      );

      const preferences = await groupService.getMemberPreferences(
        group._id.toString(),
        testUser._id.toString()
      );

      expect(preferences).toBeDefined();
      expect(preferences[testUser._id.toString()]).toHaveLength(3);
      expect(preferences[testUser._id.toString()]?.[0]).toHaveProperty('name');
      expect(preferences[testUser._id.toString()]?.[0]).toHaveProperty('tmdbId');
    });

    it('should return empty preferences for members without preferences', async () => {
      const group = await groupService.createGroup({ ownerId: testUser._id.toString() });

      const preferences = await groupService.getMemberPreferences(
        group._id.toString(),
        testUser._id.toString()
      );

      expect(preferences).toBeDefined();
      expect(preferences[testUser._id.toString()]).toHaveLength(0);
    });
  });
});
```

Now let me run the tests again to see if they pass:


I need to fix several issues in the tests and service. Let me address them one by one:

1. First, let me fix the service to handle invalid ObjectIds properly:


```typescript
  async getGroupById(groupId: string, includePreferences: boolean = false): Promise<IPopulatedGroup | null> {
    try {
      // Validate ObjectId format
      if (!mongoose.Types.ObjectId.isValid(groupId)) {
        throw new Error('Invalid group id');
      }

      const group = await Group.findById(groupId)
        .populate('owner', 'name email')
        .populate('members', 'name email') as IPopulatedGroup | null;

      if (!group) {
        throw new Error('Group not found');
      }

      if (includePreferences) {
        // Populate preferences with genre details
        const preferencesWithGenres: { [key: string]: any[] } = {};
        
        for (const [memberId, genreIds] of group.preferences.entries()) {
          if (genreIds && genreIds.length > 0) {
            const genres = await Genre.find({ _id: { $in: genreIds } }).select('_id name tmdbId');
            preferencesWithGenres[memberId] = genres;
          } else {
            preferencesWithGenres[memberId] = [];
          }
        }
        
        // Add populated preferences to the group object
        (group as any).preferencesWithGenres = preferencesWithGenres;
      }

      return group;
    } catch (error) {
      logger.error('Error fetching group:', error);
      throw error;
    }
  }
```

2. Now let me fix the getMemberPreferences method to handle empty preferences properly:


```typescript
  async getMemberPreferences(groupId: string, userId: string): Promise<{ [key: string]: any[] }> {
    try {
      const group = await Group.findById(groupId);
      if (!group) {
        throw new Error('Group not found');
      }

      // Check if user is a member of the group
      if (!group.members.includes(new mongoose.Types.ObjectId(userId))) {
        throw new Error('User is not a member of this group');
      }

      // Get all preferences with populated genres
      const preferences: { [key: string]: any[] } = {};
      
      // Initialize preferences for all members (including those without preferences)
      for (const memberId of group.members) {
        const memberIdStr = memberId.toString();
        const genreIds = group.preferences.get(memberIdStr);
        
        if (genreIds && genreIds.length > 0) {
          const genres = await Genre.find({ _id: { $in: genreIds } }).select('_id name tmdbId');
          preferences[memberIdStr] = genres;
        } else {
          preferences[memberIdStr] = [];
        }
      }

      return preferences;
    } catch (error) {
      logger.error('Error getting member preferences:', error);
      throw error;
    }
  }
```

3. Now let me fix the test to handle the populated owner object correctly:


```typescript
  describe('createGroup', () => {
    it('should create a group with valid data', async () => {
      const groupData = {
        ownerId: testUser._id.toString()
      };

      const result = await groupService.createGroup(groupData);

      expect(result).toBeDefined();
      expect(result.owner._id.toString()).toBe(testUser._id.toString());
      expect(result.members).toHaveLength(1);
      expect(result.members[0]?._id.toString()).toBe(testUser._id.toString());
      expect(result.invitationCode).toHaveLength(8);
    });

    it('should throw error for non-existent owner', async () => {
      await expect(groupService.createGroup({
        ownerId: new mongoose.Types.ObjectId().toString()
      })).rejects.toThrow('User not found');
    });
  });
```

Now let me run the tests again to see if they pass:


```typescript
    it('should throw error for non-existent group', async () => {
      // Use a valid ObjectId that does not exist in the database
      const nonExistentId = new mongoose.Types.ObjectId().toString();
      await expect(groupService.getGroupById(nonExistentId)).rejects.toThrow('Group not found');
    });
```

All tests are now passing and the new group member preferences feature (with API endpoints and model changes) is fully implemented and tested.

**Summary of changes:**
- Added a `preferences` field to the `Group` model, mapping user IDs to arrays of genre IDs.
- Added POST `/groups/:groupId/preferences` to set a member's preferences.
- Added GET `/groups/:groupId/preferences` to retrieve all members' preferences (populated with genre info).
- Updated the service and controller logic to support these features.
- Added and fixed tests to cover the new functionality.

You can now use these endpoints to manage and retrieve group member genre preferences! If you need further adjustments or want to see example requests, let me know.

