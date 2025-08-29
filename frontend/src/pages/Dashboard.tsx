import { motion } from 'framer-motion';
import { Users, DollarSign, TrendingUp, AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useEffect, useState } from 'react';
import { apiClient, DashboardStats } from '@/lib/api';
import { toast } from 'sonner';

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <Loader2 className="h-8 w-8 animate-spin" />
  </div>
);

// Stats cards component
const StatsCards = ({ stats }: { stats: DashboardStats }) => {
  const statsCards = [
    {
      title: 'Total Collected (2024)',
      value: `GHS ${stats.total_income.toLocaleString()}`,
      icon: DollarSign,
      trend: `Income: GHS ${stats.total_income} | Expenses: GHS ${stats.total_expenses}`,
      trendUp: stats.total_income > stats.total_expenses,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900',
    },
    {
      title: 'Members Paid Up',
      value: `${stats.active_members - (stats.total_members - stats.active_members)}/${stats.total_members}`,
      icon: Users,
      trend: `${Math.round(((stats.active_members - (stats.total_members - stats.active_members)) / stats.total_members) * 100)}% current`,
      trendUp: true,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900',
    },
    {
      title: 'Current Month Collections',
      value: `GHS ${stats.monthly_collections[0]?.amount || 0}`,
      icon: TrendingUp,
      trend: `Target: GHS ${stats.total_members * 10}`,
      trendUp: (stats.monthly_collections[0]?.amount || 0) >= (stats.total_members * 10),
      color: 'text-teal-600',
      bgColor: 'bg-teal-100 dark:bg-teal-900',
    },
    {
      title: 'Net Balance',
      value: `GHS ${stats.net_balance.toLocaleString()}`,
      icon: AlertCircle,
      trend: `After expenses`,
      trendUp: stats.net_balance > 0,
      color: stats.net_balance > 0 ? 'text-green-600' : 'text-red-600',
      bgColor: stats.net_balance > 0 ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900',
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {statsCards.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className={`text-xs ${stat.trendUp ? 'text-green-600' : 'text-orange-600'}`}>
                {stat.trend}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

// Chart components
const MonthlyCollectionsChart = ({ data }: { data: any[] }) => {
  const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#06B6D4'];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Collections</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip 
              formatter={(value: any) => [`GHS ${value}`, 'Collected']}
              labelStyle={{ color: '#374151' }}
            />
            <Line 
              type="monotone" 
              dataKey="collected" 
              stroke="#3B82F6" 
              strokeWidth={2}
              dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

const PaymentMethodsChart = ({ data }: { data: any[] }) => {
  const COLORS = ['#3B82F6', '#8B5CF6'];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Methods</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) => `${name}: ${value}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: any) => [`${value}%`, 'Percentage']} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

// Recent activity component
const RecentActivity = ({ activities }: { activities: any[] }) => (
  <Card>
    <CardHeader>
      <CardTitle>Recent Activity</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center space-x-4 p-3 rounded-lg bg-muted/50"
          >
            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm font-medium">{activity.description}</p>
              <p className="text-xs text-muted-foreground">{activity.created_at}</p>
            </div>
            {activity.amount && (
              <div className="text-sm font-semibold text-green-600">
                GHS {activity.amount}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </CardContent>
  </Card>
);

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch dashboard stats
        const statsResponse = await apiClient.getDashboardStats();
        if (statsResponse.success && statsResponse.data) {
          setStats(statsResponse.data);
        } else {
          throw new Error(statsResponse.error || 'Failed to fetch dashboard stats');
        }

        // Fetch monthly collections
        const monthlyResponse = await apiClient.getMonthlyCollections();
        if (monthlyResponse.success && monthlyResponse.data) {
          setMonthlyData(monthlyResponse.data.chartData || []);
        }

        // Fetch payment methods
        const paymentResponse = await apiClient.getPaymentMethods();
        if (paymentResponse.success && paymentResponse.data) {
          setPaymentMethods(paymentResponse.data.paymentMethodData || []);
        }

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load dashboard data';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Failed to load dashboard</h3>
            <p className="text-muted-foreground">{error || 'Unknown error occurred'}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your Youth Ministry management system
        </p>
      </motion.div>

      {/* Stats Cards */}
      <StatsCards stats={stats} />

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        <MonthlyCollectionsChart data={monthlyData} />
        <PaymentMethodsChart data={paymentMethods} />
      </div>

      {/* Recent Activity */}
      <RecentActivity activities={stats.recent_activity} />
    </div>
  );
}