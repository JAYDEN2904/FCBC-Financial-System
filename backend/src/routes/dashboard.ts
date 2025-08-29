import express, { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase.js';
import { authenticateToken } from '../middleware/auth.js';
import { DashboardStats } from '../types/index.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// @route   GET /api/dashboard/stats
// @desc    Get dashboard statistics
// @access  Private
router.get('/stats', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    const currentDate = new Date().toISOString().split('T')[0];

    // Get total members
    const { count: totalMembers } = await supabase
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

    // Get total collected this year
    const { data: yearlyPayments } = await supabase
      .from('payments')
      .select('amount')
      .gte('payment_date', `${currentYear}-01-01`);

    const totalCollected = yearlyPayments?.reduce((sum, payment) => sum + parseFloat(payment.amount), 0) || 0;

    // Get current month collections
    const { data: monthlyPayments } = await supabase
      .from('payments')
      .select('amount')
      .gte('payment_date', `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`)
      .lte('payment_date', currentDate);

    const currentMonthCollected = monthlyPayments?.reduce((sum, payment) => sum + parseFloat(payment.amount), 0) || 0;

    // Get monthly target (active members * 10 GHS)
    const monthlyTarget = (totalMembers || 0) * 10;

    // Get payment method breakdown
    const { data: allPayments } = await supabase
      .from('payments')
      .select('amount, method')
      .gte('payment_date', `${currentYear}-01-01`);

    const cashPayments = allPayments?.filter(p => p.method === 'cash') || [];
    const momoPayments = allPayments?.filter(p => p.method === 'mobile_money') || [];
    
    const cashTotal = cashPayments.reduce((sum, payment) => sum + parseFloat(payment.amount), 0);
    const momoTotal = momoPayments.reduce((sum, payment) => sum + parseFloat(payment.amount), 0);

    // Get recent activity (last 10 payments)
    const { data: recentPayments } = await supabase
      .from('payments')
      .select(`
        amount,
        method,
        payment_date,
        notes,
        members(name)
      `)
      .order('payment_date', { ascending: false })
      .limit(10);

    const recentActivity = recentPayments?.map(payment => ({
      name: (payment.members as any)?.name || 'Unknown',
      action: payment.notes || 'payment made',
      amount: `GHS ${payment.amount}`,
      time: new Date(payment.payment_date).toLocaleDateString(),
      method: payment.method === 'mobile_money' ? 'MoMo' : 'Cash'
    })) || [];

    const stats: DashboardStats = {
      total_members: totalMembers || 0,
      active_members: totalMembers || 0,
      total_income: totalCollected,
      total_expenses: 0, // This would come from expenses table
      net_balance: totalCollected,
      monthly_collections: [
        {
          month: new Date().toLocaleDateString('en-US', { month: 'short' }),
          amount: currentMonthCollected
        }
      ],
      payment_methods: [
        {
          method: 'cash',
          count: cashPayments.length,
          amount: cashTotal
        },
        {
          method: 'mobile_money',
          count: momoPayments.length,
          amount: momoTotal
        }
      ],
      recent_activity: recentActivity.map(activity => ({
        id: Math.random().toString(),
        type: 'payment',
        description: `${activity.name} - ${activity.action}`,
        amount: parseFloat(activity.amount.replace('GHS ', '')),
        created_at: activity.time
      }))
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error: any) {
    next(error);
  }
});

// @route   GET /api/dashboard/charts/monthly-collections
// @desc    Get monthly collections data for charts
// @access  Private
router.get('/charts/monthly-collections', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const currentYear = new Date().getFullYear();
    
    // Get monthly payment data
    const { data: payments } = await supabase
      .from('payments')
      .select('amount, payment_date')
      .gte('payment_date', `${currentYear}-01-01`)
      .lte('payment_date', `${currentYear}-12-31`);

    // Group by month
    const monthlyData: Record<string, any> = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                   'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    months.forEach((month, index) => {
      const monthNum = (index + 1).toString().padStart(2, '0');
      monthlyData[month] = {
        month,
        collected: 0,
        target: 50, // Default target, could be dynamic
        members: 0
      };
    });

    // Calculate monthly totals
    payments?.forEach(payment => {
      const month = new Date(payment.payment_date).getMonth();
      const monthName = months[month];
      if (monthName && monthlyData[monthName]) {
        monthlyData[monthName].collected += parseFloat(payment.amount);
      }
    });

    const chartData = Object.values(monthlyData);

    res.json({ 
      success: true,
      data: { chartData }
    });
  } catch (error: any) {
    next(error);
  }
});

// @route   GET /api/dashboard/charts/payment-methods
// @desc    Get payment methods breakdown for charts
// @access  Private
router.get('/charts/payment-methods', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const currentYear = new Date().getFullYear();
    
    const { data: payments } = await supabase
      .from('payments')
      .select('amount, method')
      .gte('payment_date', `${currentYear}-01-01`);

    const cashPayments = payments?.filter(p => p.method === 'cash') || [];
    const momoPayments = payments?.filter(p => p.method === 'mobile_money') || [];
    
    const cashTotal = cashPayments.reduce((sum, payment) => sum + parseFloat(payment.amount), 0);
    const momoTotal = momoPayments.reduce((sum, payment) => sum + parseFloat(payment.amount), 0);
    const totalAmount = cashTotal + momoTotal;

    const paymentMethodData = [
      {
        name: 'Cash',
        value: totalAmount > 0 ? Math.round((cashTotal / totalAmount) * 100) : 0,
        amount: cashTotal,
        count: cashPayments.length,
        fill: '#3B82F6'
      },
      {
        name: 'Mobile Money',
        value: totalAmount > 0 ? Math.round((momoTotal / totalAmount) * 100) : 0,
        amount: momoTotal,
        count: momoPayments.length,
        fill: '#8B5CF6'
      }
    ];

    res.json({ 
      success: true,
      data: { paymentMethodData }
    });
  } catch (error: any) {
    next(error);
  }
});

export default router;
