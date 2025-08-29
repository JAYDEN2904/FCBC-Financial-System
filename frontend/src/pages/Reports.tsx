import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, TrendingUp, Users, DollarSign, Calendar, AlertTriangle, CheckCircle, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { EmptyState } from '@/components/ui/empty-state';
import { apiClient, Member, Payment } from '@/lib/api';
import { toast } from 'sonner';

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <Loader2 className="h-8 w-8 animate-spin" />
  </div>
);

export function Reports() {
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<Member[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [selectedYear, setSelectedYear] = useState('2024');

  // Fetch data from API
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch members
      const membersResponse = await apiClient.getMembers();
      if (membersResponse.success && membersResponse.data) {
        setMembers(membersResponse.data);
      }

      // Fetch payments
      const paymentsResponse = await apiClient.getPayments();
      if (paymentsResponse.success && paymentsResponse.data) {
        setPayments(paymentsResponse.data);
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

  // Calculate stats from real data
  const stats = {
    totalCollected: payments.reduce((sum, payment) => sum + payment.amount, 0),
    membersOwing: members.filter(member => member.total_owing > 0).length,
    totalMembers: members.length,
    collectionRate: members.length > 0 ? Math.round(((members.length - members.filter(member => member.total_owing > 0).length) / members.length) * 100) : 0,
    membersPaidUp: members.filter(member => member.total_owing === 0).length,
    outstandingAmount: members.reduce((sum, member) => sum + member.total_owing, 0),
  };

  // Get members owing money
  const membersOwing = members.filter(member => member.total_owing > 0);

  // Empty chart data since we have no financial data
  const monthlyCollectionData: any[] = [];
  const paymentMethodData: any[] = [];

  const handleExportAll = () => {
    toast.info('Export functionality will be available soon');
  };

  const handleExportMembers = () => {
    toast.info('Member export will be available soon');
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Comprehensive youth ministry financial reports and member analytics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
              <SelectItem value="2022">2022</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleExportAll} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export All
          </Button>
        </div>
      </motion.div>

      {/* Analytics Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
          >
            <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Collected ({selectedYear})</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">GHS {stats.totalCollected.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Cash: 0% | MoMo: 0%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Members Owing</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.membersOwing}/{stats.totalMembers}</div>
            <p className="text-xs text-muted-foreground">GHS {stats.outstandingAmount.toLocaleString()} outstanding</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-teal-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.collectionRate}%</div>
            <p className="text-xs text-muted-foreground">{stats.membersOwing} critical cases</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Members Paid Up</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.membersPaidUp}</div>
            <p className="text-xs text-muted-foreground">{stats.collectionRate}% current</p>
              </CardContent>
            </Card>
          </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Tabs defaultValue="members" className="space-y-6">
          <TabsList>
            <TabsTrigger value="members">Members Owing</TabsTrigger>
            <TabsTrigger value="analytics">Financial Analytics</TabsTrigger>
            <TabsTrigger value="trends">Collection Trends</TabsTrigger>
            <TabsTrigger value="export">Export Reports</TabsTrigger>
          </TabsList>

          {/* Members Owing Tab */}
          <TabsContent value="members">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Members with Outstanding Dues</CardTitle>
                <Button onClick={handleExportMembers} variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                </CardHeader>
                <CardContent>
                {membersOwing.length === 0 ? (
                  <EmptyState
                    icon={CheckCircle}
                    title="No members owing"
                    description="All members are up to date with their payments."
                  />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Member</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Months Owing</TableHead>
                        <TableHead>Amount Owing</TableHead>
                        <TableHead>Last Payment</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {membersOwing.map((member) => (
                          <TableRow key={member.id}>
                            <TableCell className="font-medium">{member.name}</TableCell>
                          <TableCell>{member.phone}</TableCell>
                            <TableCell>
                            <div className="flex gap-1">
                              <Badge variant="destructive" className="text-xs">
                                {Math.ceil(member.total_owing / 10)} months
                                  </Badge>
                              </div>
                            </TableCell>
                          <TableCell className="text-red-600 font-semibold">
                            GHS {member.total_owing.toLocaleString()}
                            </TableCell>
                          <TableCell>
                            {'Never'}
                            </TableCell>
                            <TableCell>
                            <Badge variant={member.total_owing > 50 ? 'destructive' : 'secondary'}>
                              {member.total_owing > 50 ? 'Critical' : 'Overdue'}
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

          {/* Financial Analytics Tab */}
          <TabsContent value="analytics">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Collections</CardTitle>
                </CardHeader>
                <CardContent>
                  {monthlyCollectionData.length === 0 ? (
                    <EmptyState
                      icon={TrendingUp}
                      title="No collection data"
                      description="Start recording payments to see collection trends."
                    />
                  ) : (
                  <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={monthlyCollectionData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value: any) => [`GHS ${value}`, 'Collected']} />
                        <Bar dataKey="collected" fill="#3B82F6" />
                      </BarChart>
                  </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Payment Methods</CardTitle>
                </CardHeader>
                <CardContent>
                  {paymentMethodData.length === 0 ? (
                    <EmptyState
                      icon={DollarSign}
                      title="No payment data"
                      description="Start recording payments to see method distribution."
                    />
                  ) : (
                  <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={paymentMethodData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) => `${name}: ${value}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {paymentMethodData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={['#3B82F6', '#8B5CF6'][index % 2]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: any) => [`${value}%`, 'Percentage']} />
                      </PieChart>
                  </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Collection Trends Tab */}
          <TabsContent value="trends">
            <Card>
              <CardHeader>
                <CardTitle>Collection Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <EmptyState
                  icon={TrendingUp}
                  title="No trend data available"
                  description="Start recording payments over time to see collection trends."
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Export Reports Tab */}
          <TabsContent value="export">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Member Reports</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button onClick={handleExportMembers} className="w-full" variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    Export Member List
                  </Button>
                  <Button onClick={handleExportMembers} className="w-full" variant="outline">
                    <Users className="h-4 w-4 mr-2" />
                    Export Members Owing
                  </Button>
                  <Button onClick={handleExportMembers} className="w-full" variant="outline">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Export Paid Members
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Financial Reports</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button onClick={handleExportAll} className="w-full" variant="outline">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Export Payment History
                  </Button>
                  <Button onClick={handleExportAll} className="w-full" variant="outline">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Export Collection Report
                  </Button>
                  <Button onClick={handleExportAll} className="w-full" variant="outline">
                    <Calendar className="h-4 w-4 mr-2" />
                    Export Monthly Summary
                          </Button>
                    </CardContent>
                  </Card>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}