import express from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { verifyToken, generateToken } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { dbService } from '../services/dbService.js';

const router = express.Router();

const RegisterSchema = z.object({
  body: z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    full_name: z.string().min(2, 'Full name is required'),
    is_student: z.boolean().optional().default(true),
    student_id: z.string().optional().default('')
  })
});

const LoginSchema = z.object({
  body: z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(1, 'Password is required')
  })
});

// POST /api/auth/register
router.post('/register', authLimiter, validate(RegisterSchema), async (req, res, next) => {
  try {
    const { email, password, full_name, is_student, student_id } = req.body;

    const existing = await dbService.findUserByEmail(email);
    if (existing) {
      return res.status(400).json({
        success: false,
        error: 'An account with this email already exists. Please log in.'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const newUser = await dbService.createUser({
      email,
      password_hash,
      full_name,
      is_student,
      student_id
    });

    const token = generateToken(newUser);

    const safeUser = { ...newUser };
    delete safeUser.password_hash;

    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      token,
      user: safeUser
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login
router.post('/login', authLimiter, validate(LoginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await dbService.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password.'
      });
    }

    const token = generateToken(user);

    const safeUser = { ...user };
    delete safeUser.password_hash;

    res.json({
      success: true,
      message: 'Welcome back!',
      token,
      user: safeUser
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me
router.get('/me', verifyToken, async (req, res) => {
  const safeUser = { ...req.user };
  delete safeUser.password_hash;
  res.json({
    success: true,
    user: safeUser
  });
});

export default router;
