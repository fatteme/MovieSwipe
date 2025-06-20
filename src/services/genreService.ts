import axios from 'axios';
import config from '../config/environment';
import { logger } from '../utils/logger';

interface TMDBGenre {
  id: number;
  name: string;
}

interface TMDBGenresResponse {
  genres: TMDBGenre[];
}

class GenreService {
  private readonly baseURL = 'https://api.themoviedb.org/3';
  private readonly apiKey = config.TMDB_API_KEY;

  /**
   * Get all movie genres from TMDB
   */
  async getAllGenres(): Promise<TMDBGenre[]> {
    try {
      logger.info('Fetching genres from TMDB');
      
      const response = await axios.get<TMDBGenresResponse>(
        `${this.baseURL}/genre/movie/list`,
        {
          params: {
            api_key: this.apiKey,
            language: 'en-US'
          }
        }
      );

      logger.info(`Successfully fetched ${response.data.genres.length} genres from TMDB`);
      return response.data.genres;
    } catch (error) {
      logger.error('Error fetching genres from TMDB:', error);
      throw new Error('Failed to fetch genres from TMDB');
    }
  }

  /**
   * Get a specific genre by ID
   */
  async getGenreById(genreId: number): Promise<TMDBGenre | null> {
    try {
      logger.info(`Fetching genre with ID ${genreId} from TMDB`);
      
      const allGenres = await this.getAllGenres();
      const genre = allGenres.find(g => g.id === genreId);
      
      if (!genre) {
        logger.warn(`Genre with ID ${genreId} not found`);
        return null;
      }

      return genre;
    } catch (error) {
      logger.error(`Error fetching genre with ID ${genreId}:`, error);
      throw new Error('Failed to fetch genre from TMDB');
    }
  }
}

export default new GenreService(); 