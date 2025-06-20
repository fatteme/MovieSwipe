import axios from 'axios';
import config from '../config/environment';
import { logger } from '../utils/logger';
import { Genre, IGenre } from '../models';

interface TMDBGenre {
  id: number;
  name: string;
}

interface TMDBGenresResponse {
  genres: TMDBGenre[];
}

class MovieService {
  private readonly baseURL = 'https://api.themoviedb.org/3';
  private readonly apiKey = config.TMDB_API_KEY;

  private async getAllTMDBGenres(): Promise<IGenre[]> {
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
    
      const genres = response.data.genres.map((genre) => (new Genre({
        tmdbId: genre.id,
        name: genre.name
      })));

      await Genre.bulkSave(genres);

      logger.info(`Successfully saved/updated ${genres.length} genres in database`);
      return genres;
    } catch (error) {
      logger.error('Error fetching genres from TMDB:', error);
      throw new Error('Failed to fetch genres from TMDB');
    }
  }

  async getAllGenres(): Promise<IGenre[]> {
    try {
      logger.info('Fetching all genres from database');
      
      let genres: IGenre[] = await Genre.find().sort({ name: 1 });

      if (genres.length === 0) {
        genres = await this.getAllTMDBGenres();
      }

      logger.info(`Successfully fetched ${genres.length} genres from database`);
      return genres;
    } catch (error) {
      logger.error('Error fetching genres from database:', error);
      throw new Error('Failed to fetch genres from database');
    }
  }
}

export default new MovieService(); 