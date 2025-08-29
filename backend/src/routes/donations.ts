import express, { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { supabase } from '../config/supabase.js';
import { authenticateToken, requireAdminOrTreasurer } from '../middleware/auth.js';
import { ValidationError } from '../middleware/errorHandler.js';
import { CreateDonationRequest, Donation, PaginatedResponse } from '../types/index.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Validation rules
const donationValidation = [
  body('donorName').trim().isLength({ min: 1 }).withMessage('Donor name is required'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('donationType').isIn(['tithe', 'offering', 'special', 'other']).withMessage('Valid donation type is required'),
  body('paymentMethod').isIn(['cash', 'mobile_money', 'bank_transfer']).withMessage('Valid payment method is required')
];

// @route   GET /api/donations
// @desc    Get all donations
// @access  Private
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 50, donationType, paymentMethod } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let query = supabase
      .from('donations')
      .select('*')
      .order('donation_date', { ascending: false });

    if (donationType) {
      query = query.eq('donation_type', donationType);
    }

    if (paymentMethod) {
      query = query.eq('payment_method', paymentMethod);
    }

    query = query.range(offset, offset + Number(limit) - 1);

    const { data: donations, error, count } = await query;

    if (error) {
      throw new Error(error.message);
    }

    const response: PaginatedResponse<Donation> = {
      success: true,
      data: donations || [],
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

// @route   POST /api/donations
// @desc    Record a new donation
// @access  Private (Admin/Treasurer)
router.post('/', requireAdminOrTreasurer, donationValidation, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError('Validation failed', errors.array());
    }

    const { donorName, amount, donationType, paymentMethod, notes }: CreateDonationRequest = req.body;

    const { data: donation, error } = await supabase
      .from('donations')
      .insert({
        donor_name: donorName,
        amount,
        donation_type: donationType,
        payment_method: paymentMethod,
        donation_date: new Date().toISOString(),
        notes
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    res.status(201).json({
      success: true,
      message: 'Donation recorded successfully',
      data: donation
    });
  } catch (error: any) {
    next(error);
  }
});

export default router;
