export const mockMembers = [
  {
    id: '1',
    name: 'Kwame Asante',
    email: 'kwame.asante@gmail.com',
    phone: '+233 24 123 4567',
    joinDate: '2023-01-15',
    status: 'active',
    totalPaid: 100, // 10 months paid
    totalOwing: 20, // 2 months owing
    creditBalance: 0,
    lastPayment: '2024-10-01',
    owingMonths: ['2024-11', '2024-12'],
  },
  {
    id: '2',
    name: 'Ama Osei',
    email: 'ama.osei@gmail.com',
    phone: '+233 26 234 5678',
    joinDate: '2023-03-22',
    status: 'active',
    totalPaid: 120, // 12 months paid
    totalOwing: 0,
    creditBalance: 10, // 1 month credit
    lastPayment: '2024-12-01',
    owingMonths: [],
  },
  {
    id: '3',
    name: 'Kofi Mensah',
    email: 'kofi.mensah@gmail.com',
    phone: '+233 20 345 6789',
    joinDate: '2023-02-10',
    status: 'active',
    totalPaid: 80, // 8 months paid
    totalOwing: 40, // 4 months owing
    creditBalance: 0,
    lastPayment: '2024-08-01',
    owingMonths: ['2024-09', '2024-10', '2024-11', '2024-12'],
  },
  {
    id: '4',
    name: 'Akosua Boateng',
    email: 'akosua.boateng@gmail.com',
    phone: '+233 27 456 7890',
    joinDate: '2023-05-18',
    status: 'active',
    totalPaid: 90, // 9 months paid
    totalOwing: 30, // 3 months owing
    creditBalance: 0,
    lastPayment: '2024-09-01',
    owingMonths: ['2024-10', '2024-11', '2024-12'],
  },
  {
    id: '5',
    name: 'Yaw Opoku',
    email: 'yaw.opoku@gmail.com',
    phone: '+233 23 567 8901',
    joinDate: '2023-04-12',
    status: 'inactive',
    totalPaid: 60, // 6 months paid
    totalOwing: 60, // 6 months owing
    creditBalance: 0,
    lastPayment: '2024-06-01',
    owingMonths: ['2024-07', '2024-08', '2024-09', '2024-10', '2024-11', '2024-12'],
  },
];

export const mockPayments = [
  {
    id: '1',
    memberId: '1',
    memberName: 'Kwame Asante',
    amount: 10,
    monthsPaid: ['2024-10'],
    date: '2024-10-01',
    method: 'cash',
    notes: 'October dues',
  },
  {
    id: '2',
    memberId: '2',
    memberName: 'Ama Osei',
    amount: 20,
    monthsPaid: ['2024-12', 'credit'],
    date: '2024-12-01',
    method: 'mobile_money',
    notes: 'December dues + 1 month advance',
  },
  {
    id: '3',
    memberId: '3',
    memberName: 'Kofi Mensah',
    amount: 10,
    monthsPaid: ['2024-08'],
    date: '2024-08-01',
    method: 'mobile_money',
    notes: 'August dues',
  },
  {
    id: '4',
    memberId: '4',
    memberName: 'Akosua Boateng',
    amount: 10,
    monthsPaid: ['2024-09'],
    date: '2024-09-01',
    method: 'cash',
    notes: 'September dues',
  },
  {
    id: '5',
    memberId: '5',
    memberName: 'Yaw Opoku',
    amount: 60,
    monthsPaid: ['2024-01', '2024-02', '2024-03', '2024-04', '2024-05', '2024-06'],
    date: '2024-01-15',
    method: 'mobile_money',
    notes: 'Paid for first 6 months of 2024',
  },
];

export const mockChartData = [
  { month: 'Jan', collected: 40, target: 50, members: 5 }, // 4 members paid * 10 GHS
  { month: 'Feb', collected: 50, target: 50, members: 5 }, // 5 members paid * 10 GHS
  { month: 'Mar', collected: 30, target: 50, members: 5 }, // 3 members paid * 10 GHS
  { month: 'Apr', collected: 40, target: 50, members: 5 }, // 4 members paid * 10 GHS
  { month: 'May', collected: 50, target: 50, members: 5 }, // 5 members paid * 10 GHS
  { month: 'Jun', collected: 50, target: 50, members: 5 }, // 5 members paid * 10 GHS
  { month: 'Jul', collected: 20, target: 50, members: 5 }, // 2 members paid * 10 GHS
  { month: 'Aug', collected: 20, target: 50, members: 5 }, // 2 members paid * 10 GHS
  { month: 'Sep', collected: 10, target: 50, members: 5 }, // 1 member paid * 10 GHS
  { month: 'Oct', collected: 20, target: 50, members: 5 }, // 2 members paid * 10 GHS
  { month: 'Nov', collected: 0, target: 50, members: 5 }, // 0 members paid * 10 GHS
  { month: 'Dec', collected: 20, target: 50, members: 5 }, // 2 members paid * 10 GHS
];

export const mockPieData = [
  { name: 'Paid Up', value: 40, fill: '#0D9488' }, // 2 out of 5 members are current
  { name: 'Owing', value: 60, fill: '#EF4444' }, // 3 out of 5 members owe money
];

export const mockReminders = [
  {
    id: '1',
    type: 'sms',
    memberId: '3',
    memberName: 'Kofi Mensah',
    recipient: '+233 20 345 6789',
    message: 'Hi Kofi, friendly reminder that your youth ministry dues of GHS 40.00 (4 months) are outstanding. Please pay before month end. God bless!',
    sentDate: '2024-12-15',
    status: 'sent',
    reminderType: 'overdue',
    owingAmount: 40,
  },
  {
    id: '2',
    type: 'sms',
    memberId: '1',
    memberName: 'Kwame Asante',
    recipient: '+233 24 123 4567',
    message: 'Hi Kwame, this is a reminder that your youth ministry dues of GHS 20.00 (2 months) are due. Please pay before month end. Thank you!',
    sentDate: '2024-12-15',
    status: 'sent',
    reminderType: 'pre-due',
    owingAmount: 20,
  },
  {
    id: '3',
    type: 'sms',
    memberId: '4',
    memberName: 'Akosua Boateng',
    recipient: '+233 27 456 7890',
    message: 'Hi Akosua, your youth ministry dues of GHS 30.00 (3 months) are overdue. Please settle your payment. God bless!',
    sentDate: '2024-12-14',
    status: 'failed',
    reminderType: 'overdue',
    owingAmount: 30,
  },
];

export const dashboardStats = {
  totalCollected: 450, // Total collected this year (GHS)
  membersPaid: 2, // Members who are current/paid up
  membersOwing: 3, // Members who owe money
  totalMembers: 5, // Total active members
  monthlyTarget: 50, // 5 members * 10 GHS each
  currentMonthCollected: 20, // December collections so far (GHS)
  cashCollected: 270, // Amount collected via cash
  momoCollected: 180, // Amount collected via mobile money
  totalOwingAmount: 150, // Total amount owed by all members
};

export const paymentMethodData = [
  { name: 'Cash', value: 60, amount: 270, count: 3, fill: '#3B82F6' },
  { name: 'Mobile Money', value: 40, amount: 180, count: 2, fill: '#8B5CF6' },
];

// Budget and Expenses Data
export const mockExpenses = [
  {
    id: '1',
    title: 'Youth Camp 2024',
    category: 'Events',
    amount: 200,
    date: '2024-11-15',
    status: 'paid',
    description: 'Annual youth camp expenses - venue and materials',
    budgetCategory: 'programs',
  },
  {
    id: '2',
    title: 'Sound Equipment Rental',
    category: 'Equipment',
    amount: 80,
    date: '2024-12-01',
    status: 'paid',
    description: 'Monthly sound system rental for services',
    budgetCategory: 'equipment',
  },
  {
    id: '3',
    title: 'Bible Study Materials',
    category: 'Materials',
    amount: 50,
    date: '2024-12-10',
    status: 'pending',
    description: 'Books and study guides for members',
    budgetCategory: 'materials',
  },
  {
    id: '4',
    title: 'Transportation Allowance',
    category: 'Travel',
    amount: 40,
    date: '2024-12-05',
    status: 'paid',
    description: 'Transport for outreach activities',
    budgetCategory: 'outreach',
  },
];

export const budgetCategories = [
  {
    id: 'programs',
    name: 'Programs & Events',
    budgeted: 300,
    spent: 200,
    remaining: 100,
    color: '#0D9488',
  },
  {
    id: 'equipment',
    name: 'Equipment & Maintenance',
    budgeted: 150,
    spent: 80,
    remaining: 70,
    color: '#3B82F6',
  },
  {
    id: 'materials',
    name: 'Materials & Resources',
    budgeted: 100,
    spent: 25,
    remaining: 75,
    color: '#8B5CF6',
  },
  {
    id: 'outreach',
    name: 'Outreach & Missions',
    budgeted: 120,
    spent: 40,
    remaining: 80,
    color: '#F59E0B',
  },
];

// Financial Goals Data
export const financialGoals = [
  {
    id: '1',
    title: 'Youth Camp Fund',
    description: 'Raise funds for annual youth camp 2025',
    targetAmount: 500,
    currentAmount: 120,
    deadline: '2025-06-01',
    category: 'events',
    priority: 'high',
    status: 'active',
  },
  {
    id: '2',
    title: 'Sound System Purchase',
    description: 'Buy our own sound equipment to avoid monthly rentals',
    targetAmount: 800,
    currentAmount: 200,
    deadline: '2025-03-01',
    category: 'equipment',
    priority: 'medium',
    status: 'active',
  },
  {
    id: '3',
    title: 'Emergency Fund',
    description: 'Build ministry emergency fund for unexpected expenses',
    targetAmount: 300,
    currentAmount: 50,
    deadline: '2025-12-31',
    category: 'savings',
    priority: 'low',
    status: 'active',
  },
];

// Donations Data
export const mockDonations = [
  {
    id: '1',
    donorName: 'Anonymous',
    amount: 100,
    date: '2024-12-01',
    purpose: 'Youth Camp Fund',
    method: 'mobile_money',
    notes: 'One-time donation for camp expenses',
    isRecurring: false,
  },
  {
    id: '2',
    donorName: 'Elder Kwame Asante',
    amount: 50,
    date: '2024-11-15',
    purpose: 'General Ministry',
    method: 'cash',
    notes: 'Monthly support',
    isRecurring: true,
  },
  {
    id: '3',
    donorName: 'Sister Ama Osei',
    amount: 30,
    date: '2024-12-10',
    purpose: 'Sound System Fund',
    method: 'mobile_money',
    notes: 'Contribution towards sound equipment',
    isRecurring: false,
  },
];

// Financial Summary Data
export const financialSummary = {
  totalIncome: 630, // dues + donations
  totalExpenses: 370,
  netBalance: 260,
  monthlyBudget: 670,
  budgetUtilization: 55, // percentage
  savingsGoal: 1600, // total of all financial goals
  currentSavings: 370, // progress towards goals
};