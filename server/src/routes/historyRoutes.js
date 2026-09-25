import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { dbService } from '../services/dbService.js';

const router = express.Router();

// GET /api/history
router.get('/', verifyToken, async (req, res, next) => {
  try {
    const history = await dbService.getUserHistory(req.user.id);
    res.json({
      success: true,
      count: history.length,
      history
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/history/:id
router.delete('/:id', verifyToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    await dbService.deleteHistory(req.user.id, id);

    res.json({
      success: true,
      message: 'Search history entry deleted.'
    });
  } catch (err) {
    next(err);
  }
});

export default router;
