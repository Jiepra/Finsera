import React, { useState, useRef } from 'react';
import { X, Upload, FileSpreadsheet, AlertCircle, CheckCircle2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useApp } from '@/contexts/AppContext';
import { toast } from '@/components/ui/sonner';
import * as XLSX from 'xlsx';

interface ImportProductModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface ImportedProduct {
    name: string;
    category: string;
    price: number;
    cost: number;
    stock: number;
    minStock: number;
    valid: boolean;
    error?: string;
}

const ImportProductModal: React.FC<ImportProductModalProps> = ({ isOpen, onClose }) => {
    const { addProduct } = useApp();
    const [importedProducts, setImportedProducts] = useState<ImportedProduct[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [fileName, setFileName] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const processFile = async (file: File) => {
        // Validate file type
        const validTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel',
            'text/csv',
            '.xlsx',
            '.xls',
            '.csv'
        ];

        const fileExtension = file.name.split('.').pop()?.toLowerCase();
        if (!validTypes.includes(file.type) && !['xlsx', 'xls', 'csv'].includes(fileExtension || '')) {
            toast.error('Format file tidak didukung', {
                description: 'Gunakan file .xlsx, .xls, atau .csv',
            });
            return;
        }

        setFileName(file.name);
        setIsProcessing(true);

        try {
            const data = await readFileAsArrayBuffer(file);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

            // Skip header row and process data
            const products: ImportedProduct[] = [];
            for (let i = 1; i < jsonData.length; i++) {
                const row = jsonData[i];
                if (!row || row.length === 0 || !row[0]) continue;

                const product: ImportedProduct = {
                    name: String(row[0] || '').trim(),
                    category: String(row[1] || 'Umum').trim(),
                    price: parseNumber(row[2]),
                    cost: parseNumber(row[3]),
                    stock: parseNumber(row[4]),
                    minStock: parseNumber(row[5]) || 5,
                    valid: true,
                    error: undefined
                };

                // Validate
                if (!product.name) {
                    product.valid = false;
                    product.error = 'Nama produk kosong';
                } else if (product.price <= 0) {
                    product.valid = false;
                    product.error = 'Harga harus lebih dari 0';
                } else if (product.cost < 0) {
                    product.valid = false;
                    product.error = 'Harga modal tidak valid';
                } else if (product.stock < 0) {
                    product.valid = false;
                    product.error = 'Stok tidak valid';
                }

                products.push(product);
            }

            setImportedProducts(products);

            if (products.length === 0) {
                toast.error('File kosong atau format tidak sesuai', {
                    description: 'Pastikan file mengikuti format template',
                });
            } else {
                toast.success(`${products.length} produk ditemukan dalam file`);
            }
        } catch (error) {
            console.error('Error reading file:', error);
            toast.error('Gagal membaca file', {
                description: 'Pastikan file dalam format Excel (.xlsx) atau CSV (.csv) yang benar',
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        await processFile(file);
    };

    // Drag and Drop handlers
    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            await processFile(files[0]);
        }
    };

    const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as ArrayBuffer);
            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
        });
    };

    const parseNumber = (value: any): number => {
        if (typeof value === 'number') return value;
        if (typeof value === 'string') {
            // Remove currency symbols and thousand separators
            const cleaned = value.replace(/[Rp.,\s]/g, '').trim();
            return parseInt(cleaned) || 0;
        }
        return 0;
    };

    const handleImport = () => {
        const validProducts = importedProducts.filter(p => p.valid);
        if (validProducts.length === 0) {
            toast.error('Tidak ada produk valid untuk diimpor');
            return;
        }

        let successCount = 0;
        validProducts.forEach(product => {
            try {
                addProduct({
                    name: product.name,
                    category: product.category,
                    price: product.price,
                    cost: product.cost,
                    stock: product.stock,
                    minStock: product.minStock
                });
                successCount++;
            } catch (error) {
                console.error('Error adding product:', error);
            }
        });

        toast.success(`${successCount} produk berhasil diimpor!`, {
            description: 'Import Berhasil',
        });

        handleClose();
    };

    const handleClose = () => {
        setImportedProducts([]);
        setFileName('');
        setIsDragging(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        onClose();
    };

    const downloadTemplate = () => {
        const templateData = [
            ['Nama Produk', 'Kategori', 'Harga Jual', 'Harga Modal', 'Stok', 'Stok Minimum'],
            ['Contoh Produk 1', 'Makanan', 15000, 10000, 50, 10],
            ['Contoh Produk 2', 'Minuman', 8000, 5000, 100, 20],
        ];

        const ws = XLSX.utils.aoa_to_sheet(templateData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Template');
        XLSX.writeFile(wb, 'template_import_produk.xlsx');

        toast.success('Template berhasil diunduh!');
    };

    const validCount = importedProducts.filter(p => p.valid).length;
    const invalidCount = importedProducts.filter(p => !p.valid).length;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden border dark:border-gray-800">
                {/* Header */}
                <div className="px-6 py-4 border-b dark:border-gray-800 flex justify-between items-center bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                    <div className="flex items-center gap-3">
                        <FileSpreadsheet className="h-6 w-6" />
                        <h2 className="text-xl font-bold">Import Produk</h2>
                    </div>
                    <Button variant="ghost" size="icon" onClick={handleClose} className="text-white hover:bg-white/20">
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                <div className="p-6 overflow-y-auto max-h-[calc(90vh-160px)]">
                    {/* Upload Section */}
                    <div className="mb-6">
                        <div className="flex items-center gap-3 mb-4">
                            <Button variant="outline" onClick={downloadTemplate} className="dark:border-gray-700">
                                <Download className="h-4 w-4 mr-2" />
                                Download Template
                            </Button>
                        </div>

                        <Card className="dark:bg-gray-800 dark:border-gray-700">
                            <CardContent className="p-6">
                                <div
                                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 ${isDragging
                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-[1.02]'
                                            : 'border-gray-300 dark:border-gray-600 hover:border-blue-500'
                                        }`}
                                    onClick={() => fileInputRef.current?.click()}
                                    onDragEnter={handleDragEnter}
                                    onDragLeave={handleDragLeave}
                                    onDragOver={handleDragOver}
                                    onDrop={handleDrop}
                                >
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".xlsx,.xls,.csv"
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                    <Upload className={`h-12 w-12 mx-auto mb-4 transition-colors ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} />
                                    <p className={`text-lg font-medium mb-2 transition-colors ${isDragging ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>
                                        {isProcessing ? 'Memproses file...' : fileName || 'Klik atau drag file di sini'}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Format yang didukung: .xlsx, .xls, .csv
                                    </p>
                                    {isDragging && (
                                        <p className="text-sm text-blue-600 dark:text-blue-400 mt-2 font-medium">
                                            Lepaskan file untuk mengupload
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Preview Section */}
                    {importedProducts.length > 0 && (
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold dark:text-white">Preview Data</h3>
                                <div className="flex gap-4 text-sm">
                                    <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                                        <CheckCircle2 className="h-4 w-4" />
                                        {validCount} Valid
                                    </span>
                                    {invalidCount > 0 && (
                                        <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
                                            <AlertCircle className="h-4 w-4" />
                                            {invalidCount} Error
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b dark:border-gray-700">
                                            <th className="text-left py-2 px-3 font-medium text-gray-600 dark:text-gray-400">Status</th>
                                            <th className="text-left py-2 px-3 font-medium text-gray-600 dark:text-gray-400">Nama</th>
                                            <th className="text-left py-2 px-3 font-medium text-gray-600 dark:text-gray-400">Kategori</th>
                                            <th className="text-right py-2 px-3 font-medium text-gray-600 dark:text-gray-400">Harga</th>
                                            <th className="text-right py-2 px-3 font-medium text-gray-600 dark:text-gray-400">Modal</th>
                                            <th className="text-right py-2 px-3 font-medium text-gray-600 dark:text-gray-400">Stok</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {importedProducts.slice(0, 10).map((product, index) => (
                                            <tr key={index} className={`border-b dark:border-gray-700 ${!product.valid ? 'bg-red-50 dark:bg-red-900/20' : ''}`}>
                                                <td className="py-2 px-3">
                                                    {product.valid ? (
                                                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                                                    ) : (
                                                        <div className="flex items-center gap-1">
                                                            <AlertCircle className="h-4 w-4 text-red-600" />
                                                            <span className="text-xs text-red-600">{product.error}</span>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="py-2 px-3 dark:text-white">{product.name}</td>
                                                <td className="py-2 px-3 dark:text-gray-300">{product.category}</td>
                                                <td className="py-2 px-3 text-right dark:text-white">Rp {product.price.toLocaleString('id-ID')}</td>
                                                <td className="py-2 px-3 text-right dark:text-gray-300">Rp {product.cost.toLocaleString('id-ID')}</td>
                                                <td className="py-2 px-3 text-right dark:text-white">{product.stock}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {importedProducts.length > 10 && (
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">
                                        ...dan {importedProducts.length - 10} produk lainnya
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex justify-end gap-3">
                    <Button variant="outline" onClick={handleClose} className="dark:border-gray-700">
                        Batal
                    </Button>
                    <Button
                        onClick={handleImport}
                        disabled={validCount === 0 || isProcessing}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        Import {validCount} Produk
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ImportProductModal;
