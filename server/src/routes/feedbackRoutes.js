import express from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { verifyToken } from '../middleware/auth.js';
import { dbService } from '../services/dbService.js';

const router = express.Router();

const FeedbackSchema = z.object({
  body: z.object({
    route_id: z.string().min(1, 'Route ID is required'),
    rating: z.number().int().min(1).max(5, 'Rating must be between 1 and 5'),
    crowd_level: z.enum(['Low', 'Moderate', 'High', 'Packed']).default('Moderate'),
    punctuality_status: z.enum(['On Time', 'Slightly Delayed', 'Heavily Delayed', 'Early']).default('On Time'),
    comment: z.string().max(500, 'Comment too long').optional().default('')
  })
});

// POST /api/feedback
router.post('/', verifyToken, validate(FeedbackSchema), async (req, res, next) => {
  try {
    const { route_id, rating, crowd_level, punctuality_status, comment } = req.body;

    const feedback = await dbService.addFeedback(req.user.id, {
      route_id,
      rating,
      crowd_level,
      punctuality_status,
      comment
    });

    res.status(201).json({
      success: true,
      message: 'Thank you for your transit feedback!',
      feedback
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/feedback/route/:routeId
router.get('/route/:routeId', async (req, res, next) => {
  try {
    const feedbackList = await dbService.getFeedbackByRoute(req.params.routeId);
    res.json({
      success: true,
      feedback: feedbackList
    });
  } catch (err) {
    next(err);
  }
});

export default router;
