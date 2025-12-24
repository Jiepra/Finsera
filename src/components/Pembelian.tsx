
import React, { useState } from 'react';
import { Plus, Search, Filter, ShoppingBag, Eye, Trash2, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useApp } from '@/contexts/AppContext';
import AddPurchaseModal from './AddPurchaseModal';
import PurchaseDetailModal from './PurchaseDetailModal';
import { toast } from '@/components/ui/sonner';
import { Purchase } from '@/contexts/AppContext';

const Pembelian: React.FC = () => {
  const { purchases, deletePurchase } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);

  const filteredPurchases = purchases.filter(purchase => {
    const matchesSearch = purchase.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
      purchase.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || purchase.status.toLowerCase() === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    return status === 'Lunas'
      ? 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30'
      : 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30';
  };

  const handleViewDetail = (purchase: Purchase) => {
    setSelectedPurchase(purchase);
    setShowDetailModal(true);
  };

  const handleDelete = (purchase: Purchase) => {
    deletePurchase(purchase.id);
    toast.error(`Pembelian ${purchase.id} berhasil dihapus`, {
      description: "Pembelian Dihapus",
    });
  };

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-950 min-h-screen transition-colors duration-300">
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
              <ShoppingBag className="mr-3 h-8 w-8" />
              Pembelian
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Kelola pembelian barang dan persediaan</p>
          </div>
          <Button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Tambah Pembelian
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
                  placeholder="Cari pembelian berdasarkan supplier atau ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                />
              </div>
            </div>
            <div className="flex gap-2">
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
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Pembelian</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{purchases.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="dark:bg-gray-900 dark:border-gray-800">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Nilai Pembelian</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                Rp {purchases.reduce((sum, p) => sum + p.amount, 0).toLocaleString('id-ID')}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="dark:bg-gray-900 dark:border-gray-800">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Belum Lunas</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                Rp {purchases.filter(p => p.status === 'Belum Lunas').reduce((sum, p) => sum + p.amount, 0).toLocaleString('id-ID')}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Purchases Table */}
      <Card className="dark:bg-gray-900 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="dark:text-white">Daftar Pembelian</CardTitle>
        </CardHeader>
        <CardContent>
          {purchases.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">Belum Ada Pembelian</h3>
              <p className="text-gray-500 dark:text-gray-500 mb-6">Mulai tambahkan pembelian barang untuk bisnis Anda</p>
              <Button
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Tambah Pembelian Pertama
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-200">ID Pembelian</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-200">Tanggal</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-200">Supplier</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-200">Deskripsi</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-200">Jumlah</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-200">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-200">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPurchases.map((purchase) => (
                    <tr key={purchase.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="py-3 px-4">
                        <span className="font-medium text-blue-600 dark:text-blue-400">{purchase.id}</span>
                      </td>
                      <td className="py-3 px-4 dark:text-gray-300">
                        {new Date(purchase.date).toLocaleDateString('id-ID')}
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-medium text-gray-900 dark:text-white">{purchase.supplier}</p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400">{purchase.description}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-gray-900 dark:text-white">
                          Rp {purchase.amount.toLocaleString('id-ID')}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(purchase.status)}`}>
                          {purchase.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            title="Lihat Detail"
                            onClick={() => handleViewDetail(purchase)}
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
                                <AlertDialogTitle className="dark:text-white">Yakin ingin menghapus pembelian ini?</AlertDialogTitle>
                                <AlertDialogDescription className="dark:text-gray-400">
                                  Pembelian <strong>{purchase.id}</strong> akan dihapus secara permanen.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="dark:bg-gray-800 dark:border-gray-700 dark:text-white">Batal</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(purchase)}
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

          {filteredPurchases.length === 0 && purchases.length > 0 && (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">Tidak ada pembelian yang ditemukan</p>
            </div>
          )}
        </CardContent>
      </Card>

      <AddPurchaseModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
      />

      <PurchaseDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        purchase={selectedPurchase}
      />
    </div>
  );
};

export default Pembelian;
