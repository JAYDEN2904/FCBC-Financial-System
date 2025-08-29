import express, { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { supabase } from '../config/supabase.js';
import { authenticateToken, requireAdminOrTreasurer } from '../middleware/auth.js';
import { ValidationError } from '../middleware/errorHandler.js';
import { CreateReminderRequest, Reminder, PaginatedResponse } from '../types/index.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// @route   GET /api/reminders
// @desc    Get all reminders
// @access  Private
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 50, status } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let query = supabase
      .from('reminders')
      .select(`
        *,
        members(name, phone)
      `)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    query = query.range(offset, offset + Number(limit) - 1);

    const { data: reminders, error, count } = await query;

    if (error) {
      throw new Error(error.message);
    }

    const response: PaginatedResponse<Reminder> = {
      success: true,
      data: reminders || [],
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count || 0,
        totalPages: Math.ceil((count || 0) / Number(limit))
      }
    };

    res.json(response);
  } catch (error: any) {
    next(error);
  }
});

// @route   POST /api/reminders
// @desc    Create a new reminder
// @access  Private (Admin/Treasurer)
router.post('/', requireAdminOrTreasurer, [
  body('memberId').isUUID().withMessage('Valid member ID is required'),
  body('message').trim().isLength({ min: 1 }).withMessage('Message is required')
], async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError('Validation failed', errors.array());
    }

    const { memberId, message }: CreateReminderRequest = req.body;

    const { data: reminder, error } = await supabase
      .from('reminders')
      .insert({
        member_id: memberId,
        message,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    res.status(201).json({
      success: true,
      message: 'Reminder created successfully',
      data: reminder
    });
  } catch (error: any) {
    next(error);
  }
});

export default router;
