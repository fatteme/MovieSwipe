import { Router } from 'express';
import movieController from '../controllers/movieController';

const router = Router();

/**
 * @route   GET /movies/genres
 * @desc    Get all movie genres from TMDB and sync with database
 * @access  Private
 */
router.get('/genres', movieController.getAllGenres);

export default router; 