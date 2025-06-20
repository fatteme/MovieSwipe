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
  refreshToken: string;
}

export interface RefreshTokenResult {
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

  private generateAccessToken(user: IUser): string {
    return jwt.sign(user.toJSON(), config.ACCESS_TOKEN_SECRET, { expiresIn: '1d' });
  }

  private generateRefreshToken(user: IUser): string {
    return jwt.sign(user.toJSON(), config.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
  }

  async authenticateWithGoogle(googleToken: string): Promise<AuthResult> {
    try {
      const googleUserInfo = await this.verifyGoogleToken(googleToken);

      const user = await this.findOrCreateUser(googleUserInfo);

      const token = this.generateAccessToken(user);
      const refreshToken = this.generateRefreshToken(user);

      return { user, token, refreshToken };
    } catch (error) {
      logger.error('Authentication failed:', error);
      throw error;
    }
  }

  async refreshAccessToken(refreshToken: string): Promise<RefreshTokenResult> {
    try {
      const payload = jwt.verify(refreshToken, config.REFRESH_TOKEN_SECRET) as IUser;
      const user = await User.findById(payload._id);
      
      if (!user) throw new Error('User not found');

      const token = this.generateAccessToken(user);

      return { token };
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }
  }
}

export const authService = new AuthService(); 