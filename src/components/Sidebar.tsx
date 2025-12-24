
import React from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Receipt,
  ShoppingBag,
  FileText,
  ArrowDownCircle
} from 'lucide-react';
import { ThemeToggle } from './theme-toggle';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'produk', label: 'Produk', icon: Package },
    { id: 'kasir', label: 'Kasir', icon: ShoppingCart },
    { id: 'transaksi', label: 'Transaksi', icon: Receipt },
    { id: 'pembelian', label: 'Pembelian', icon: ShoppingBag },
    { id: 'beban', label: 'Beban & Pengeluaran', icon: ArrowDownCircle },
    { id: 'laporan', label: 'Laporan', icon: FileText },
  ];

  return (
    <>
      <div className="w-64 bg-white dark:bg-gray-900 shadow-lg h-full flex flex-col md:flex hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center">
          <img src="/Finsera.svg" alt="Finsera Logo" className="h-8 w-auto mr-2" />
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Finsera</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Version 1.1</p>
          </div>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800 ${activeTab === item.id
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-r-2 border-blue-700 dark:border-blue-400 font-medium'
                        : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                      }`}
                  >
                    <Icon className={`mr-3 h-5 w-5 ${activeTab === item.id ? 'text-blue-700 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'
                      }`} />
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-600 dark:text-gray-400">Tema</span>
            <ThemeToggle />
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-500">© 2025 Finsera</p>
            <p className="text-xs text-gray-400 dark:text-gray-600">Version 1.1</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
