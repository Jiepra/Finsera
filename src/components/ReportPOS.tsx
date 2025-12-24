import React, { useState, useEffect, useRef } from 'react';
import { FileText, TrendingUp, TrendingDown, DollarSign, Calendar, Printer, Package, BarChart3, ShoppingCart, Receipt } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useApp } from '@/contexts/AppContext';
import { toast } from '@/components/ui/sonner';
import { exportPOSReportToPDF, POSReportData } from '@/lib/pdfExport';

const ReportPOS: React.FC = () => {
  const { transactions, products, purchases, expenses } = useApp();
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [reportData, setReportData] = useState<POSReportData | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);
  const exportButtonRef = useRef<HTMLButtonElement>(null);

  const formatCurrency = (amount: number) => {
    return `Rp ${amount.toLocaleString('id-ID')}`;
  };

  const getPeriodDates = (period: string) => {
    const now = new Date();
    let startDate: Date, endDate: Date;

    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        break;
      case 'this-week':
        const dayOfWeek = now.getDay();
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek);
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek + 7);
        break;
      case 'this-month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case 'this-year':
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    }

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    };
  };

  useEffect(() => {
    const { startDate, endDate } = getPeriodDates(selectedPeriod);
    generateReport(startDate, endDate);
  }, [selectedPeriod, transactions, purchases, expenses]);

  const generateReport = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

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

    const totalSales = periodTransactions
      .filter(t => t.type === 'Penjualan')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalPurchases = periodPurchases.reduce((sum, p) => sum + p.amount, 0);

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

    const totalExpenses = periodExpenses.reduce((sum, e) => sum + e.amount, 0);
    const grossProfit = totalSales - totalCOGS;
    const netProfit = grossProfit - totalExpenses;
    const totalTransactions = periodTransactions.length;
    const totalPurchasesCount = periodPurchases.length;
    const totalExpensesCount = periodExpenses.length;

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

    setReportData({
      totalSales,
      totalPurchases,
      totalCOGS,
      totalExpenses,
      grossProfit,
      netProfit,
      totalTransactions,
      totalPurchasesCount,
      totalExpensesCount,
      topSellingProducts
    });
  };

  const handleExportPDF = () => {
    if (!reportData) {
      toast.error('Data laporan belum siap. Harap tunggu sebentar.', {
        description: "Error",
      });
      return;
    }

    const button = exportButtonRef.current;

    exportPOSReportToPDF({
      reportData,
      selectedPeriod,
      formatCurrency,
      onError: (message) => {
        toast.error(message, { description: "Error" });
      },
      onPreparing: () => {
        if (button) {
          button.textContent = 'Mempersiapkan...';
          button.disabled = true;
        }
      },
      onComplete: () => {
        if (button) {
          button.textContent = 'Cetak PDF';
          button.disabled = false;
        }
      }
    });
  };

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-950 min-h-screen transition-colors duration-300">
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
              <BarChart3 className="mr-3 h-8 w-8 text-blue-600 dark:text-blue-400" />
              Finsera Report
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Laporan penjualan</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-2 rounded-lg border dark:border-gray-700">
              <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="border-0 shadow-none focus:ring-0 focus:ring-offset-0 h-auto font-medium dark:bg-gray-800">
                  <SelectValue placeholder="Pilih Periode" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                  <SelectItem value="today">Hari Ini</SelectItem>
                  <SelectItem value="this-week">Minggu Ini</SelectItem>
                  <SelectItem value="this-month">Bulan Ini</SelectItem>
                  <SelectItem value="this-year">Tahun Ini</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button
                ref={exportButtonRef}
                className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
                onClick={handleExportPDF}
              >
                <Printer className="h-4 w-4" />
                Cetak PDF
              </Button>
            </div>
          </div>
        </div>
      </div>

      {reportData ? (
        <div ref={reportRef} className="print:hidden">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="hover:shadow-md transition-shadow dark:bg-gray-900 dark:border-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Penjualan</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">{formatCurrency(reportData.totalSales)}</p>
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
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">{formatCurrency(reportData.totalCOGS)}</p>
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
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{formatCurrency(reportData.grossProfit)}</p>
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
                    <p className={`text-2xl font-bold ${reportData.netProfit >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`}>
                      {formatCurrency(reportData.netProfit)}
                    </p>
                  </div>
                  <div className={`p-3 rounded-full ${reportData.netProfit >= 0 ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                    <DollarSign className={`h-6 w-6 ${reportData.netProfit >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Transaction Summary */}
            <Card className="dark:bg-gray-900 dark:border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-white">
                  <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  Detail Transaksi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between dark:text-gray-300">
                      <span>Total Penjualan</span>
                      <span className="font-medium">{formatCurrency(reportData.totalSales)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="dark:text-gray-300">Harga Pokok Penjualan</span>
                      <span className="font-medium text-red-600 dark:text-red-400">-{formatCurrency(reportData.totalCOGS)}</span>
                    </div>
                    <div className="flex justify-between font-semibold border-t pt-2 border-gray-200 dark:border-gray-700">
                      <span className="dark:text-white">Laba Kotor</span>
                      <span className={reportData.grossProfit >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                        {formatCurrency(reportData.grossProfit)}
                      </span>
                    </div>
                    <div className="flex justify-between pt-3 dark:text-gray-300">
                      <span>Total Beban</span>
                      <span className="font-medium">{formatCurrency(reportData.totalExpenses)}</span>
                    </div>
                    <div className="flex justify-between font-semibold border-t pt-2 border-gray-200 dark:border-gray-700 text-lg">
                      <span className="dark:text-white">Laba Bersih</span>
                      <span className={reportData.netProfit >= 0 ? "text-blue-600 dark:text-blue-400" : "text-red-600 dark:text-red-400"}>
                        {formatCurrency(reportData.netProfit)}
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
                  Produk Terlaris
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {reportData.topSellingProducts.length > 0 ? (
                    reportData.topSellingProducts.map((product: any, index: number) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b dark:border-gray-700 last:border-b-0">
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
                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">Tidak ada data penjualan</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Summary Stats */}
            <Card className="lg:col-span-2 dark:bg-gray-900 dark:border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-white">
                  <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  Ringkasan Statistik
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{reportData.totalTransactions}</p>
                    <p className="text-gray-600 dark:text-gray-400">Total Transaksi</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">{reportData.totalPurchasesCount}</p>
                    <p className="text-gray-600 dark:text-gray-400">Total Pembelian</p>
                  </div>
                  <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">{reportData.totalExpensesCount}</p>
                    <p className="text-gray-600 dark:text-gray-400">Total Beban</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Memuat laporan POS...</p>
        </div>
      )}
    </div>
  );
};

export default ReportPOS;