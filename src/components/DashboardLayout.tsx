import React, { useState, useEffect } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import BottomNav from '@/components/BottomNav';
import { AIChatDialog } from '@/components/AIChatDialog';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

const DashboardLayout = () => {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Extract active tab from URL path
  const getActiveTab = () => {
    const path = location.pathname.replace('/dashboard/', '').replace('/dashboard', '');
    return path || 'dashboard';
  };

  const activeTab = getActiveTab();

  // Navigation handler for Sidebar and BottomNav
  const handleTabChange = (tab: string) => {
    if (tab === 'dashboard') {
      navigate('/dashboard');
    } else {
      navigate(`/dashboard/${tab}`);
    }
  };

  useEffect(() => {
    const user = localStorage.getItem("current_user");
    if (!user) {
      console.log("Belum login, redirect ke /auth");
      navigate("/auth");
    } else {
      console.log("User login:", user);
      setCurrentUser(user);
    }
  }, [navigate]);

  // Delay render until currentUser is loaded
  if (!currentUser) return null;

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 w-full">
      <Sidebar activeTab={activeTab} setActiveTab={handleTabChange} />
      <main className="flex-1 overflow-auto pb-20 md:pb-0">
        <Outlet />
        {/* Floating AI Button - Only show when chat is closed */}
        {!chatOpen && (
          <button
            onClick={() => setChatOpen(true)}
            className="fixed bottom-24 md:bottom-6 right-4 z-40 group"
            aria-label="Buka AI Assistant"
          >
            <div className="relative">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group-hover:from-blue-600 group-hover:to-purple-700">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              {/* Pulse animation */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 animate-ping opacity-30" />
              {/* Tooltip */}
              <div className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg">
                💬 Tanya AI
              </div>
            </div>
          </button>
        )}
        <AIChatDialog open={chatOpen} onOpenChange={setChatOpen} />
      </main>
      <BottomNav activeTab={activeTab} setActiveTab={handleTabChange} />
    </div>
  );
};

export default DashboardLayout;
