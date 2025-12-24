
import React, { useState } from 'react';
import { Plus, Search, Filter, ArrowDownCircle, Eye, Trash2, TrendingDown, Edit, ArrowUpCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useApp } from '@/contexts/AppContext';
import AddExpenseModal from './AddExpenseModal';
import { toast } from '@/components/ui/sonner';
import { formatRupiah } from '@/lib/utils';

const Beban: React.FC = () => {
  const { expenses, deleteExpense, updateExpense } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || expense.category.toLowerCase() === filterCategory;
    const matchesStatus = filterStatus === 'all' || expense.status.toLowerCase() === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    return status === 'Lunas'
      ? 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30'
      : 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30';
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Operasional': 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30',
      'Administrasi': 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30',
      'Penjualan': 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/30',
      'Lainnya': 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-700'
    };
    return colors[category] || 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-700';
  };

  const handleDelete = (expense: any) => {
    deleteExpense(expense.id);
    toast.error(`Beban "${expense.description}" berhasil dihapus`, {
      description: "Beban Dihapus",
    });
  };

  const handleEdit = (expense: any) => {
    const newStatus = expense.status === 'Lunas' ? 'Belum Lunas' : 'Lunas';
    updateExpense(expense.id, {
      status: newStatus,
      date: new Date().toISOString().split('T')[0]
    });
    toast.success(`Status beban "${expense.description}" diubah menjadi ${newStatus}`, {
      description: "Status Diperbarui",
    });
  };

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const paidExpenses = expenses.filter(e => e.status === 'Lunas').reduce((sum, e) => sum + e.amount, 0);
  const unpaidExpenses = expenses.filter(e => e.status === 'Belum Lunas').reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-950 min-h-screen transition-colors duration-300">
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
              <ArrowDownCircle className="mr-3 h-8 w-8 text-red-600 dark:text-red-400" />
              Beban & Pengeluaran
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Kelola semua pengeluaran dan beban operasional</p>
          </div>
          <Button
            onClick={() => setShowAddModal(true)}
            className="bg-red-600 hover:bg-red-700 w-full sm:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" />
            Tambah Pengeluaran
          </Button>
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
                  placeholder="Cari pengeluaran berdasarkan deskripsi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-48 dark:bg-gray-800 dark:border-gray-700">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter Kategori" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                  <SelectItem value="all">Semua Kategori</SelectItem>
                  <SelectItem value="operasional">Operasional</SelectItem>
                  <SelectItem value="administrasi">Administrasi</SelectItem>
                  <SelectItem value="penjualan">Penjualan</SelectItem>
                  <SelectItem value="lainnya">Lainnya</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-48 dark:bg-gray-800 dark:border-gray-700">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter Status" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="lunas">Lunas</SelectItem>
                  <SelectItem value="belum lunas">Belum Lunas</SelectItem>
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
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Pengeluaran</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{formatRupiah(totalExpenses)}</p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">{expenses.length} transaksi</p>
              </div>
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                <TrendingDown className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="dark:bg-gray-900 dark:border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Sudah Dibayar</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{formatRupiah(paidExpenses)}</p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">{expenses.filter(e => e.status === 'Lunas').length} transaksi</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                <ArrowUpCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="dark:bg-gray-900 dark:border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Belum Dibayar</p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{formatRupiah(unpaidExpenses)}</p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">{expenses.filter(e => e.status === 'Belum Lunas').length} transaksi</p>
              </div>
              <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                <ArrowDownCircle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Expenses List */}
      <Card className="dark:bg-gray-900 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="dark:text-white">Daftar Pengeluaran</CardTitle>
        </CardHeader>
        <CardContent>
          {expenses.length === 0 ? (
            <div className="text-center py-12">
              <ArrowDownCircle className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">Belum Ada Pengeluaran</h3>
              <p className="text-gray-500 dark:text-gray-500 mb-6">Mulai catat pengeluaran bisnis Anda untuk laporan yang akurat</p>
              <Button
                onClick={() => setShowAddModal(true)}
                className="bg-red-600 hover:bg-red-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Tambah Pengeluaran Pertama
              </Button>
            </div>
          ) : (
            <>
              {/* Mobile Card Layout */}
              <div className="md:hidden space-y-4">
                {filteredExpenses.map((expense) => (
                  <div key={expense.id} className="border dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-gray-900 dark:text-white truncate">{expense.description}</h3>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${getCategoryColor(expense.category)}`}>
                            {expense.category}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-2">
                          <span>{new Date(expense.date).toLocaleDateString('id-ID')}</span>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(expense.status)}`}>
                            {expense.status}
                          </span>
                        </div>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">{formatRupiah(expense.amount)}</p>
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2 mt-3">
                      <Button
                        size="sm"
                        variant="outline"
                        className={`dark:border-gray-600 ${expense.status === 'Lunas' ? "text-orange-600 dark:text-orange-400" : "text-green-600 dark:text-green-400"}`}
                        onClick={() => handleEdit(expense)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 dark:text-red-400 dark:border-gray-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="dark:bg-gray-900 dark:border-gray-800">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="dark:text-white">Yakin ingin menghapus beban ini?</AlertDialogTitle>
                            <AlertDialogDescription className="dark:text-gray-400">
                              Beban <strong>{expense.description}</strong> akan dihapus secara permanen.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="dark:bg-gray-800 dark:border-gray-700 dark:text-white">Batal</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(expense)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Hapus
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table Layout */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b dark:border-gray-700">
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-200">Tanggal</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-200">Deskripsi</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-200">Kategori</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-200">Jumlah</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-200">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-200">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredExpenses.map((expense) => (
                      <tr key={expense.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="py-3 px-4 dark:text-gray-300">
                          {new Date(expense.date).toLocaleDateString('id-ID')}
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{expense.description}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{expense.id}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(expense.category)}`}>
                            {expense.category}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {formatRupiah(expense.amount)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(expense.status)}`}>
                            {expense.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className={`dark:border-gray-600 ${expense.status === 'Lunas' ? "text-orange-600 dark:text-orange-400" : "text-green-600 dark:text-green-400"}`}
                              onClick={() => handleEdit(expense)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-red-600 dark:text-red-400 dark:border-gray-600"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="dark:bg-gray-900 dark:border-gray-800">
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="dark:text-white">Yakin ingin menghapus beban ini?</AlertDialogTitle>
                                  <AlertDialogDescription className="dark:text-gray-400">
                                    Beban <strong>{expense.description}</strong> akan dihapus secara permanen.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="dark:bg-gray-800 dark:border-gray-700 dark:text-white">Batal</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(expense)}
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
            </>
          )}

          {filteredExpenses.length === 0 && expenses.length > 0 && (
            <div className="text-center py-8">
              <ArrowDownCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">Tidak ada pengeluaran yang ditemukan</p>
            </div>
          )}
        </CardContent>
      </Card>

      <AddExpenseModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
    </div>
  );
};

export default Beban;
