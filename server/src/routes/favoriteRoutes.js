import express from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { verifyToken } from '../middleware/auth.js';
import { dbService } from '../services/dbService.js';

const router = express.Router();

const FavoritePlaceSchema = z.object({
  body: z.object({
    type: z.literal('place'),
    label: z.string().min(1, 'Place label is required (e.g. Home, College)'),
    stop_id: z.string().min(1, 'Stop ID is required'),
    custom_name: z.string().optional(),
    icon: z.string().optional().default('MapPin')
  })
});

const FavoriteRouteSchema = z.object({
  body: z.object({
    type: z.literal('route'),
    route_id: z.string().optional(),
    from_stop_id: z.string().min(1, 'Origin stop ID is required'),
    to_stop_id: z.string().min(1, 'Destination stop ID is required'),
    custom_label: z.string().optional()
  })
});

const AddFavoriteSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('place'),
    label: z.string().min(1),
    stop_id: z.string().min(1),
    custom_name: z.string().optional(),
    icon: z.string().optional()
  }),
  z.object({
    type: z.literal('route'),
    route_id: z.string().optional(),
    from_stop_id: z.string().min(1),
    to_stop_id: z.string().min(1),
    custom_label: z.string().optional()
  })
]);

// GET /api/favorites
router.get('/', verifyToken, async (req, res, next) => {
  try {
    const favorites = await dbService.getUserFavorites(req.user.id);
    res.json({
      success: true,
      favorites
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/favorites
router.post('/', verifyToken, async (req, res, next) => {
  try {
    const { type } = req.body;

    if (type === 'place') {
      const { label, stop_id, custom_name, icon } = req.body;
      if (!label || !stop_id) {
        return res.status(400).json({ success: false, error: 'label and stop_id are required for place' });
      }
      const item = await dbService.addFavoritePlace(req.user.id, {
        label,
        stop_id,
        custom_name,
        icon
      });
      return res.status(201).json({
        success: true,
        message: 'Saved place to favorites!',
        item
      });
    } else if (type === 'route') {
      const { route_id, from_stop_id, to_stop_id, custom_label } = req.body;
      if (!from_stop_id || !to_stop_id) {
        return res.status(400).json({ success: false, error: 'from_stop_id and to_stop_id are required for route' });
      }
      const item = await dbService.addFavoriteRoute(req.user.id, {
        route_id: route_id || null,
        from_stop_id,
        to_stop_id,
        custom_label
      });
      return res.status(201).json({
        success: true,
        message: 'Saved route to favorites!',
        item
      });
    }

    return res.status(400).json({
      success: false,
      error: 'Invalid favorite type. Must be "place" or "route".'
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/favorites/:id
router.delete('/:id', verifyToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    await dbService.deleteFavorite(req.user.id, id);

    res.json({
      success: true,
      message: 'Removed from favorites.'
    });
  } catch (err) {
    next(err);
  }
});

export default router;
