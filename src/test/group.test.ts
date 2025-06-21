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
      // Use a valid ObjectId that does not exist in the database
      const nonExistentId = new mongoose.Types.ObjectId().toString();
      await expect(groupService.getGroupById(nonExistentId)).rejects.toThrow('Group not found');
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
}); 