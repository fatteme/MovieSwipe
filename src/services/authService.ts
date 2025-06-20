import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User';
import { logger } from '../utils/logger';
import config from '../config/environment';

export interface GoogleUserInfo {
  sub: string; // Google ID
  email: string;
  name: string;
  picture?: string | undefined;
}

export interface AuthResult {
  user: IUser;
  token: string;
}

export class AuthService {
  private googleClient: OAuth2Client;

  constructor() {
    this.googleClient = new OAuth2Client(config.GOOGLE_CLIENT_ID);
  }

  /**
   * Verify Google ID token and extract user information
   */
  async verifyGoogleToken(idToken: string): Promise<GoogleUserInfo> {
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken,
        audience: config.GOOGLE_CLIENT_ID
      });

      const payload = ticket.getPayload();
      if (!payload) {
        throw new Error('Invalid token payload');
      }

      if (!payload.email || !payload.name) {
        throw new Error('Missing required user information from Google');
      }

      return {
        sub: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture
      };
    } catch (error) {
      logger.error('Google token verification failed:', error);
      throw new Error('Invalid Google token');
    }
  }

  /**
   * Find or create user based on Google information
   */
  async findOrCreateUser(googleUserInfo: GoogleUserInfo): Promise<IUser> {
    try {
      // Try to find existing user by Google ID
      let user = await User.findOne({ googleId: googleUserInfo.sub });

      if (!user) {
        // Create new user if not found
        user = new User({
          googleId: googleUserInfo.sub,
          email: googleUserInfo.email,
          name: googleUserInfo.name,
          picture: googleUserInfo.picture
        });

        await user.save();
        logger.info(`New user created: ${user.email}`);
      } else {
        // Update existing user's information
        user.name = googleUserInfo.name;
        if (googleUserInfo.picture) {
          user.picture = googleUserInfo.picture;
        }
        await user.save();
        logger.info(`User updated: ${user.email}`);
      }

      return user;
    } catch (error) {
      logger.error('Error finding/creating user:', error);
      throw new Error('Failed to process user');
    }
  }

  /**
   * Generate JWT token for user
   */
  generateJWTToken(user: IUser): string {
    const payload = {
      userId: user._id,
      email: user.email,
      googleId: user.googleId
    };

    return jwt.sign(payload, config.JWT_SECRET, {
      expiresIn: config.JWT_EXPIRES_IN
    });
  }

  /**
   * Main authentication method
   */
  async authenticateWithGoogle(idToken: string): Promise<AuthResult> {
    try {
      // Verify Google token
      const googleUserInfo = await this.verifyGoogleToken(idToken);

      // Find or create user
      const user = await this.findOrCreateUser(googleUserInfo);

      // Generate JWT token
      const token = this.generateJWTToken(user);

      return { user, token };
    } catch (error) {
      logger.error('Authentication failed:', error);
      throw error;
    }
  }
}

export const authService = new AuthService(); 