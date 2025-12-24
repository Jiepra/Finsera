/**
 * PDF Export Utility for POS Reports
 * Generates print-friendly report window for PDF export
 */

export interface POSReportData {
    totalSales: number;
    totalPurchases: number;
    totalCOGS: number;
    totalExpenses: number;
    grossProfit: number;
    netProfit: number;
    totalTransactions: number;
    totalPurchasesCount: number;
    totalExpensesCount: number;
    topSellingProducts: Array<{
        id: string;
        name: string;
        quantity: number;
        revenue: number;
    }>;
}

export interface ExportPDFOptions {
    reportData: POSReportData;
    selectedPeriod: string;
    formatCurrency: (amount: number) => string;
    onError?: (message: string) => void;
    onPreparing?: () => void;
    onComplete?: () => void;
}

/**
 * Get human-readable period text from period code
 */
export const getPeriodText = (period: string): string => {
    switch (period) {
        case 'today': return 'Hari Ini';
        case 'this-week': return 'Minggu Ini';
        case 'this-month': return 'Bulan Ini';
        case 'this-year': return 'Tahun Ini';
        default: return 'Kustom';
    }
};

/**
 * Generate the HTML content for the print-friendly report
 */
const generatePrintContent = (
    reportData: POSReportData,
    periodText: string,
    formatCurrency: (amount: number) => string
): string => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Laporan POS - ${periodText} | AkuAkuntan</title>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          background: white !important;
          padding: 20px;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 15px;
          border-bottom: 2px solid #2563eb;
        }
        .header h1 {
          font-size: 24px;
          margin-bottom: 5px;
          color: #1e40af;
        }
        .header h2 {
          font-size: 18px;
          color: #64748b;
          margin-bottom: 5px;
        }
        .header p {
          font-size: 14px;
          color: #94a3b8;
        }
        .summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }
        .summary-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 16px;
          text-align: center;
        }
        .summary-card h3 {
          font-size: 14px;
          color: #64748b;
          margin-bottom: 8px;
        }
        .summary-card .amount {
          font-size: 20px;
          font-weight: bold;
        }
        .card {
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          margin-bottom: 20px;
          overflow: hidden;
        }
        .card-header {
          background: #f1f5f9;
          padding: 12px 16px;
          border-bottom: 1px solid #e2e8f0;
        }
        .card-header h3 {
          font-size: 16px;
          font-weight: 600;
        }
        .card-content {
          padding: 16px;
        }
        .report-section {
          margin-bottom: 10px;
        }
        .section-header {
          font-weight: 600;
          font-size: 16px;
          margin-bottom: 10px;
          padding-bottom: 5px;
          border-bottom: 1px solid #e2e8f0;
        }
        .line-item {
          display: flex;
          justify-content: space-between;
          padding: 4px 0;
          border-bottom: 1px solid #f1f5f9;
        }
        .line-item.total {
          font-weight: bold;
          border-top: 1px solid #e2e8f0;
          margin-top: 5px;
          padding-top: 5px;
          border-bottom: none;
        }
        .no-print {
          display: none !important;
        }
        @media print {
          body {
            padding: 10px;
            font-size: 12px;
          }
          .summary-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .summary-card .amount {
            font-size: 16px;
          }
          .card-header {
            font-size: 14px;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>LAPORAN POS</h1>
        <h2>Periode: ${periodText}</h2>
        <p>Dicetak pada: ${new Date().toLocaleString('id-ID')}</p>
      </div>

      <div class="summary-grid">
        <div class="summary-card">
          <h3>Total Penjualan</h3>
          <div class="amount" style="color: #16a34a;">${formatCurrency(reportData.totalSales)}</div>
        </div>
        <div class="summary-card">
          <h3>Harga Pokok Penjualan</h3>
          <div class="amount" style="color: #dc2626;">${formatCurrency(reportData.totalCOGS)}</div>
        </div>
        <div class="summary-card">
          <h3>Laba Kotor</h3>
          <div class="amount" style="${reportData.grossProfit >= 0 ? 'color: #16a34a;' : 'color: #dc2626;'}">${formatCurrency(reportData.grossProfit)}</div>
        </div>
        <div class="summary-card">
          <h3>Laba Bersih</h3>
          <div class="amount" style="${reportData.netProfit >= 0 ? 'color: #2563eb;' : 'color: #dc2626;'}">${formatCurrency(reportData.netProfit)}</div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3>Detail Transaksi</h3>
        </div>
        <div class="card-content">
          <div class="line-item">
            <span>Total Penjualan</span>
            <span>${formatCurrency(reportData.totalSales)}</span>
          </div>
          <div class="line-item">
            <span>Harga Pokok Penjualan</span>
            <span style="color: #dc2626;">-${formatCurrency(reportData.totalCOGS)}</span>
          </div>
          <div class="line-item total">
            <span>Laba Kotor</span>
            <span style="${reportData.grossProfit >= 0 ? 'color: #16a34a;' : 'color: #dc2626;'}">${formatCurrency(reportData.grossProfit)}</span>
          </div>
          <div class="line-item" style="margin-top: 15px;">
            <span>Total Beban</span>
            <span>${formatCurrency(reportData.totalExpenses)}</span>
          </div>
          <div class="line-item total">
            <span>Laba Bersih</span>
            <span style="${reportData.netProfit >= 0 ? 'color: #2563eb;' : 'color: #dc2626;'}">${formatCurrency(reportData.netProfit)}</span>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3>Produk Terlaris</h3>
        </div>
        <div class="card-content">
          ${reportData.topSellingProducts.length > 0 ?
            reportData.topSellingProducts.map(product => `
              <div class="line-item">
                <span>${product.name}</span>
                <span>${product.quantity} pcs - ${formatCurrency(product.revenue)}</span>
              </div>
            `).join('') :
            '<p>Tidak ada data penjualan</p>'
        }
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3>Ringkasan</h3>
        </div>
        <div class="card-content">
          <div class="line-item">
            <span>Total Transaksi</span>
            <span>${reportData.totalTransactions}</span>
          </div>
          <div class="line-item">
            <span>Total Pembelian</span>
            <span>${reportData.totalPurchasesCount}</span>
          </div>
          <div class="line-item">
            <span>Total Beban</span>
            <span>${reportData.totalExpensesCount}</span>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Export POS report to PDF via print dialog
 * Opens a print-friendly window and triggers the print dialog
 */
export const exportPOSReportToPDF = (options: ExportPDFOptions): void => {
    const { reportData, selectedPeriod, formatCurrency, onError, onPreparing, onComplete } = options;

    if (!reportData) {
        onError?.('Data laporan belum siap. Harap tunggu sebentar.');
        return;
    }

    onPreparing?.();

    setTimeout(() => {
        // Create a print-friendly window
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            onError?.('Mohon izinkan popup untuk mengekspor PDF');
            onComplete?.();
            return;
        }

        const periodText = getPeriodText(selectedPeriod);
        const printContent = generatePrintContent(reportData, periodText, formatCurrency);

        printWindow.document.write(printContent);
        printWindow.document.close();

        // Complete callback after content is ready
        setTimeout(() => {
            onComplete?.();
        }, 2000);

        // Auto-print after content loads
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
        }, 500);
    }, 300);
};
