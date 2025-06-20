import mongoose from 'mongoose';
import { Group, IGroup } from '../models/Group';
import { User, IUser } from '../models/User';
import { groupService } from '../services/groupService';

describe('Group Service', () => {
  let testUser: IUser;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/test');
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Group.deleteMany({});

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
        ownerId: testUser._id.toString()
      };

      const result = await groupService.createGroup(groupData);

      expect(result).toBeDefined();
      expect(result.owner.toString()).toBe(testUser._id.toString());
      expect(result.members).toHaveLength(1);
      expect(result.members[0].toString()).toBe(testUser._id.toString());
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
}); 