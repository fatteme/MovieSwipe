import { Request, Response } from 'express';
import movieService from '../services/movieService';
import { logger } from '../utils/logger';

class MovieController {
  async getAllGenres(_req: Request, res: Response): Promise<void> {
    try {
      logger.info('GET /movies/genres/db - Fetching genres from database');
      
      const genres = await movieService.getAllGenres();
      
      res.status(200).json({
        success: true,
        data: genres,
        message: 'Genres retrieved from database successfully'
      });
    } catch (error) {
      logger.error('Error in getGenresFromDatabase controller:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve genres from database',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

export default new MovieController(); 