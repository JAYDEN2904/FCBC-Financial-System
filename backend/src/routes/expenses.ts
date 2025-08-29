import express, { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { supabase } from '../config/supabase.js';
import { authenticateToken, requireAdminOrTreasurer } from '../middleware/auth.js';
import { ValidationError } from '../middleware/errorHandler.js';
import { CreateExpenseRequest, Expense, PaginatedResponse } from '../types/index.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Validation rules
const expenseValidation = [
  body('category').trim().isLength({ min: 1 }).withMessage('Category is required'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('description').trim().isLength({ min: 1 }).withMessage('Description is required'),
  body('expenseDate').isISO8601().withMessage('Valid expense date is required')
];

// @route   GET /api/expenses
// @desc    Get all expenses
// @access  Private
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 50, category } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let query = supabase
      .from('expenses')
      .select('*')
      .order('expense_date', { ascending: false });

    if (category) {
      query = query.eq('category', category);
    }

    query = query.range(offset, offset + Number(limit) - 1);

    const { data: expenses, error, count } = await query;

    if (error) {
      throw new Error(error.message);
    }

    const response: PaginatedResponse<Expense> = {
      success: true,
      data: expenses || [],
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

// @route   POST /api/expenses
// @desc    Record a new expense
// @access  Private (Admin/Treasurer)
router.post('/', requireAdminOrTreasurer, expenseValidation, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError('Validation failed', errors.array());
    }

    const { category, amount, description, expenseDate, receiptUrl }: CreateExpenseRequest = req.body;

    const { data: expense, error } = await supabase
      .from('expenses')
      .insert({
        category,
        amount,
        description,
        expense_date: expenseDate,
        receipt_url: receiptUrl
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    res.status(201).json({
      success: true,
      message: 'Expense recorded successfully',
      data: expense
    });
  } catch (error: any) {
    next(error);
  }
});

export default router;
