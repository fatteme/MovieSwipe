import { Request, Response } from 'express';
import genreService from '../services/genreService';
import { logger } from '../utils/logger';

class GenreController {
  /**
   * Get all movie genres
   */
  async getAllGenres(_req: Request, res: Response): Promise<void> {
    try {
      logger.info('GET /genres - Fetching all genres');
      
      const genres = await genreService.getAllGenres();
      
      res.status(200).json({
        success: true,
        data: genres,
        message: 'Genres retrieved successfully'
      });
    } catch (error) {
      logger.error('Error in getAllGenres controller:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve genres',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get a specific genre by ID
   */
  async getGenreById(req: Request, res: Response): Promise<void> {
    try {
      const genreId = parseInt(req.params['id'] || '');
      
      if (isNaN(genreId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid genre ID provided'
        });
        return;
      }

      logger.info(`GET /genres/${genreId} - Fetching genre by ID`);
      
      const genre = await genreService.getGenreById(genreId);
      
      if (!genre) {
        res.status(404).json({
          success: false,
          message: 'Genre not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: genre,
        message: 'Genre retrieved successfully'
      });
    } catch (error) {
      logger.error('Error in getGenreById controller:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve genre',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

export default new GenreController(); 