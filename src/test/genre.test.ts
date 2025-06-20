import request from 'supertest';
import express from 'express';
import movieRoutes from '../routes/movies';

const app = express();
app.use('/movies', movieRoutes);

describe('Movie Genre API', () => {
  describe('GET /movies/genres', () => {
    it('should return all genres from TMDB and sync with database', async () => {
      const response = await request(app)
        .get('/movies/genres')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.message).toBe('Genres retrieved and synced successfully');
    });
  });
}); 