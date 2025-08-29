import express, { Request, Response, NextFunction } from 'express';
import { body, query, validationResult } from 'express-validator';
import { supabase, handleSupabaseError } from '../config/supabase.js';
import { authenticateToken, requireAdminOrTreasurer } from '../middleware/auth.js';
import { ValidationError, NotFoundError } from '../middleware/errorHandler.js';
import { CreateMemberRequest, UpdateMemberRequest, Member, PaginatedResponse } from '../types/index.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Validation rules
const memberValidation = [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('phone').trim().isLength({ min: 10 }).withMessage('Valid phone number is required'),
  body('status').optional().isIn(['active', 'inactive', 'suspended']).withMessage('Invalid status')
];

// @route   GET /api/members
// @desc    Get all members with optional filtering
// @access  Private
router.get('/', [
  query('status').optional().isIn(['active', 'inactive', 'suspended']),
  query('search').optional().trim().isLength({ min: 1 }),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError('Validation failed', errors.array());
    }

    const { status, search, page = 1, limit = 50 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let query = supabase
      .from('members')
      .select(`
        *,
        member_owing_months(month, amount),
        member_credit_months(month, amount)
      `)
      .order('created_at', { ascending: false });

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
    }

    // Apply pagination
    query = query.range(offset, offset + Number(limit) - 1);

    const { data: members, error, count } = await query;

    if (error) {
      throw new Error(error.message);
    }

    // Transform data to include owing and credit months
    const transformedMembers = members?.map((member: any) => ({
      ...member,
      owingMonths: member.member_owing_months?.map((om: any) => om.month) || [],
      creditMonths: member.member_credit_months?.map((cm: any) => cm.month) || []
    })) || [];

    const response: PaginatedResponse<Member> = {
      success: true,
      data: transformedMembers,
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

// @route   GET /api/members/:id
// @desc    Get member by ID
// @access  Private
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const { data: member, error } = await supabase
      .from('members')
      .select(`
        *,
        member_owing_months(month, amount),
        member_credit_months(month, amount),
        payments(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new NotFoundError('Member not found');
      }
      throw new Error(error.message);
    }

    // Transform data
    const transformedMember = {
      ...member,
      owingMonths: member.member_owing_months?.map((om: any) => om.month) || [],
      creditMonths: member.member_credit_months?.map((cm: any) => cm.month) || []
    };

    res.json({ success: true, data: transformedMember });
  } catch (error: any) {
    next(error);
  }
});

// @route   POST /api/members
// @desc    Create new member
// @access  Private (Admin/Treasurer)
router.post('/', requireAdminOrTreasurer, memberValidation, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError('Validation failed', errors.array());
    }

    const { name, email, phone, status = 'active' }: CreateMemberRequest = req.body;

    const { data: member, error } = await supabase
      .from('members')
      .insert({
        name,
        email,
        phone,
        status
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new ValidationError('Member with this email or phone already exists');
      }
      throw new Error(error.message);
    }

    res.status(201).json({
      success: true,
      message: 'Member created successfully',
      data: member
    });
  } catch (error: any) {
    next(error);
  }
});

// @route   PUT /api/members/:id
// @desc    Update member
// @access  Private (Admin/Treasurer)
router.put('/:id', requireAdminOrTreasurer, memberValidation, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError('Validation failed', errors.array());
    }

    const { id } = req.params;
    const { name, email, phone, status }: UpdateMemberRequest = req.body;

    const updateData: any = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (status) updateData.status = status;

    const { data: member, error } = await supabase
      .from('members')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new NotFoundError('Member not found');
      }
      if (error.code === '23505') {
        throw new ValidationError('Member with this email or phone already exists');
      }
      throw new Error(error.message);
    }

    res.json({
      success: true,
      message: 'Member updated successfully',
      data: member
    });
  } catch (error: any) {
    next(error);
  }
});

// @route   DELETE /api/members/:id
// @desc    Delete member
// @access  Private (Admin only)
router.delete('/:id', requireAdminOrTreasurer, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('members')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }

    res.json({
      success: true,
      message: 'Member deleted successfully'
    });
  } catch (error: any) {
    next(error);
  }
});

// @route   GET /api/members/:id/payments
// @desc    Get member's payment history
// @access  Private
router.get('/:id/payments', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const { data: payments, error, count } = await supabase
      .from('payments')
      .select('*')
      .eq('member_id', id)
      .order('payment_date', { ascending: false })
      .range(offset, offset + Number(limit) - 1);

    if (error) {
      throw new Error(error.message);
    }

    const response: PaginatedResponse<any> = {
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

// @route   GET /api/members/stats/overview
// @desc    Get members statistics overview
// @access  Private
router.get('/stats/overview', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get total members count
    const { count: totalMembers } = await supabase
      .from('members')
      .select('*', { count: 'exact', head: true });

    // Get active members count
    const { count: activeMembers } = await supabase
      .from('members')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    // Get members owing money
    const { count: membersOwing } = await supabase
      .from('member_owing_months')
      .select('member_id', { count: 'exact', head: true });

    // Get total amount owing
    const { data: owingData } = await supabase
      .from('member_owing_months')
      .select('amount');

    const totalOwingAmount = owingData?.reduce((sum, item) => sum + parseFloat(item.amount), 0) || 0;

    // Get total amount paid this year
    const currentYear = new Date().getFullYear();
    const { data: paymentsData } = await supabase
      .from('payments')
      .select('amount')
      .gte('payment_date', `${currentYear}-01-01`);

    const totalPaidThisYear = paymentsData?.reduce((sum, payment) => sum + parseFloat(payment.amount), 0) || 0;

    res.json({
      success: true,
      data: {
        totalMembers: totalMembers || 0,
        activeMembers: activeMembers || 0,
        membersOwing: membersOwing || 0,
        totalOwingAmount,
        totalPaidThisYear,
        membersPaidUp: (activeMembers || 0) - (membersOwing || 0)
      }
    });
  } catch (error: any) {
    next(error);
  }
});

// @route   POST /api/members/:id/owing-months
// @desc    Add owing months for a member
// @access  Private (Admin/Treasurer)
router.post('/:id/owing-months', requireAdminOrTreasurer, [
  body('months').isArray().withMessage('Months must be an array'),
  body('months.*').matches(/^\d{4}-\d{2}$/).withMessage('Each month must be in YYYY-MM format')
], async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError('Validation failed', errors.array());
    }

    const { id } = req.params;
    const { months } = req.body;

    // Insert owing months
    const owingMonthsData = months.map((month: string) => ({
      member_id: id,
      month,
      amount: 10.00 // Default monthly dues amount
    }));

    const { data: owingMonths, error } = await supabase
      .from('member_owing_months')
      .insert(owingMonthsData)
      .select();

    if (error) {
      throw new Error(error.message);
    }

    // Update member's total owing
    const { data: memberOwing } = await supabase
      .from('member_owing_months')
      .select('amount')
      .eq('member_id', id);

    const totalOwing = memberOwing?.reduce((sum, item) => sum + parseFloat(item.amount), 0) || 0;

    await supabase
      .from('members')
      .update({ total_owing: totalOwing })
      .eq('id', id);

    res.json({
      success: true,
      message: 'Owing months added successfully',
      data: owingMonths
    });
  } catch (error: any) {
    next(error);
  }
});

export default router;
