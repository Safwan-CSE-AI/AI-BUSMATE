import express from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { optionalAuth } from '../middleware/auth.js';
import { searchLimiter } from '../middleware/rateLimiter.js';
import { findBusRoutes } from '../services/routeFinder.js';
import { generateRouteRecommendation } from '../services/geminiService.js';
import { dbService } from '../services/dbService.js';

const router = express.Router();

const SearchRouteSchema = z.object({
  body: z.object({
    originStopId: z.string().min(1, 'Origin bus stop is required'),
    destinationStopId: z.string().min(1, 'Destination bus stop is required'),
    travelTime: z.string().optional(),
    preference: z.enum(['Fastest', 'Cheapest', 'Fewest Transfers', 'Balanced']).default('Balanced'),
    maxTransfers: z.number().int().min(0).max(3).default(1),
    isStudent: z.boolean().optional()
  })
});

// POST /api/routes/search
router.post('/search', searchLimiter, optionalAuth, validate(SearchRouteSchema), async (req, res, next) => {
  try {
    const { originStopId, destinationStopId, travelTime, preference, maxTransfers, isStudent } = req.body;

    // Use user profile student status if user is logged in
    const isStudentUser = isStudent !== undefined ? isStudent : (req.user ? Boolean(req.user.is_student) : true);

    const candidateData = await findBusRoutes({
      originStopId,
      destinationStopId,
      travelTime,
      preference,
      maxTransfers,
      isStudent: isStudentUser
    });

    if (!candidateData.success) {
      return res.status(404).json({
        success: false,
        error: candidateData.error,
        recommendation: null,
        alternatives: [],
        warnings: [candidateData.error]
      });
    }

    // Call Gemini to generate grounded AI recommendation and student explanation
    const aiResult = await generateRouteRecommendation({
      candidateData,
      preference,
      isStudent: isStudentUser,
      travelTime
    });

    // Save to user search history if user is authenticated
    if (req.user) {
      try {
        await dbService.addSearchHistory(req.user.id, {
          origin_stop_id: candidateData.origin.id,
          destination_stop_id: candidateData.destination.id,
          preference,
          max_transfers: maxTransfers
        });
      } catch (e) {
        console.warn('Could not save search history:', e.message);
      }
    }

    // Enrich recommendation with detailed timeline steps from candidate route
    const bestRoute = candidateData.recommended;

    res.json({
      success: true,
      origin: candidateData.origin,
      destination: candidateData.destination,
      preference,
      isStudent: isStudentUser,
      recommendation: {
        ...aiResult.recommendation,
        id: bestRoute.id,
        routeId: bestRoute.routeId,
        busType: bestRoute.busType,
        distanceKm: bestRoute.distanceKm,
        stopsCount: bestRoute.stopsCount,
        intermediateStops: bestRoute.intermediateStops,
        steps: bestRoute.steps,
        legs: bestRoute.legs
      },
      alternatives: candidateData.alternatives.map((alt, idx) => {
        const aiAlt = aiResult.alternatives[idx];
        return {
          id: alt.id,
          routeId: alt.routeId,
          bus: alt.bus,
          busType: alt.busType,
          boardAt: alt.boardAt,
          getDownAt: alt.getDownAt,
          transferPoint: alt.transferPoint,
          transfers: alt.transfers,
          durationMinutes: alt.durationMinutes,
          distanceKm: alt.distanceKm,
          fare: alt.fare,
          studentFare: alt.studentFare,
          stopsCount: alt.stopsCount,
          intermediateStops: alt.intermediateStops,
          instructions: alt.instructions,
          aiExplanation: aiAlt?.aiExplanation || alt.instructions,
          steps: alt.steps,
          legs: alt.legs
        };
      }),
      warnings: aiResult.warnings || []
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/routes/:id
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const route = await dbService.getRouteById(id);

    if (!route) {
      return res.status(404).json({
        success: false,
        error: `Bus route with ID ${id} not found.`
      });
    }

    // Get feedback for this route
    const feedback = await dbService.getFeedbackByRoute(route.id);

    res.json({
      success: true,
      route,
      feedback
    });
  } catch (err) {
    next(err);
  }
});

export default router;
