import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Target, 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Heart,
  DollarSign,
  PieChart,
  AlertCircle,
  CheckCircle,
  Edit,
  Trash2,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { EmptyState } from '@/components/ui/empty-state';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <Loader2 className="h-8 w-8 animate-spin" />
  </div>
);

export function Finance() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('budget');

  // Mock financial data (since we cleared all financial data)
  const financialData = {
    totalIncome: 0,
    totalExpenses: 0,
    netBalance: 0,
    budgetUtilization: 0,
    totalBudget: 0,
    totalSpent: 0,
    goalsProgress: 0,
    goalsTarget: 0,
    goalsCurrent: 0,
  };

  // Empty arrays for now since we cleared all data
  const expenses: any[] = [];
  const donations: any[] = [];
  const budgetCategories: any[] = [];
  const financialGoals: any[] = [];

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleAddExpense = () => {
    toast.info('Expense management will be available soon');
  };

  const handleAddDonation = () => {
    toast.info('Donation management will be available soon');
  };

  const handleAddGoal = () => {
    toast.info('Financial goals will be available soon');
  };

  const handleAddBudgetCategory = () => {
    toast.info('Budget categories will be available soon');
  };

  if (loading) {
    return (
      <div className="p-6">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Financial Management</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Track budgets, manage expenses, and monitor financial goals
          </p>
        </div>
      </motion.div>

      {/* Financial Overview Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">GHS {financialData.totalIncome.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Budget: GHS {financialData.totalBudget.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">GHS {financialData.totalExpenses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {financialData.totalBudget > 0 ? Math.round((financialData.totalExpenses / financialData.totalBudget) * 100) : 0}% of budget used
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
            <Wallet className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">GHS {financialData.netBalance.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Savings: GHS {financialData.netBalance.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Goals Progress</CardTitle>
            <Target className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{financialData.goalsProgress}%</div>
            <p className="text-xs text-muted-foreground">GHS {financialData.goalsCurrent} / {financialData.goalsTarget}</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="budget">Budget Tracking</TabsTrigger>
            <TabsTrigger value="goals">Financial Goals</TabsTrigger>
            <TabsTrigger value="donations">Donations</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
          </TabsList>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Budget vs Expenses */}
            <TabsContent value="budget">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Budget vs Expenses
                  </CardTitle>
                  <Button onClick={handleAddExpense} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Expense
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Budget Utilization</span>
                      <span>{financialData.budgetUtilization}%</span>
                    </div>
                    <Progress value={financialData.budgetUtilization} className="h-2" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">GHS {financialData.totalBudget.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">Total Budget</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">GHS {financialData.totalSpent.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">Total Spent</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Budget Categories */}
            <TabsContent value="budget">
              <Card>
                <CardHeader>
                  <CardTitle>Budget Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  {budgetCategories.length === 0 ? (
                    <EmptyState
                      icon={PieChart}
                      title="No budget categories"
                      description="Create budget categories to track your spending."
                      action={
                        <Button onClick={handleAddBudgetCategory}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Category
                        </Button>
                      }
                    />
                  ) : (
                    <div className="space-y-4">
                      {budgetCategories.map((category) => (
                        <div key={category.id} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>{category.name}</span>
                            <span>{category.percentage}% used</span>
                          </div>
                          <Progress value={category.percentage} className="h-2" />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>GHS {category.spent} / {category.budget}</span>
                            <span>{category.percentage}% used</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Financial Goals */}
            <TabsContent value="goals">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Financial Goals</CardTitle>
                  <Button onClick={handleAddGoal} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Goal
                  </Button>
                </CardHeader>
                <CardContent>
                  {financialGoals.length === 0 ? (
                    <EmptyState
                      icon={Target}
                      title="No financial goals"
                      description="Set financial goals to track your progress."
                      action={
                        <Button onClick={handleAddGoal}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Goal
                        </Button>
                      }
                    />
                  ) : (
                    <div className="space-y-4">
                      {financialGoals.map((goal) => (
                        <div key={goal.id} className="p-4 border rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold">{goal.title}</h3>
                            <Badge variant={goal.status === 'completed' ? 'default' : 'secondary'}>
                              {goal.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{goal.description}</p>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Progress</span>
                              <span>{goal.progress}%</span>
                            </div>
                            <Progress value={goal.progress} className="h-2" />
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>GHS {goal.current} / {goal.target}</span>
                              <span>Due: {goal.deadline}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Donations */}
            <TabsContent value="donations">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Recent Donations</CardTitle>
                  <Button onClick={handleAddDonation} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Donation
                  </Button>
                </CardHeader>
                <CardContent>
                  {donations.length === 0 ? (
                    <EmptyState
                      icon={Heart}
                      title="No donations recorded"
                      description="Start recording donations to track your ministry's support."
                      action={
                        <Button onClick={handleAddDonation}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Donation
                        </Button>
                      }
                    />
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Donor</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Purpose</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {donations.map((donation) => (
                          <TableRow key={donation.id}>
                            <TableCell className="font-medium">{donation.donorName}</TableCell>
                            <TableCell>GHS {donation.amount.toLocaleString()}</TableCell>
                            <TableCell>{donation.purpose}</TableCell>
                            <TableCell>{new Date(donation.donationDate).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <Badge variant={donation.status === 'confirmed' ? 'default' : 'secondary'}>
                                {donation.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Expenses */}
            <TabsContent value="expenses">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Recent Expenses</CardTitle>
                  <Button onClick={handleAddExpense} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Expense
                  </Button>
                </CardHeader>
                <CardContent>
                  {expenses.length === 0 ? (
                    <EmptyState
                      icon={DollarSign}
                      title="No expenses recorded"
                      description="Start tracking expenses to manage your budget effectively."
                      action={
                        <Button onClick={handleAddExpense}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Expense
                        </Button>
                      }
                    />
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {expenses.map((expense) => (
                          <TableRow key={expense.id}>
                            <TableCell className="font-medium">{expense.title}</TableCell>
                            <TableCell>{expense.category}</TableCell>
                            <TableCell>GHS {expense.amount.toLocaleString()}</TableCell>
                            <TableCell>{new Date(expense.expenseDate).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <Badge variant={expense.status === 'paid' ? 'default' : 'secondary'}>
                                {expense.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </motion.div>
    </div>
  );
}