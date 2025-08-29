import express, { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { supabase } from '../config/supabase.js';
import { authenticateToken, requireAdminOrTreasurer } from '../middleware/auth.js';
import { ValidationError, NotFoundError } from '../middleware/errorHandler.js';
import { CreatePaymentRequest, Payment, PaginatedResponse } from '../types/index.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Validation rules
const paymentValidation = [
  body('memberId').isUUID().withMessage('Valid member ID is required'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('method').isIn(['cash', 'mobile_money', 'bank_transfer']).withMessage('Valid payment method is required'),
  body('monthsPaid').isArray().withMessage('Months paid must be an array'),
  body('isAdvancePayment').optional().isBoolean().withMessage('Advance payment must be boolean')
];

// @route   GET /api/payments
// @desc    Get all payments with optional filtering
// @access  Private
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { memberId, method, startDate, endDate, page = 1, limit = 50 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let query = supabase
      .from('payments')
      .select(`
        *,
        members(name, email, phone)
      `)
      .order('payment_date', { ascending: false });

    // Apply filters
    if (memberId) {
      query = query.eq('member_id', memberId);
    }

    if (method) {
      query = query.eq('method', method);
    }

    if (startDate) {
      query = query.gte('payment_date', startDate);
    }

    if (endDate) {
      query = query.lte('payment_date', endDate);
    }

    // Apply pagination
    query = query.range(offset, offset + Number(limit) - 1);

    const { data: payments, error, count } = await query;

    if (error) {
      throw new Error(error.message);
    }

    const response: PaginatedResponse<Payment> = {
      success: true,
      data: payments || [],
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

// @route   POST /api/payments
// @desc    Record a new payment
// @access  Private (Admin/Treasurer)
router.post('/', requireAdminOrTreasurer, paymentValidation, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError('Validation failed', errors.array());
    }

    const { memberId, amount, method, monthsPaid, isAdvancePayment = false, notes }: CreatePaymentRequest = req.body;

    // Create payment record
    const { data: payment, error } = await supabase
      .from('payments')
      .insert({
        member_id: memberId,
        amount,
        method,
        payment_date: new Date().toISOString(),
        is_advance_payment: isAdvancePayment,
        notes,
        months_paid: monthsPaid
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    // Update member's total paid
    const { data: memberData } = await supabase
      .from('members')
      .select('total_paid')
      .eq('id', memberId)
      .single();

    const newTotalPaid = (memberData?.total_paid || 0) + parseFloat(amount.toString());

    await supabase
      .from('members')
      .update({ total_paid: newTotalPaid })
      .eq('id', memberId);

    res.status(201).json({
      success: true,
      message: 'Payment recorded successfully',
      data: payment
    });
  } catch (error: any) {
    next(error);
  }
});

export default router;
