import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { X, Plus, Minus, ShoppingCart, Package, Sparkles } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useToast } from '@/hooks/use-toast';
import { Product, Purchase } from '@/contexts/AppContext';

interface AddPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PurchaseItem {
  productId?: string;
  productName: string;
  quantity: number;
  cost: number;
  category: string;
}

const AddPurchaseModal: React.FC<AddPurchaseModalProps> = ({ isOpen, onClose }) => {
  const { addPurchase, addProduct, updateProductStock, products } = useApp();
  const [supplier, setSupplier] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'Tunai' | 'Transfer' | 'Kredit'>('Tunai');
  const [status, setStatus] = useState<'Lunas' | 'Belum Lunas'>('Lunas');
  const [items, setItems] = useState<PurchaseItem[]>([]);
  const { toast } = useToast();

  const addItem = () => {
    setItems([...items, { productName: '', quantity: 1, cost: 0, category: 'Umum' }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof PurchaseItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    if (field === 'productName' && typeof value === 'string') {
      const existingProduct = products.find(p => p.name.toLowerCase() === value.toLowerCase());
      if (existingProduct) {
        newItems[index].productId = existingProduct.id;
        newItems[index].cost = existingProduct.cost;
        newItems[index].category = existingProduct.category;
      } else {
        newItems[index].productId = undefined;
      }
    }
    setItems(newItems);
  };

  const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.cost), 0);

  const handleSubmit = async () => {
    if (!supplier || !description || items.length === 0) {
      toast({
        title: "Data Tidak Lengkap",
        description: "Mohon lengkapi semua data pembelian",
        variant: "destructive"
      });
      return;
    }

    if (items.some(item => !item.productName || item.quantity <= 0 || item.cost <= 0)) {
      toast({
        title: "Item Tidak Valid",
        description: "Pastikan semua item memiliki nama, jumlah, dan harga beli (pokok) yang valid",
        variant: "destructive"
      });
      return;
    }

    const purchaseItemsForContext: Purchase['items'] = [];

    for (const item of items) {
      let targetProductId = item.productId;
      const existingProduct = products.find(p => p.name.toLowerCase() === item.productName.toLowerCase());

      if (existingProduct) {
        targetProductId = existingProduct.id;
        updateProductStock(existingProduct.id, item.quantity, 'purchase');
        console.log(`Stok produk ${existingProduct.name} (${existingProduct.id}) diperbarui.`);
      } else {
        const sellingPrice = Math.round(item.cost * 1.3);
        targetProductId = await addProduct({
          name: item.productName,
          category: item.category,
          price: sellingPrice,
          cost: item.cost,
          stock: item.quantity,
          minStock: 5,
          supplier: supplier
        });
        console.log(`Produk baru ${item.productName} (${targetProductId}) ditambahkan.`);
      }

      if (targetProductId) {
        purchaseItemsForContext.push({
          productId: targetProductId,
          productName: item.productName,
          quantity: item.quantity,
          cost: item.cost
        });
      }
    }

    const purchase: Omit<Purchase, 'id'> = {
      date,
      supplier,
      amount: totalAmount,
      description,
      status,
      items: purchaseItemsForContext,
      paymentMethod
    };

    addPurchase(purchase);

    toast({
      title: "✅ Pembelian Berhasil",
      description: `Pembelian dari ${supplier} berhasil dicatat. Stok inventori diperbarui.`,
      className: "bg-green-50 border-green-200 text-green-800",
    });

    setSupplier('');
    setDescription('');
    setItems([]);
    setStatus('Lunas');
    setPaymentMethod('Tunai');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
        {/* Header with Gradient */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <ShoppingCart className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Tambah Pembelian Baru</h2>
                <p className="text-blue-100 text-sm">Catat pembelian dari supplier</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-xl"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-180px)] p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="supplier" className="text-gray-700 dark:text-gray-300 font-medium">
                Supplier
              </Label>
              <Input
                id="supplier"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                placeholder="Nama supplier"
                className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date" className="text-gray-700 dark:text-gray-300 font-medium">
                Tanggal
              </Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-gray-100"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentMethod" className="text-gray-700 dark:text-gray-300 font-medium">
                Metode Pembayaran
              </Label>
              <Select value={paymentMethod} onValueChange={(value: 'Tunai' | 'Transfer' | 'Kredit') => setPaymentMethod(value)}>
                <SelectTrigger className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600">
                  <SelectItem value="Tunai" className="text-gray-900 dark:text-gray-100 focus:bg-blue-50 dark:focus:bg-blue-900/20">Tunai</SelectItem>
                  <SelectItem value="Transfer" className="text-gray-900 dark:text-gray-100 focus:bg-blue-50 dark:focus:bg-blue-900/20">Transfer Bank</SelectItem>
                  <SelectItem value="Kredit" className="text-gray-900 dark:text-gray-100 focus:bg-blue-50 dark:focus:bg-blue-900/20">Kredit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status" className="text-gray-700 dark:text-gray-300 font-medium">
                Status Pembayaran
              </Label>
              <Select value={status} onValueChange={(value: 'Lunas' | 'Belum Lunas') => setStatus(value)}>
                <SelectTrigger className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600">
                  <SelectItem value="Lunas" className="text-gray-900 dark:text-gray-100 focus:bg-green-50 dark:focus:bg-green-900/20">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      Lunas
                    </span>
                  </SelectItem>
                  <SelectItem value="Belum Lunas" className="text-gray-900 dark:text-gray-100 focus:bg-red-50 dark:focus:bg-red-900/20">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500"></span>
                      Belum Lunas
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-gray-700 dark:text-gray-300 font-medium">
              Deskripsi
            </Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Deskripsi pembelian"
              className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
              required
            />
          </div>

          {/* Items Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className="text-gray-700 dark:text-gray-300 font-medium flex items-center gap-2">
                <Package className="h-4 w-4" />
                Item Pembelian
              </Label>
              <Button
                type="button"
                onClick={addItem}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="h-4 w-4 mr-1" />
                Tambah Item
              </Button>
            </div>

            {items.length === 0 && (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                <Package className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-500 mb-3" />
                <p className="text-gray-500 dark:text-gray-400">Belum ada item</p>
                <p className="text-sm text-gray-400 dark:text-gray-500">Klik "Tambah Item" untuk menambahkan produk</p>
              </div>
            )}

            {items.map((item, index) => (
              <div
                key={index}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl space-y-4 bg-gray-50 dark:bg-gray-800/50 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </span>
                    Item {index + 1}
                  </h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeItem(index)}
                    className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 dark:border-red-800"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="space-y-2">
                    <Label className="text-gray-600 dark:text-gray-400 text-sm">Nama Produk</Label>
                    <Input
                      list="productNames"
                      value={item.productName}
                      onChange={(e) => updateItem(index, 'productName', e.target.value)}
                      placeholder="Nama produk"
                      className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-600 dark:text-gray-400 text-sm">Kategori</Label>
                    <Select
                      value={item.category}
                      onValueChange={(value) => updateItem(index, 'category', value)}
                    >
                      <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100">
                        <SelectValue placeholder="Pilih kategori" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600">
                        <SelectItem value="Umum" className="text-gray-900 dark:text-gray-100">Umum</SelectItem>
                        <SelectItem value="Makanan" className="text-gray-900 dark:text-gray-100">Makanan</SelectItem>
                        <SelectItem value="Minuman" className="text-gray-900 dark:text-gray-100">Minuman</SelectItem>
                        <SelectItem value="Elektronik" className="text-gray-900 dark:text-gray-100">Elektronik</SelectItem>
                        <SelectItem value="Pakaian" className="text-gray-900 dark:text-gray-100">Pakaian</SelectItem>
                        <SelectItem value="Kesehatan" className="text-gray-900 dark:text-gray-100">Kesehatan</SelectItem>
                        <SelectItem value="Rumah Tangga" className="text-gray-900 dark:text-gray-100">Rumah Tangga</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-600 dark:text-gray-400 text-sm">Jumlah</Label>
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                      min="1"
                      className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-600 dark:text-gray-400 text-sm">Harga Beli</Label>
                    <Input
                      type="number"
                      value={item.cost}
                      onChange={(e) => updateItem(index, 'cost', parseFloat(e.target.value) || 0)}
                      min="0"
                      className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-600 dark:text-gray-400 text-sm">Subtotal</Label>
                    <div className="p-2.5 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 rounded-lg border border-green-200 dark:border-green-700 font-semibold text-green-700 dark:text-green-400">
                      Rp {(item.quantity * item.cost).toLocaleString('id-ID')}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Info Box */}
          {items.length > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 p-4 rounded-xl">
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-1">ℹ️ Informasi:</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-400 mb-1">
                    • Jika produk sudah ada, stoknya akan otomatis ditambahkan.
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-400">
                    • Jika produk belum ada, produk baru akan dibuat di inventori.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Total Box */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border border-green-200 dark:border-green-700 p-5 rounded-xl">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">Total Pembelian:</span>
              <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                Rp {totalAmount.toLocaleString('id-ID')}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4 bg-gray-50 dark:bg-gray-800/50 flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Batal
          </Button>
          <Button
            onClick={handleSubmit}
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Simpan Pembelian
          </Button>
        </div>

        {/* Datalist for existing product names */}
        <datalist id="productNames">
          {products.map((product) => (
            <option key={product.id} value={product.name} />
          ))}
        </datalist>
      </div>
    </div>
  );
};

export default AddPurchaseModal;
