import request from 'supertest';
import express from 'express';
import genreRoutes from '../routes/genres';

const app = express();
app.use('/genres', genreRoutes);

describe('Genre API', () => {
  describe('GET /genres', () => {
    it('should return all genres', async () => {
      const response = await request(app)
        .get('/genres')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /genres/:id', () => {
    it('should return 400 for invalid genre ID', async () => {
      const response = await request(app)
        .get('/genres/invalid')
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Invalid genre ID provided');
    });

    it('should return 404 for non-existent genre ID', async () => {
      const response = await request(app)
        .get('/genres/999999')
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Genre not found');
    });
  });
}); 