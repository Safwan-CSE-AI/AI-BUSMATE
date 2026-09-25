import express from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';
import { dbService } from '../services/dbService.js';

const router = express.Router();

const AdminRouteSchema = z.object({
  body: z.object({
    route_number: z.string().min(1, 'Route number is required'),
    route_name: z.string().min(3, 'Route name is required'),
    origin_stop_id: z.string().min(1, 'Origin stop is required'),
    destination_stop_id: z.string().min(1, 'Destination stop is required'),
    bus_type: z.enum(['City Standard', 'City Express', 'AC Metro Feeder', 'Campus Shuttle', 'Night Special']).default('City Standard'),
    total_distance_km: z.number().min(0.1),
    estimated_duration_mins: z.number().int().min(1)
  })
});

const AdminStopSchema = z.object({
  body: z.object({
    code: z.string().min(2, 'Stop code is required (e.g. CBS-01)'),
    name: z.string().min(2, 'Stop name is required'),
    locality: z.string().min(2, 'Locality is required'),
    landmark: z.string().optional(),
    latitude: z.number().optional().default(12.9),
    longitude: z.number().optional().default(74.8),
    wheelchair_accessible: z.boolean().optional().default(true)
  })
});

const AdminScheduleSchema = z.object({
  body: z.object({
    route_id: z.string().min(1, 'Route ID is required'),
    departure_time: z.string().min(4, 'Departure time required (HH:MM)'),
    arrival_time: z.string().min(4, 'Arrival time required (HH:MM)'),
    frequency_mins: z.number().int().min(1).default(15),
    bus_plate_number: z.string().optional()
  })
});

// Admin stats
router.get('/stats', verifyToken, requireAdmin, async (req, res, next) => {
  try {
    const stats = await dbService.getAdminStats();
    res.json({
      success: true,
      stats
    });
  } catch (err) {
    next(err);
  }
});

// Add new route
router.post('/routes', verifyToken, requireAdmin, validate(AdminRouteSchema), async (req, res, next) => {
  try {
    const route = await dbService.adminAddRoute(req.body);
    res.status(201).json({
      success: true,
      message: 'Bus route created successfully!',
      route
    });
  } catch (err) {
    next(err);
  }
});

// Add new stop
router.post('/stops', verifyToken, requireAdmin, validate(AdminStopSchema), async (req, res, next) => {
  try {
    const stop = await dbService.adminAddStop(req.body);
    res.status(201).json({
      success: true,
      message: 'Bus stop added successfully!',
      stop
    });
  } catch (err) {
    next(err);
  }
});

// Add new schedule
router.post('/schedules', verifyToken, requireAdmin, validate(AdminScheduleSchema), async (req, res, next) => {
  try {
    const schedule = await dbService.adminAddSchedule(req.body);
    res.status(201).json({
      success: true,
      message: 'Bus schedule added successfully!',
      schedule
    });
  } catch (err) {
    next(err);
  }
});

export default router;
