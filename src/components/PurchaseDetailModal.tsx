import React, { useState, useEffect } from 'react';
import { X, Package, Calendar, User, CreditCard, FileText, Edit3, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Purchase, useApp } from '@/contexts/AppContext';
import { formatRupiah } from '@/lib/utils';
import { toast } from '@/components/ui/sonner';

interface PurchaseDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    purchase: Purchase | null;
}

const PurchaseDetailModal: React.FC<PurchaseDetailModalProps> = ({
    isOpen,
    onClose,
    purchase
}) => {
    const { updatePurchase } = useApp();
    const [isEditingStatus, setIsEditingStatus] = useState(false);
    const [editedStatus, setEditedStatus] = useState<'Lunas' | 'Belum Lunas'>('Lunas');

    useEffect(() => {
        if (purchase) {
            setEditedStatus(purchase.status);
            setIsEditingStatus(false);
        }
    }, [purchase]);

    if (!isOpen || !purchase) return null;

    const getStatusColor = (status: string) => {
        return status === 'Lunas'
            ? 'text-green-700 bg-green-100 border-green-200 dark:text-green-400 dark:bg-green-900/30 dark:border-green-700'
            : 'text-red-700 bg-red-100 border-red-200 dark:text-red-400 dark:bg-red-900/30 dark:border-red-700';
    };

    const totalItems = purchase.items.reduce((sum, item) => sum + item.quantity, 0);

    const handleStatusSave = () => {
        if (editedStatus !== purchase.status) {
            updatePurchase(purchase.id, { status: editedStatus });
            toast.success(`Status pembayaran berhasil diubah menjadi "${editedStatus}"`, {
                description: `Pembelian #${purchase.id}`,
            });
        }
        setIsEditingStatus(false);
    };

    const handleStatusCancel = () => {
        setEditedStatus(purchase.status);
        setIsEditingStatus(false);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-gray-200 dark:border-gray-700">
                {/* Header */}
                <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-xl">
                                <Package className="h-6 w-6 text-white" />
                            </div>
                            <div className="text-white">
                                <h2 className="text-xl font-bold">Detail Pembelian</h2>
                                <p className="text-blue-100 text-sm mt-0.5">#{purchase.id}</p>
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
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Info Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs mb-1.5">
                                <Calendar className="h-3.5 w-3.5" />
                                Tanggal
                            </div>
                            <p className="font-semibold text-gray-900 dark:text-gray-100">
                                {new Date(purchase.date).toLocaleDateString('id-ID', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric'
                                })}
                            </p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs mb-1.5">
                                <User className="h-3.5 w-3.5" />
                                Supplier
                            </div>
                            <p className="font-semibold text-gray-900 dark:text-gray-100">{purchase.supplier}</p>
                        </div>

                        {/* Editable Status Card */}
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                            <div className="flex items-center justify-between mb-1.5">
                                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs">
                                    <CreditCard className="h-3.5 w-3.5" />
                                    Status
                                </div>
                                {!isEditingStatus && (
                                    <button
                                        onClick={() => setIsEditingStatus(true)}
                                        className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                                        title="Edit status"
                                    >
                                        <Edit3 className="h-3.5 w-3.5" />
                                    </button>
                                )}
                            </div>

                            {isEditingStatus ? (
                                <div className="space-y-2">
                                    <Select
                                        value={editedStatus}
                                        onValueChange={(value: 'Lunas' | 'Belum Lunas') => setEditedStatus(value)}
                                    >
                                        <SelectTrigger className="h-8 text-sm bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600">
                                            <SelectItem value="Lunas" className="text-gray-900 dark:text-gray-100">
                                                <span className="flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                                    Lunas
                                                </span>
                                            </SelectItem>
                                            <SelectItem value="Belum Lunas" className="text-gray-900 dark:text-gray-100">
                                                <span className="flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                                    Belum Lunas
                                                </span>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <div className="flex gap-1">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={handleStatusCancel}
                                            className="h-7 px-2 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                                        >
                                            Batal
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={handleStatusSave}
                                            className="h-7 px-2 text-xs bg-blue-600 hover:bg-blue-700 text-white"
                                        >
                                            <Check className="h-3 w-3 mr-1" />
                                            Simpan
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(purchase.status)}`}>
                                    {purchase.status}
                                </span>
                            )}
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs mb-1.5">
                                <Package className="h-3.5 w-3.5" />
                                Total Item
                            </div>
                            <p className="font-semibold text-gray-900 dark:text-gray-100">{totalItems} pcs</p>
                        </div>
                    </div>

                    {/* Status Change Notice */}
                    {purchase.status === 'Belum Lunas' && !isEditingStatus && (
                        <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl">
                            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-medium text-amber-800 dark:text-amber-300">Pembayaran Belum Lunas</p>
                                <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                                    Klik ikon edit pada status untuk mengubah menjadi Lunas setelah pembayaran dilakukan.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Description */}
                    {purchase.description && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-700">
                            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 text-sm font-medium mb-2">
                                <FileText className="h-4 w-4" />
                                Keterangan
                            </div>
                            <p className="text-gray-700 dark:text-gray-300">{purchase.description}</p>
                        </div>
                    )}

                    {/* Items Table */}
                    <div>
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                            <Package className="h-4 w-4" />
                            Daftar Barang ({purchase.items.length} produk)
                        </h3>
                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-700/50">
                                    <tr>
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Produk</th>
                                        <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Qty</th>
                                        <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Harga</th>
                                        <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {purchase.items.map((item, index) => (
                                        <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                            <td className="py-3 px-4">
                                                <p className="font-medium text-gray-900 dark:text-gray-100">{item.productName}</p>
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400 px-2.5 py-1 rounded-full text-sm font-medium">
                                                    {item.quantity}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-right text-gray-600 dark:text-gray-400">
                                                {formatRupiah(item.cost)}
                                            </td>
                                            <td className="py-3 px-4 text-right font-semibold text-gray-900 dark:text-gray-100">
                                                {formatRupiah(item.cost * item.quantity)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Footer Total */}
                <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-800/50">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Total Pembayaran</p>
                            <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                {formatRupiah(purchase.amount)}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={onClose}
                                className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                Tutup
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PurchaseDetailModal;
