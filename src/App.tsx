
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import PrivateRoute from "@/components/PrivateRoute";
import { AppProvider } from './contexts/AppContext';
import { ThemeProvider } from "@/components/theme-provider";

// Dashboard components
import DashboardLayout from "@/components/DashboardLayout";
import Dashboard from "@/components/Dashboard";
import Produk from "@/components/Produk";
import Kasir from "@/components/Kasir";
import Transaksi from "@/components/Transaksi";
import Pembelian from "@/components/Pembelian";
import Beban from "@/components/Beban";
import ReportPOS from "@/components/ReportPOS";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider
    attribute="class"
    defaultTheme="system"
    enableSystem
    disableTransitionOnChange
  >
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppProvider>
            <Routes>
              <Route path="/" element={<Navigate to="/auth" />} />
              <Route path="/auth" element={<Auth />} />

              {/* Dashboard with nested routes */}
              <Route path="/dashboard" element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
                <Route index element={<Dashboard />} />
                <Route path="produk" element={<Produk />} />
                <Route path="kasir" element={<Kasir />} />
                <Route path="transaksi" element={<Transaksi />} />
                <Route path="pembelian" element={<Pembelian />} />
                <Route path="beban" element={<Beban />} />
                <Route path="laporan" element={<ReportPOS />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
