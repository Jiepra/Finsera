
import React, { useState, useEffect } from 'react';
import { X, Save, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useApp, Product } from '@/contexts/AppContext';
import { toast } from '@/components/ui/sonner';

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

const EditProductModal: React.FC<EditProductModalProps> = ({ isOpen, onClose, product }) => {
  const { updateProduct } = useApp();
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    cost: '',
    category: '',
    stock: '',
    minStock: ''
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        price: product.price.toString(),
        cost: product.cost?.toString() || '0',
        category: product.category,
        stock: product.stock.toString(),
        minStock: product.minStock?.toString() || '5'
      });
    }
  }, [product]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !formData.name || !formData.price || !formData.category || !formData.stock) {
      toast.error('Semua field harus diisi!', {
        description: "Error",
      });
      return;
    }

    if (parseFloat(formData.price) <= 0) {
      toast.error('Harga harus lebih besar dari 0!', {
        description: "Error",
      });
      return;
    }

    if (parseInt(formData.stock) < 0) {
      toast.error('Stok tidak boleh negatif!', {
        description: "Error",
      });
      return;
    }

    updateProduct(product.id, {
      name: formData.name,
      price: parseFloat(formData.price),
      cost: parseFloat(formData.cost) || 0,
      category: formData.category,
      stock: parseInt(formData.stock),
      minStock: parseInt(formData.minStock) || 5
    });

    toast.success('Produk berhasil diperbarui!', {
      description: "Berhasil",
    });
    onClose();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-md border dark:border-gray-800 overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b dark:border-gray-800 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="flex items-center gap-3">
            <Package className="h-5 w-5" />
            <h2 className="text-xl font-bold">Edit Produk</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20 h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <Label htmlFor="edit-name" className="dark:text-gray-300">Nama Produk</Label>
            <Input
              id="edit-name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Masukkan nama produk"
              required
              className="mt-1.5 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
          </div>

          <div>
            <Label htmlFor="edit-category" className="dark:text-gray-300">Kategori</Label>
            <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
              <SelectTrigger className="mt-1.5 dark:bg-gray-800 dark:border-gray-700">
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                <SelectItem value="Makanan">Makanan</SelectItem>
                <SelectItem value="Minuman">Minuman</SelectItem>
                <SelectItem value="Snack">Snack</SelectItem>
                <SelectItem value="Lainnya">Lainnya</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-price" className="dark:text-gray-300">Harga Jual (Rp)</Label>
              <Input
                id="edit-price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                placeholder="0"
                required
                className="mt-1.5 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
            </div>
            <div>
              <Label htmlFor="edit-cost" className="dark:text-gray-300">Harga Modal (Rp)</Label>
              <Input
                id="edit-cost"
                type="number"
                min="0"
                step="0.01"
                value={formData.cost}
                onChange={(e) => handleInputChange('cost', e.target.value)}
                placeholder="0"
                className="mt-1.5 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-stock" className="dark:text-gray-300">Stok</Label>
              <Input
                id="edit-stock"
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => handleInputChange('stock', e.target.value)}
                placeholder="0"
                required
                className="mt-1.5 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
            </div>
            <div>
              <Label htmlFor="edit-minStock" className="dark:text-gray-300">Stok Minimum</Label>
              <Input
                id="edit-minStock"
                type="number"
                min="0"
                value={formData.minStock}
                onChange={(e) => handleInputChange('minStock', e.target.value)}
                placeholder="5"
                className="mt-1.5 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
            </div>
          </div>

          {/* Margin Preview */}
          {formData.price && formData.cost && (
            <div className={`p-3 rounded-lg ${parseFloat(formData.price) - parseFloat(formData.cost) >= 0 ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
              <p className={`text-sm font-medium ${parseFloat(formData.price) - parseFloat(formData.cost) >= 0 ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                Margin: Rp {(parseFloat(formData.price) - parseFloat(formData.cost)).toLocaleString('id-ID')}
                {parseFloat(formData.price) - parseFloat(formData.cost) < 0 ? ' (Rugi)' : ' (Untung)'}
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 dark:border-gray-700 dark:hover:bg-gray-800"
            >
              Batal
            </Button>
            <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
              <Save className="mr-2 h-4 w-4" />
              Simpan
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProductModal;
