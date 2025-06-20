import { Request, Response } from 'express';
import { AuthResult, authService, RefreshTokenResult } from '../services/authService';
import { logger } from '../utils/logger';

export interface GoogleAuthRequest extends Request {
  body: {
    googleToken: string;
  };
}

export interface GoogleAuthResponse {
  message: string;
  data?: AuthResult;
}

export const googleAuth = async (req: GoogleAuthRequest, res: Response<GoogleAuthResponse>) => {
  try {
    const { googleToken } = req.body;

    if (!googleToken) {
      return res.status(400).json({
        message: 'Google ID token is required'
      });
    }

    const data = await authService.authenticateWithGoogle(googleToken);

    return res.status(200).json({
      message: 'Authentication successful',
      data,
    });

  } catch (error) {
    logger.error('Google authentication error:', error);
    
    if (error instanceof Error) {
      if (error.message === 'Invalid Google token') {
        return res.status(401).json({
          message: 'Invalid Google token'
        });
      }
      
      if (error.message === 'Failed to process user') {
        return res.status(500).json({
          message: 'Failed to process user information'
        });
      }
    }

    return res.status(500).json({
      message: 'Internal server error'
    });
  }
};


export interface RefreshTokenRequest extends Request {
  body: {
    refreshToken: string;
  };
}

export interface RefreshTokenResponse {
  message: string;
  data?: RefreshTokenResult;
}

export const refreshToken = async (req: RefreshTokenRequest, res: Response<RefreshTokenResponse>) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token is required' });
    }

    const result = await authService.refreshAccessToken(refreshToken);

    return res.status(200).json({
      message: 'Token refreshed successfully',
      data: result,
    });
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}; 