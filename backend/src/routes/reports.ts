import express, { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// @route   GET /api/reports/financial
// @desc    Generate financial report
// @access  Private
router.get('/financial', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate, type = 'summary' } = req.query;

    let start: string, end: string;
    if (startDate && endDate) {
      start = startDate as string;
      end = endDate as string;
    } else {
      // Default to current year
      const currentYear = new Date().getFullYear();
      start = `${currentYear}-01-01`;
      end = `${currentYear}-12-31`;
    }

    // Get payments in period
    const { data: payments } = await supabase
      .from('payments')
      .select('amount, payment_date, method')
      .gte('payment_date', start)
      .lte('payment_date', end);

    // Get donations in period
    const { data: donations } = await supabase
      .from('donations')
      .select('amount, donation_date, donation_type')
      .gte('donation_date', start)
      .lte('donation_date', end);

    // Get expenses in period
    const { data: expenses } = await supabase
      .from('expenses')
      .select('amount, expense_date, category')
      .gte('expense_date', start)
      .lte('expense_date', end);

    const totalIncome = (payments?.reduce((sum, p) => sum + parseFloat(p.amount), 0) || 0) +
                       (donations?.reduce((sum, d) => sum + parseFloat(d.amount), 0) || 0);
    
    const totalExpenses = expenses?.reduce((sum, e) => sum + parseFloat(e.amount), 0) || 0;
    const netBalance = totalIncome - totalExpenses;

    const report = {
      period: { start, end },
      summary: {
        totalIncome,
        totalExpenses,
        netBalance
      },
      breakdown: {
        payments: payments?.length || 0,
        donations: donations?.length || 0,
        expenses: expenses?.length || 0
      }
    };

    res.json({
      success: true,
      data: report
    });
  } catch (error: any) {
    next(error);
  }
});

export default router;
