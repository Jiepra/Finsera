import React from 'react';
import { X, Package, Calendar, User, CreditCard, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Purchase } from '@/contexts/AppContext';
import { formatRupiah } from '@/lib/utils';

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
    if (!isOpen || !purchase) return null;

    const getStatusColor = (status: string) => {
        return status === 'Lunas'
            ? 'text-green-700 bg-green-100 border-green-200'
            : 'text-red-700 bg-red-100 border-red-200';
    };

    const totalItems = purchase.items.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-600 to-blue-700">
                    <div className="flex items-center justify-between">
                        <div className="text-white">
                            <h2 className="text-xl font-bold">Detail Pembelian</h2>
                            <p className="text-blue-100 text-sm mt-1">#{purchase.id}</p>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                            className="text-white hover:bg-white/20"
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Info Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs mb-1">
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
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs mb-1">
                                <User className="h-3.5 w-3.5" />
                                Supplier
                            </div>
                            <p className="font-semibold text-gray-900 dark:text-gray-100">{purchase.supplier}</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs mb-1">
                                <CreditCard className="h-3.5 w-3.5" />
                                Status
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(purchase.status)}`}>
                                {purchase.status}
                            </span>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs mb-1">
                                <Package className="h-3.5 w-3.5" />
                                Total Item
                            </div>
                            <p className="font-semibold text-gray-900 dark:text-gray-100">{totalItems} pcs</p>
                        </div>
                    </div>

                    {/* Description */}
                    {purchase.description && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
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
                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Produk</th>
                                        <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Qty</th>
                                        <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Harga</th>
                                        <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {purchase.items.map((item, index) => (
                                        <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                            <td className="py-3 px-4">
                                                <p className="font-medium text-gray-900 dark:text-gray-100">{item.productName}</p>
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded-full text-sm font-medium">
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
                <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4 bg-gray-50 dark:bg-gray-800">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Total Pembayaran</p>
                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                {formatRupiah(purchase.amount)}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={onClose}>
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
