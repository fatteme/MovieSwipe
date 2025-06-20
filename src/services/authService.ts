import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User';
import { logger } from '../utils/logger';
import config from '../config/environment';

export interface GoogleUserInfo {
  googleId: string;
  email: string;
  name: string;
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

  private async verifyGoogleToken(googleToken: string): Promise<GoogleUserInfo> {
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken: googleToken,
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
        googleId: payload.sub,
        email: payload.email,
        name: payload.name,
      };
    } catch (error) {
      logger.error('Google token verification failed:', error);
      throw new Error('Invalid Google token');
    }
  }


  private async findOrCreateUser(googleUserInfo: GoogleUserInfo): Promise<IUser> {
    try {
      let user = await User.findOne({ googleId: googleUserInfo.googleId });

      if (!user) {
        user = new User(googleUserInfo);

        await user.save();
        logger.info(`New user created: ${user.email}`);
      } else {
        let needsUpdate = false;

        if (user.name !== googleUserInfo.name) {
          user.name = googleUserInfo.name;
          needsUpdate = true;
        }
        
        if (user.email !== googleUserInfo.email) {
          user.email = googleUserInfo.email;
          needsUpdate = true;
        }
        
        if (needsUpdate) {
          await user.save();
          logger.info(`User updated: ${user.email}`);
        }
      }

      return user;
    } catch (error) {
      logger.error('Error finding/creating user:', error);
      throw new Error('Failed to process user');
    }
  }


  private generateJWTToken(user: IUser): string {
    const payload = {
      userId: user._id,
      email: user.email,
      googleId: user.googleId
    };

    return jwt.sign(payload, config.JWT_SECRET);
  }


  async authenticateWithGoogle(googleToken: string): Promise<AuthResult> {
    try {
      const googleUserInfo = await this.verifyGoogleToken(googleToken);

      const user = await this.findOrCreateUser(googleUserInfo);

      const token = this.generateJWTToken(user);

      return { user, token };
    } catch (error) {
      logger.error('Authentication failed:', error);
      throw error;
    }
  }
}

export const authService = new AuthService(); 