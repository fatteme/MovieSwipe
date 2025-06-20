import mongoose from 'mongoose';
import { Group, IGroup } from '../models/Group';
import { User, IUser } from '../models/User';
import { groupService } from '../services/groupService';

describe('Group Service', () => {
  let testUser: IUser;
  let testGroup: IGroup;

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/test');
  });

  beforeEach(async () => {
    // Clear collections
    await User.deleteMany({});
    await Group.deleteMany({});

    // Create test user
    testUser = new User({
      googleId: 'test-google-id',
      email: 'test@example.com',
      name: 'Test User'
    });
    await testUser.save();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('createGroup', () => {
    it('should create a group with valid data', async () => {
      const groupData = {
        name: 'Test Group',
        ownerId: testUser._id.toString()
      };

      const result = await groupService.createGroup(groupData);

      expect(result.group).toBeDefined();
      expect(result.group.name).toBe('Test Group');
      expect(result.group.owner.toString()).toBe(testUser._id.toString());
      expect(result.group.members).toHaveLength(1);
      expect(result.group.members[0].toString()).toBe(testUser._id.toString());
      expect(result.group.invitationCode).toHaveLength(8);
    });

    it('should throw error for non-existent owner', async () => {
      const groupData = {
        name: 'Test Group',
        ownerId: new mongoose.Types.ObjectId().toString()
      };

      await expect(groupService.createGroup(groupData)).rejects.toThrow('Owner not found');
    });
  });

  describe('joinGroupByInvitationCode', () => {
    beforeEach(async () => {
      // Create a test group
      const groupData = {
        name: 'Test Group',
        ownerId: testUser._id.toString()
      };
      const result = await groupService.createGroup(groupData);
      testGroup = result.group;
    });

    it('should allow user to join group with valid invitation code', async () => {
      const newUser = new User({
        googleId: 'new-user-google-id',
        email: 'newuser@example.com',
        name: 'New User'
      });
      await newUser.save();

      const result = await groupService.joinGroupByInvitationCode(
        testGroup.invitationCode,
        newUser._id.toString()
      );

      expect(result.group.members).toHaveLength(2);
      expect(result.group.members.map(m => m.toString())).toContain(newUser._id.toString());
    });

    it('should throw error for invalid invitation code', async () => {
      const newUser = new User({
        googleId: 'new-user-google-id',
        email: 'newuser@example.com',
        name: 'New User'
      });
      await newUser.save();

      await expect(
        groupService.joinGroupByInvitationCode('INVALID', newUser._id.toString())
      ).rejects.toThrow('Invalid invitation code');
    });

    it('should throw error if user is already a member', async () => {
      await expect(
        groupService.joinGroupByInvitationCode(testGroup.invitationCode, testUser._id.toString())
      ).rejects.toThrow('User is already a member of this group');
    });
  });
}); 