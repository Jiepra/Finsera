import React, { useEffect, useState, useMemo } from 'react';
import {
  TrendingUp,
  Receipt,
  Package,
  DollarSign,
  AlertTriangle,
  ArrowUpCircle,
  ArrowDownCircle,
  LogOut,
  Calendar,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useApp } from '@/contexts/AppContext';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/sonner';
import { LineChart, Line, XAxis, YAxis, Tooltip as ChartTooltip, ResponsiveContainer, Legend } from 'recharts';

type ChartPeriod = '7days' | '30days' | '365days' | 'all';

const Dashboard: React.FC = () => {
  const { transactions, products, purchases, expenses, getFinancialSummary, getAccountsData } = useApp();
  const navigate = useNavigate();
  const summary = getFinancialSummary();
  const accounts = getAccountsData();
  const [chartPeriod, setChartPeriod] = useState<ChartPeriod>('all');

  useEffect(() => {
    const user = localStorage.getItem("current_user");
    if (!user) navigate("/auth");
  }, [navigate]);

  const handleLogout = () => {
    toast.error("Klik tombol di bawah untuk konfirmasi.", {
      description: "Yakin ingin logout?",
      action: (
        <Button
          variant="destructive"
          size="sm"
          onClick={() => {
            toast.success("Sampai jumpa kembali 👋", {
              description: "Logout berhasil",
            });
            setTimeout(() => {
              localStorage.removeItem("current_user");
              window.location.href = "/auth";
            }, 1000);
          }}
        >
          Keluar
        </Button>
      ),
    });
  };

  const today = new Date().toISOString().split('T')[0];
  const todayTransactions = transactions.filter(t => t.date === today);
  const todayRevenue = todayTransactions.filter(t => t.type === 'Penjualan').reduce((sum, t) => sum + t.amount, 0);
  const todayPurchases = purchases.filter(p => p.date === today);
  const todayExpenses = expenses.filter(e => e.date === today);
  const todayPurchaseAmount = todayPurchases.reduce((sum, p) => sum + p.amount, 0);
  const todayExpenseAmount = todayExpenses.reduce((sum, e) => sum + e.amount, 0);

  const lowStockProducts = products.filter(p => p.stock < p.minStock);
  const outOfStockProducts = products.filter(p => p.stock === 0);

  const currentMonth = new Date().toISOString().slice(0, 7);
  const thisMonthTransactions = transactions.filter(t => t.date.startsWith(currentMonth));

  const stats = [
    {
      title: 'PEMASUKAN Hari Ini',
      value: `Rp ${todayRevenue.toLocaleString('id-ID')}`,
      change: `${todayTransactions.filter(t => t.type === 'Penjualan').length} transaksi`,
      icon: ArrowUpCircle,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
    },
    {
      title: 'PENGELUARAN Hari Ini',
      value: `Rp ${(todayPurchaseAmount + todayExpenseAmount).toLocaleString('id-ID')}`,
      change: `${todayPurchases.length + todayExpenses.length} transaksi`,
      icon: ArrowDownCircle,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-100 dark:bg-red-900/30',
    },
    {
      title: 'Total Produk',
      value: products.length.toString(),
      change: lowStockProducts.length > 0 ? `${lowStockProducts.length} stok rendah` : 'Stok aman',
      icon: Package,
      color: lowStockProducts.length > 0 ? 'text-orange-600 dark:text-orange-400' : 'text-green-600 dark:text-green-400',
      bgColor: lowStockProducts.length > 0 ? 'bg-orange-100 dark:bg-orange-900/30' : 'bg-green-100 dark:bg-green-900/30',
    },
    {
      title: 'Laba Bersih',
      value: `Rp ${(summary.netIncome || 0).toLocaleString('id-ID')}`,
      change: summary.netIncome >= 0 ? 'Profit' : 'Loss',
      icon: DollarSign,
      color: summary.netIncome >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400',
      bgColor: summary.netIncome >= 0 ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-red-100 dark:bg-red-900/30',
    },
  ];

  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // Generate date range based on selected period
  const getDateRange = (period: ChartPeriod): string[] => {
    const now = new Date();
    let days: number;

    switch (period) {
      case '7days':
        days = 7;
        break;
      case '30days':
        days = 30;
        break;
      case '365days':
        days = 365;
        break;
      case 'all':
      default:
        // Get the earliest date from all data
        const allDates = [
          ...transactions.map(t => t.date),
          ...purchases.map(p => p.date),
          ...expenses.map(e => e.date)
        ].filter(Boolean);

        if (allDates.length === 0) {
          days = 7;
        } else {
          const earliestDate = new Date(Math.min(...allDates.map(d => new Date(d).getTime())));
          const diffTime = Math.abs(now.getTime() - earliestDate.getTime());
          days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
          days = Math.min(days, 365); // Cap at 365 days for performance
        }
        break;
    }

    return Array.from({ length: days }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();
  };

  // Memoize chart data for performance
  const chartData = useMemo(() => {
    const dateRange = getDateRange(chartPeriod);

    // For periods > 30 days, aggregate by week or month
    if (dateRange.length > 30) {
      // Aggregate by week
      const weeklyData: { [key: string]: { revenue: number; expense: number } } = {};

      dateRange.forEach(date => {
        const d = new Date(date);
        const weekStart = new Date(d);
        weekStart.setDate(d.getDate() - d.getDay());
        const weekKey = weekStart.toISOString().split('T')[0];

        if (!weeklyData[weekKey]) {
          weeklyData[weekKey] = { revenue: 0, expense: 0 };
        }

        const revenue = transactions.filter(t => t.type === 'Penjualan' && t.date === date).reduce((s, t) => s + t.amount, 0);
        const expense = purchases.filter(p => p.date === date).reduce((s, p) => s + p.amount, 0) +
          expenses.filter(e => e.date === date).reduce((s, e) => s + e.amount, 0);

        weeklyData[weekKey].revenue += revenue;
        weeklyData[weekKey].expense += expense;
      });

      return Object.entries(weeklyData)
        .map(([date, data]) => ({
          date: new Date(date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
          revenue: data.revenue,
          expense: data.expense
        }))
        .slice(-52); // Max 52 weeks
    }

    return dateRange.map(date => {
      const revenue = transactions.filter(t => t.type === 'Penjualan' && t.date === date).reduce((s, t) => s + t.amount, 0);
      const expense = purchases.filter(p => p.date === date).reduce((s, p) => s + p.amount, 0) +
        expenses.filter(e => e.date === date).reduce((s, e) => s + e.amount, 0);
      return {
        date: new Date(date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
        revenue,
        expense
      };
    });
  }, [chartPeriod, transactions, purchases, expenses]);

  const getPeriodLabel = (period: ChartPeriod): string => {
    switch (period) {
      case '7days': return '7 Hari Terakhir';
      case '30days': return '30 Hari Terakhir';
      case '365days': return '1 Tahun Terakhir';
      case 'all': return 'Semua Waktu';
      default: return 'Semua Waktu';
    }
  };

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-950 min-h-screen space-y-6 transition-colors duration-300">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">{new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <Button
          onClick={handleLogout}
          variant="outline"
          className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20 dark:border-red-800"
        >
          <LogOut className="mr-2 h-4 w-4" /> Logout
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card key={i} className="hover:shadow-lg transition-all dark:bg-gray-900 dark:border-gray-800">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{stat.title}</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                  <p className={`text-sm ${stat.color}`}>{stat.change}</p>
                </div>
                <div className={`p-2 rounded-full ${stat.bgColor}`}><Icon className={`w-6 h-6 ${stat.color}`} /></div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="dark:bg-gray-900 dark:border-gray-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg dark:text-white flex items-center gap-2">
            📊 Grafik Penjualan & Pengeluaran
          </CardTitle>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            <Select value={chartPeriod} onValueChange={(value: ChartPeriod) => setChartPeriod(value)}>
              <SelectTrigger className="w-[180px] h-9 dark:bg-gray-800 dark:border-gray-700">
                <SelectValue placeholder="Pilih Periode" />
              </SelectTrigger>
              <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                <SelectItem value="all">Semua Waktu</SelectItem>
                <SelectItem value="7days">7 Hari Terakhir</SelectItem>
                <SelectItem value="30days">30 Hari Terakhir</SelectItem>
                <SelectItem value="365days">1 Tahun Terakhir</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{getPeriodLabel(chartPeriod)}</p>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <XAxis dataKey="date" stroke="#6b7280" fontSize={11} tickMargin={8} />
              <YAxis tickFormatter={v => `Rp ${(v / 1000).toFixed(0)}k`} stroke="#6b7280" fontSize={11} />
              <ChartTooltip
                formatter={(v: number) => [`Rp ${v.toLocaleString('id-ID')}`, '']}
                contentStyle={{
                  backgroundColor: 'rgba(17, 24, 39, 0.95)',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={2} name="Penjualan" dot={chartData.length <= 14} />
              <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} name="Pengeluaran" dot={chartData.length <= 14} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="dark:bg-gray-900 dark:border-gray-800">
          <CardHeader><CardTitle className="dark:text-white">📑 Transaksi Terbaru</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {recentTransactions.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-sm">Belum ada transaksi.</p>
            ) : recentTransactions.map(t => (
              <div key={t.id} className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
                <div>
                  <p className="font-medium text-gray-700 dark:text-gray-200">{t.customer} - {t.type}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t.date} • {t.id}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-800 dark:text-white">Rp {t.amount.toLocaleString('id-ID')}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${t.status === 'Lunas' ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-400'}`}>{t.status}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-900 dark:border-gray-800">
          <CardHeader><CardTitle className="dark:text-white">📘 Ringkasan Keuangan</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <span className="text-green-700 dark:text-green-400 font-medium">Penjualan</span>
              <span className="text-green-600 dark:text-green-400 font-bold">Rp {(summary.totalRevenue || 0).toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <span className="text-red-700 dark:text-red-400 font-medium">Pembelian</span>
              <span className="text-red-600 dark:text-red-400 font-bold">Rp {(summary.totalPurchases || 0).toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <span className="text-red-700 dark:text-red-400 font-medium">Beban</span>
              <span className="text-red-600 dark:text-red-400 font-bold">Rp {(summary.totalExpenses || 0).toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <span className="text-blue-700 dark:text-blue-400 font-medium">Laba Kotor</span>
              <span className="text-blue-600 dark:text-blue-400 font-bold">Rp {(summary.grossProfit || 0).toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <span className="text-purple-700 dark:text-purple-400 font-semibold">Laba Bersih</span>
              <span className="text-purple-600 dark:text-purple-400 font-bold text-lg">Rp {(summary.netIncome || 0).toLocaleString('id-ID')}</span>
            </div>
            {summary.netIncome > 0 && summary.totalRevenue > 0 && (
              <div className="mt-4 p-3 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-sm text-green-700 dark:text-green-400 font-medium text-center">
                  <strong>Margin Laba:</strong> {((summary.netIncome / summary.totalRevenue) * 100).toFixed(1)}% - {
                    (summary.netIncome / summary.totalRevenue) * 100 > 15 ? 'Sangat Baik!' :
                      (summary.netIncome / summary.totalRevenue) * 100 > 10 ? 'Baik' : 'Perlu Perbaikan'
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
export default Dashboard;
