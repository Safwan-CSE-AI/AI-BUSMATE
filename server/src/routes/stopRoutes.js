import express from 'express';
import { dbService } from '../services/dbService.js';

const router = express.Router();

// GET /api/stops
router.get('/', async (req, res, next) => {
  try {
    const { q } = req.query;
    const stops = await dbService.getAllStops(q ? String(q) : '');

    res.json({
      success: true,
      count: stops.length,
      stops
    });
  } catch (err) {
    next(err);
  }
});

export default router;
