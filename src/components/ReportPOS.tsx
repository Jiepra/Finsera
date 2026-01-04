import React, { useState } from 'react';
import { FileText, TrendingUp, DollarSign, Calendar, Printer, Package, BarChart3, ShoppingCart, Receipt } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';
import { toast } from '@/components/ui/sonner';
import { exportPOSReportToPDF, POSReportData } from '@/lib/pdfExport';

type PeriodType = 'today' | 'this-week' | 'this-month' | 'this-year';

const ReportPOS: React.FC = () => {
  const { transactions, products, purchases, expenses } = useApp();
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('today');

  const formatCurrency = (amount: number) => {
    return `Rp ${amount.toLocaleString('id-ID')}`;
  };

  // Calculate period dates
  const getDateRange = (period: PeriodType): { start: Date; end: Date } => {
    const now = new Date();
    let start: Date;
    let end = new Date(now);
    end.setHours(23, 59, 59, 999);

    switch (period) {
      case 'today':
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
        break;
      case 'this-week':
        const dayOfWeek = now.getDay();
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek, 0, 0, 0, 0);
        break;
      case 'this-month':
        start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
        break;
      case 'this-year':
        start = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
        break;
      default:
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    }

    return { start, end };
  };

  // Get period label
  const getPeriodLabel = (period: PeriodType): string => {
    switch (period) {
      case 'today': return 'Hari Ini';
      case 'this-week': return 'Minggu Ini';
      case 'this-month': return 'Bulan Ini';
      case 'this-year': return 'Tahun Ini';
      default: return 'Hari Ini';
    }
  };

  // CALCULATE DATA BASED ON SELECTED PERIOD - This runs on every render when period changes
  const { start, end } = getDateRange(selectedPeriod);

  // Filter data by period
  const periodTransactions = transactions.filter(t => {
    const date = new Date(t.date);
    return date >= start && date <= end;
  });

  const periodPurchases = purchases.filter(p => {
    const date = new Date(p.date);
    return date >= start && date <= end;
  });

  const periodExpenses = expenses.filter(e => {
    const date = new Date(e.date);
    return date >= start && date <= end;
  });

  // Calculate totals
  const totalSales = periodTransactions
    .filter(t => t.type === 'Penjualan')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalPurchasesAmount = periodPurchases.reduce((sum, p) => sum + p.amount, 0);

  // Calculate COGS
  let totalCOGS = 0;
  periodTransactions
    .filter(t => t.type === 'Penjualan')
    .forEach(t => {
      t.items.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if (product) {
          totalCOGS += item.quantity * (product.cost || 0);
        }
      });
    });

  const totalExpensesAmount = periodExpenses.reduce((sum, e) => sum + e.amount, 0);
  const grossProfit = totalSales - totalCOGS;
  const netProfit = grossProfit - totalExpensesAmount;
  const totalTransactionsCount = periodTransactions.filter(t => t.type === 'Penjualan').length;
  const totalPurchasesCount = periodPurchases.length;
  const totalExpensesCount = periodExpenses.length;

  // Calculate top selling products
  const productSales: Record<string, { name: string; quantity: number; revenue: number }> = {};
  periodTransactions
    .filter(t => t.type === 'Penjualan')
    .forEach(t => {
      t.items.forEach(item => {
        if (productSales[item.productId]) {
          productSales[item.productId].quantity += item.quantity;
          productSales[item.productId].revenue += item.quantity * item.price;
        } else {
          const product = products.find(p => p.id === item.productId);
          productSales[item.productId] = {
            name: product ? product.name : item.productName,
            quantity: item.quantity,
            revenue: item.quantity * item.price
          };
        }
      });
    });

  const topSellingProducts = Object.entries(productSales)
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  // Create report data for PDF export
  const reportData: POSReportData = {
    totalSales,
    totalPurchases: totalPurchasesAmount,
    totalCOGS,
    totalExpenses: totalExpensesAmount,
    grossProfit,
    netProfit,
    totalTransactions: totalTransactionsCount,
    totalPurchasesCount,
    totalExpensesCount,
    topSellingProducts
  };

  const handleExportPDF = () => {
    exportPOSReportToPDF({
      reportData,
      selectedPeriod,
      formatCurrency,
      onError: (message) => {
        toast.error(message, { description: "Error" });
      },
      onPreparing: () => { },
      onComplete: () => {
        toast.success('PDF berhasil diekspor!');
      }
    });
  };

  // Handle period change
  const handlePeriodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPeriod(e.target.value as PeriodType);
  };

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-950 min-h-screen transition-colors duration-300">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
              <BarChart3 className="mr-3 h-8 w-8 text-blue-600 dark:text-blue-400" />
              Finsera Report
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Laporan penjualan - <strong>{getPeriodLabel(selectedPeriod)}</strong>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {/* Period Selector */}
            <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg border dark:border-gray-700">
              <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              <select
                value={selectedPeriod}
                onChange={handlePeriodChange}
                className="bg-transparent border-0 font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-0 cursor-pointer pr-8"
              >
                <option value="today">Hari Ini</option>
                <option value="this-week">Minggu Ini</option>
                <option value="this-month">Bulan Ini</option>
                <option value="this-year">Tahun Ini</option>
              </select>
            </div>

            {/* Export Button */}
            <Button
              className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
              onClick={handleExportPDF}
            >
              <Printer className="h-4 w-4" />
              Cetak PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="hover:shadow-md transition-shadow dark:bg-gray-900 dark:border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Penjualan</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{formatCurrency(totalSales)}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{totalTransactionsCount} transaksi</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                <ShoppingCart className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow dark:bg-gray-900 dark:border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Harga Pokok Penjualan</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{formatCurrency(totalCOGS)}</p>
              </div>
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                <Receipt className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow dark:bg-gray-900 dark:border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Laba Kotor</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{formatCurrency(grossProfit)}</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow dark:bg-gray-900 dark:border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Laba Bersih</p>
                <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`}>
                  {formatCurrency(netProfit)}
                </p>
              </div>
              <div className={`p-3 rounded-full ${netProfit >= 0 ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                <DollarSign className={`h-6 w-6 ${netProfit >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detail Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transaction Summary */}
        <Card className="dark:bg-gray-900 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 dark:text-white">
              <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              Detail Transaksi ({getPeriodLabel(selectedPeriod)})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between dark:text-gray-300">
                  <span>Total Penjualan</span>
                  <span className="font-medium">{formatCurrency(totalSales)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="dark:text-gray-300">Harga Pokok Penjualan</span>
                  <span className="font-medium text-red-600 dark:text-red-400">-{formatCurrency(totalCOGS)}</span>
                </div>
                <div className="flex justify-between font-semibold border-t pt-2 border-gray-200 dark:border-gray-700">
                  <span className="dark:text-white">Laba Kotor</span>
                  <span className={grossProfit >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                    {formatCurrency(grossProfit)}
                  </span>
                </div>
                <div className="flex justify-between pt-3 dark:text-gray-300">
                  <span>Total Beban</span>
                  <span className="font-medium">{formatCurrency(totalExpensesAmount)}</span>
                </div>
                <div className="flex justify-between font-semibold border-t pt-2 border-gray-200 dark:border-gray-700 text-lg">
                  <span className="dark:text-white">Laba Bersih</span>
                  <span className={netProfit >= 0 ? "text-blue-600 dark:text-blue-400" : "text-red-600 dark:text-red-400"}>
                    {formatCurrency(netProfit)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Selling Products */}
        <Card className="dark:bg-gray-900 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 dark:text-white">
              <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              Produk Terlaris ({getPeriodLabel(selectedPeriod)})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topSellingProducts.length > 0 ? (
                topSellingProducts.map((product, index) => (
                  <div key={product.id + index} className="flex justify-between items-center py-2 border-b dark:border-gray-700 last:border-b-0">
                    <div>
                      <p className="font-medium dark:text-white">{product.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{product.quantity} pcs terjual</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium dark:text-white">{formatCurrency(product.revenue)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">Tidak ada data penjualan untuk periode ini</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <Card className="lg:col-span-2 dark:bg-gray-900 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 dark:text-white">
              <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              Ringkasan Statistik ({getPeriodLabel(selectedPeriod)})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalTransactionsCount}</p>
                <p className="text-gray-600 dark:text-gray-400">Total Transaksi Penjualan</p>
              </div>
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{totalPurchasesCount}</p>
                <p className="text-gray-600 dark:text-gray-400">Total Pembelian</p>
              </div>
              <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{totalExpensesCount}</p>
                <p className="text-gray-600 dark:text-gray-400">Total Beban</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReportPOS;