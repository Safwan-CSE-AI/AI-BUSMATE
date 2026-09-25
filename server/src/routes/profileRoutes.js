import express from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { verifyToken } from '../middleware/auth.js';
import { dbService } from '../services/dbService.js';

const router = express.Router();

const UpdateProfileSchema = z.object({
  body: z.object({
    full_name: z.string().min(2).optional(),
    phone_number: z.string().optional(),
    preferred_mode: z.enum(['Fastest', 'Cheapest', 'Fewest Transfers', 'Balanced']).optional(),
    is_student: z.boolean().optional(),
    student_id: z.string().optional(),
    avatar_url: z.string().optional()
  })
});

// GET /api/profile
router.get('/', verifyToken, async (req, res, next) => {
  try {
    const user = await dbService.findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User profile not found.' });
    }
    const safe = { ...user };
    delete safe.password_hash;
    res.json({
      success: true,
      profile: safe
    });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/profile
router.patch('/', verifyToken, validate(UpdateProfileSchema), async (req, res, next) => {
  try {
    const updated = await dbService.updateUserProfile(req.user.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'User profile not found.' });
    }
    const safe = { ...updated };
    delete safe.password_hash;
    res.json({
      success: true,
      message: 'Profile updated successfully!',
      profile: safe
    });
  } catch (err) {
    next(err);
  }
});

export default router;
