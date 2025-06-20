// Authentication controller 
import { Request, Response } from 'express';
import { authService } from '../services/authService';
import { logger } from '../utils/logger';

export interface GoogleAuthRequest extends Request {
  body: {
    idToken: string;
  };
}

/**
 * Google authentication endpoint
 * POST /auth/google
 */
export const googleAuth = async (req: GoogleAuthRequest, res: Response) => {
  try {
    const { idToken } = req.body;

    // Validate request
    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: 'Google ID token is required'
      });
    }

    // Authenticate with Google
    const authResult = await authService.authenticateWithGoogle(idToken);

    // Return success response
    res.status(200).json({
      success: true,
      message: 'Authentication successful',
      data: {
        user: {
          id: authResult.user._id,
          email: authResult.user.email,
          name: authResult.user.name,
          picture: authResult.user.picture
        },
        token: authResult.token
      }
    });

  } catch (error) {
    logger.error('Google authentication error:', error);
    
    if (error instanceof Error) {
      if (error.message === 'Invalid Google token') {
        return res.status(401).json({
          success: false,
          message: 'Invalid Google token'
        });
      }
      
      if (error.message === 'Failed to process user') {
        return res.status(500).json({
          success: false,
          message: 'Failed to process user information'
        });
      }
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}; 