import { Router } from 'express';
import genreController from '../controllers/genreController';

const router = Router();

/**
 * @route   GET /api/genres
 * @desc    Get all movie genres
 * @access  Public
 */
router.get('/', genreController.getAllGenres);

/**
 * @route   GET /api/genres/:id
 * @desc    Get a specific genre by ID
 * @access  Public
 */
router.get('/:id', genreController.getGenreById);

export default router; 