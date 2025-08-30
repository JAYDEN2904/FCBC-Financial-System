import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Filter, CreditCard, DollarSign, Coins, TrendingUp, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { EmptyState } from '@/components/ui/empty-state';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from '@/components/ui/dropdown-menu';
import { apiClient, Payment, Member, CreatePaymentRequest } from '@/lib/api';
import { toast } from 'sonner';

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <Loader2 className="h-8 w-8 animate-spin" />
  </div>
);

interface PaymentFormData {
  memberId: string;
  amount: string;
  selectedMonths: string[];
  method: 'cash' | 'mobile_money' | 'bank_transfer';
  notes: string;
  isAdvancePayment: boolean;
  advanceMonths: number;
}

export function Payments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMethod, setFilterMethod] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<PaymentFormData>({
    memberId: '',
    amount: '',
    selectedMonths: [],
    method: 'cash',
    notes: '',
    isAdvancePayment: false,
    advanceMonths: 1,
  });

  // Fetch payments and members from API
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch payments
      const paymentsResponse = await apiClient.getPayments();
      if (paymentsResponse.success && paymentsResponse.data) {
        setPayments(paymentsResponse.data);
      }

      // Fetch members
      const membersResponse = await apiClient.getMembers();
      if (membersResponse.success && membersResponse.data) {
        setMembers(membersResponse.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Helper functions
  const getMemberById = (id: string) => members.find(m => m.id === id);
  
  const calculatePaymentStats = () => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const thisMonthPayments = payments.filter(p => 
      p.payment_date.startsWith(currentMonth)
    );
    const thisMonthTotal = thisMonthPayments.reduce((sum, p) => sum + p.amount, 0);
    const totalPayments = payments.length;
    const avgPayment = payments.length > 0 ? payments.reduce((sum, p) => sum + p.amount, 0) / payments.length : 0;
    
    // Payment method breakdown
    const cashPayments = payments.filter(p => p.method === 'cash');
    const momoPayments = payments.filter(p => p.method === 'mobile_money');
    const bankPayments = payments.filter(p => p.method === 'bank_transfer');
    const cashTotal = cashPayments.reduce((sum, p) => sum + p.amount, 0);
    const momoTotal = momoPayments.reduce((sum, p) => sum + p.amount, 0);
    const bankTotal = bankPayments.reduce((sum, p) => sum + p.amount, 0);
    const totalAmount = cashTotal + momoTotal + bankTotal;
    
    // This month method breakdown
    const thisMonthCash = thisMonthPayments.filter(p => p.method === 'cash').reduce((sum, p) => sum + p.amount, 0);
    const thisMonthMomo = thisMonthPayments.filter(p => p.method === 'mobile_money').reduce((sum, p) => sum + p.amount, 0);
    const thisMonthBank = thisMonthPayments.filter(p => p.method === 'bank_transfer').reduce((sum, p) => sum + p.amount, 0);
    
    return { 
      thisMonthTotal, 
      totalPayments, 
      avgPayment,
      cashTotal,
      momoTotal,
      bankTotal,
      totalAmount,
      cashPercentage: totalAmount > 0 ? Math.round((cashTotal / totalAmount) * 100) : 0,
      momoPercentage: totalAmount > 0 ? Math.round((momoTotal / totalAmount) * 100) : 0,
      bankPercentage: totalAmount > 0 ? Math.round((bankTotal / totalAmount) * 100) : 0,
      thisMonthCash,
      thisMonthMomo,
      thisMonthBank,
      cashCount: cashPayments.length,
      momoCount: momoPayments.length,
      bankCount: bankPayments.length,
    };
  };

  const generateAvailableMonths = () => {
    const months = [];
    const currentDate = new Date();
    
    // Start from January 2025 and generate 12 months from there
    const startYear = 2025;
    const startMonth = 0; // January (0-indexed)
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(startYear, startMonth + i, 1);
      const monthStr = date.toISOString().slice(0, 7);
      const currentMonthStr = currentDate.toISOString().slice(0, 7);
      
      months.push({
        value: monthStr,
        label: date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' }),
        isPast: monthStr < currentMonthStr,
        isCurrent: monthStr === currentMonthStr,
        isFuture: monthStr > currentMonthStr
      });
    }
    return months;
  };

  const filteredPayments = payments.filter(payment => {
    const member = getMemberById(payment.member_id);
    const matchesSearch = member?.name.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    const matchesFilter = filterMethod === 'all' || payment.method === filterMethod;
    return matchesSearch && matchesFilter;
  });

  const stats = calculatePaymentStats();
  const availableMonths = generateAvailableMonths();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const paymentData: CreatePaymentRequest = {
        memberId: formData.memberId,
        amount: parseFloat(formData.amount),
        method: formData.method,
        monthsPaid: formData.selectedMonths,
        isAdvancePayment: formData.isAdvancePayment,
        notes: formData.notes || undefined,
      };

      const response = await apiClient.createPayment(paymentData);
      
      if (response.success && response.data) {
        setPayments(prev => [...prev, response.data!]);
        toast.success('Payment recorded successfully!');
        setIsAddModalOpen(false);
        setFormData({
          memberId: '',
          amount: '',
          selectedMonths: [],
          method: 'cash',
          notes: '',
          isAdvancePayment: false,
          advanceMonths: 1,
        });
      } else {
        toast.error(response.error || 'Failed to record payment');
      }
    } catch (error) {
      console.error('Error submitting payment:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeModal = () => {
    setIsAddModalOpen(false);
    setFormData({
      memberId: '',
      amount: '',
      selectedMonths: [],
      method: 'cash',
      notes: '',
      isAdvancePayment: false,
      advanceMonths: 1,
    });
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'cash':
        return <DollarSign className="h-4 w-4" />;
      case 'mobile_money':
        return <Coins className="h-4 w-4" />;
      case 'bank_transfer':
        return <CreditCard className="h-4 w-4" />;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  const getMethodBadgeVariant = (method: string) => {
    switch (method) {
      case 'cash':
        return 'default';
      case 'mobile_money':
        return 'secondary';
      case 'bank_transfer':
        return 'outline';
      default:
        return 'default';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Payments</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Record and manage member payments
          </p>
        </div>
        <Button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Record Payment
        </Button>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">GHS {stats.thisMonthTotal.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalPayments} payments recorded
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cash Payments</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">GHS {stats.cashTotal.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {stats.cashCount} payments ({stats.cashPercentage}%)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mobile Money</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">GHS {stats.momoTotal.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {stats.momoCount} payments ({stats.momoPercentage}%)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bank Transfer</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">GHS {stats.bankTotal.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {stats.bankCount} payments ({stats.bankPercentage}%)
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col lg:flex-row gap-4"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search payments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterMethod} onValueChange={setFilterMethod}>
          <SelectTrigger className="w-full lg:w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Methods</SelectItem>
            <SelectItem value="cash">Cash</SelectItem>
            <SelectItem value="mobile_money">Mobile Money</SelectItem>
            <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* Payments Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Recent Payments</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <LoadingSpinner />
            ) : filteredPayments.length === 0 ? (
              <EmptyState
                icon={CreditCard}
                title="No payments found"
                description="Get started by recording your first payment."
                action={
                  <Button onClick={() => setIsAddModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Record Payment
                  </Button>
                }
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="hidden lg:table-cell">Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {filteredPayments.map((payment, index) => {
                      const member = getMemberById(payment.member_id);
                      return (
                        <motion.tr
                          key={payment.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                          <TableCell className="font-medium">
                            {member?.name || 'Unknown Member'}
                          </TableCell>
                          <TableCell className="font-semibold text-green-600">
                            GHS {payment.amount.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant={getMethodBadgeVariant(payment.method)}>
                              <div className="flex items-center gap-1">
                                {getMethodIcon(payment.method)}
                                {payment.method.replace('_', ' ')}
                              </div>
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(payment.payment_date).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell text-gray-600 dark:text-gray-300">
                            {payment.notes || '-'}
                          </TableCell>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Add Payment Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={closeModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Record New Payment</DialogTitle>
            <DialogDescription>
              Record a payment for a member
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="member">Member</Label>
                <Select value={formData.memberId} onValueChange={(value) => setFormData(prev => ({ ...prev, memberId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a member" />
                  </SelectTrigger>
                  <SelectContent>
                    {members.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name} ({member.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="amount">Amount (GHS)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="method">Payment Method</Label>
                <Select value={formData.method} onValueChange={(value: 'cash' | 'mobile_money' | 'bank_transfer') => setFormData(prev => ({ ...prev, method: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="mobile_money">Mobile Money</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Months to Pay</Label>
                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                  {availableMonths.map((month) => (
                    <div key={month.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={month.value}
                        checked={formData.selectedMonths.includes(month.value)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFormData(prev => ({
                              ...prev,
                              selectedMonths: [...prev.selectedMonths, month.value]
                            }));
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              selectedMonths: prev.selectedMonths.filter(m => m !== month.value)
                            }));
                          }
                        }}
                      />
                      <Label htmlFor={month.value} className="text-sm">
                        {month.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="advance"
                  checked={formData.isAdvancePayment}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isAdvancePayment: !!checked }))}
                />
                <Label htmlFor="advance">This is an advance payment</Label>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Add any additional notes..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeModal} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" className="bg-gradient-to-r from-blue-600 to-teal-600" disabled={isSubmitting}>
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Recording...
                  </div>
                ) : (
                  'Record Payment'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}