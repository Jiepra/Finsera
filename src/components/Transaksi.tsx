
import React, { useState } from 'react';
import { Search, Filter, Receipt, Eye, Trash2, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useApp, Transaction } from '@/contexts/AppContext';
import TransactionDetailModal from './TransactionDetailModal';
import { toast } from '@/components/ui/sonner';

const Transaksi: React.FC = () => {
  const { transactions, deleteTransaction } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || transaction.type.toLowerCase() === filterType;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    return status === 'Lunas'
      ? 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30'
      : 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30';
  };

  const getTypeColor = (type: string) => {
    return type === 'Penjualan'
      ? 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30'
      : 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30';
  };

  const handleViewDetail = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowDetailModal(true);
  };

  const handleDelete = (transaction: Transaction) => {
    deleteTransaction(transaction.id);
    toast.success(`Transaksi ${transaction.id} berhasil dihapus!`, {
      description: "Berhasil",
    });
  };

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-950 min-h-screen transition-colors duration-300">
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
              <Receipt className="mr-3 h-8 w-8" />
              Transaksi
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Kelola semua transaksi penjualan dan pembelian</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6 dark:bg-gray-900 dark:border-gray-800">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Cari transaksi berdasarkan nama pelanggan atau ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-48 dark:bg-gray-800 dark:border-gray-700">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter Tipe" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                  <SelectItem value="all">Semua Transaksi</SelectItem>
                  <SelectItem value="penjualan">Penjualan</SelectItem>
                  <SelectItem value="pembelian">Pembelian</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="dark:bg-gray-900 dark:border-gray-800">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Transaksi</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{transactions.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="dark:bg-gray-900 dark:border-gray-800">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Penjualan</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                Rp {transactions.filter(t => t.type === 'Penjualan').reduce((sum, t) => sum + t.amount, 0).toLocaleString('id-ID')}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="dark:bg-gray-900 dark:border-gray-800">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Pembelian</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                Rp {transactions.filter(t => t.type === 'Pembelian').reduce((sum, t) => sum + t.amount, 0).toLocaleString('id-ID')}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card className="dark:bg-gray-900 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="dark:text-white">Daftar Transaksi</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-12">
              <Receipt className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">Belum Ada Transaksi</h3>
              <p className="text-gray-500 dark:text-gray-500 mb-6">Transaksi akan muncul di sini setelah Anda melakukan penjualan di kasir</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-200">ID Transaksi</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-200">Tanggal</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-200">Pelanggan/Supplier</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-200">Tipe</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-200">Jumlah</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-200">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-200">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="py-3 px-4">
                        <span className="font-medium text-blue-600 dark:text-blue-400">{transaction.id}</span>
                      </td>
                      <td className="py-3 px-4 dark:text-gray-300">
                        {new Date(transaction.date).toLocaleDateString('id-ID')}
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{transaction.customer}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{transaction.description}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(transaction.type)}`}>
                          {transaction.type}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-gray-900 dark:text-white">
                          Rp {transaction.amount.toLocaleString('id-ID')}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                          {transaction.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            title="Lihat Detail"
                            onClick={() => handleViewDetail(transaction)}
                            className="dark:border-gray-700 dark:hover:bg-gray-800"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                title="Hapus"
                                className="text-red-600 hover:text-red-700 dark:text-red-400 dark:border-gray-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="dark:bg-gray-900 dark:border-gray-800">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="dark:text-white">Yakin ingin menghapus transaksi ini?</AlertDialogTitle>
                                <AlertDialogDescription className="dark:text-gray-400">
                                  Transaksi <strong>{transaction.id}</strong> akan dihapus secara permanen.
                                  Tindakan ini tidak dapat dibatalkan.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="dark:bg-gray-800 dark:border-gray-700 dark:text-white">Batal</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(transaction)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Hapus
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {filteredTransactions.length === 0 && transactions.length > 0 && (
            <div className="text-center py-8">
              <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">Tidak ada transaksi yang ditemukan</p>
            </div>
          )}
        </CardContent>
      </Card>

      <TransactionDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        transaction={selectedTransaction}
      />
    </div>
  );
};

export default Transaksi;
