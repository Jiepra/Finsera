import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/components/ui/sonner';
import { Eye, EyeOff, User, Lock, Sparkles, ArrowRight, CheckCircle2, UserPlus, LogIn } from 'lucide-react';

const Auth = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    agreeTerms: false
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const trimmedUsername = formData.name.trim().toLowerCase();
    const trimmedPassword = formData.password.trim();

    if (!trimmedUsername) {
      toast.error("Username tidak boleh kosong", {
        description: "Silakan masukkan username Anda",
      });
      setLoading(false);
      return;
    }

    if (trimmedPassword !== "123" && trimmedPassword !== "admin") {
      toast.error("Password salah", {
        description: "Gunakan password: '123' atau 'admin'",
      });
      setLoading(false);
      return;
    }

    localStorage.setItem("current_user", trimmedUsername);

    const keys = ["products", "transactions", "purchases", "journalEntries", "expenses"];
    keys.forEach((key) => {
      const userKey = `${trimmedUsername}_${key}`;
      if (!localStorage.getItem(userKey)) {
        localStorage.setItem(userKey, JSON.stringify([]));
      }
    });

    toast.success(`Selamat datang, ${trimmedUsername}!`, {
      description: isLogin ? "Login berhasil" : "Pendaftaran berhasil",
    });

    navigate('/dashboard');
    setLoading(false);
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({ name: '', email: '', password: '', agreeTerms: false });
  };

  const features = [
    "Kelola produk & stok dengan mudah",
    "Transaksi kasir cepat & akurat",
    "Laporan keuangan real-time",
    "AI Assistant untuk bantu bisnis"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl">
        {/* Main Container */}
        <div className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden min-h-[600px]">
          {/* Mobile Toggle */}
          <div className="lg:hidden absolute top-4 right-4 z-30">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMode}
              className="text-gray-600 dark:text-gray-300"
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </Button>
          </div>

          <div className="grid lg:grid-cols-2 min-h-[600px]">
            {/* Sign In Form - Left Side */}
            <div
              className={`p-8 lg:p-12 flex flex-col justify-center transition-all duration-700 ease-in-out ${isLogin
                  ? 'opacity-100 translate-x-0 pointer-events-auto'
                  : 'opacity-0 -translate-x-full absolute inset-0 pointer-events-none lg:opacity-0 lg:translate-x-0 lg:relative'
                }`}
            >
              <div className="max-w-sm mx-auto w-full">
                {/* Logo Mobile */}
                <div className="lg:hidden text-center mb-6">
                  <div className="inline-flex items-center gap-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">Finsera</span>
                  </div>
                </div>

                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <LogIn className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Selamat Datang!
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400">
                    Masuk untuk melanjutkan ke dashboard
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Username
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <User className="w-5 h-5" />
                      </div>
                      <Input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Masukkan username"
                        className="h-12 pl-12 pr-4 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 rounded-xl"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <Lock className="w-5 h-5" />
                      </div>
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        placeholder="Password"
                        className="h-12 pl-12 pr-12 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 rounded-xl"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      💡 Password: <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">123</code> atau <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">admin</code>
                    </p>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-lg"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Memproses...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span>Masuk</span>
                        <ArrowRight className="w-5 h-5" />
                      </div>
                    )}
                  </Button>
                </form>

                <p className="text-center mt-6 text-gray-500 dark:text-gray-400 lg:hidden">
                  Belum punya akun?{' '}
                  <button onClick={toggleMode} className="text-blue-600 font-semibold">
                    Daftar
                  </button>
                </p>
              </div>
            </div>

            {/* Sign Up Form - Right Side (hidden on mobile when login) */}
            <div
              className={`p-8 lg:p-12 flex flex-col justify-center transition-all duration-700 ease-in-out ${!isLogin
                  ? 'opacity-100 translate-x-0 pointer-events-auto'
                  : 'opacity-0 translate-x-full absolute inset-0 pointer-events-none lg:opacity-0 lg:translate-x-0 lg:relative'
                }`}
            >
              <div className="max-w-sm mx-auto w-full">
                {/* Logo Mobile */}
                <div className="lg:hidden text-center mb-6">
                  <div className="inline-flex items-center gap-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">Finsera</span>
                  </div>
                </div>

                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <UserPlus className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Buat Akun Baru
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400">
                    Daftar gratis untuk mulai menggunakan Finsera
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Username
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <User className="w-5 h-5" />
                      </div>
                      <Input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Pilih username Anda"
                        className="h-12 pl-12 pr-4 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 rounded-xl"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <Lock className="w-5 h-5" />
                      </div>
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        placeholder="Buat password"
                        className="h-12 pl-12 pr-12 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 rounded-xl"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      💡 Untuk demo, gunakan: <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">123</code>
                    </p>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="terms"
                      checked={formData.agreeTerms}
                      onCheckedChange={(checked) => handleInputChange('agreeTerms', checked as boolean)}
                      className="mt-0.5"
                    />
                    <label htmlFor="terms" className="text-sm text-gray-600 dark:text-gray-400">
                      Saya setuju dengan{' '}
                      <span className="text-purple-600 hover:underline cursor-pointer">Syarat & Ketentuan</span>
                    </label>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl shadow-lg"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Memproses...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span>Daftar Sekarang</span>
                        <ArrowRight className="w-5 h-5" />
                      </div>
                    )}
                  </Button>
                </form>

                <p className="text-center mt-6 text-gray-500 dark:text-gray-400 lg:hidden">
                  Sudah punya akun?{' '}
                  <button onClick={toggleMode} className="text-purple-600 font-semibold">
                    Masuk
                  </button>
                </p>
              </div>
            </div>
          </div>

          {/* Sliding Overlay Panel - Desktop Only */}
          <div
            className={`hidden lg:flex absolute top-0 bottom-0 w-1/2 transition-all duration-700 ease-in-out z-20 ${isLogin ? 'right-0' : 'right-1/2'
              }`}
          >
            <div className={`w-full h-full bg-gradient-to-br ${isLogin
                ? 'from-blue-600 via-blue-700 to-purple-700'
                : 'from-purple-600 via-pink-600 to-red-500'
              } flex flex-col justify-center items-center text-white p-12 relative overflow-hidden transition-all duration-700`}>
              {/* Animated background */}
              <div className="absolute inset-0">
                <div className="absolute top-10 left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-10 right-10 w-60 h-60 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000" />
              </div>

              {/* Dot pattern */}
              <div className="absolute inset-0 opacity-10" style={{
                backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                backgroundSize: '24px 24px'
              }} />

              {/* Content */}
              <div className="relative z-10 text-center max-w-sm">
                {/* Logo */}
                <div className="flex items-center justify-center gap-3 mb-8">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                    <Sparkles className="w-8 h-8" />
                  </div>
                  <span className="text-3xl font-bold">Finsera</span>
                </div>

                {isLogin ? (
                  <>
                    <h2 className="text-3xl font-bold mb-4">Belum Punya Akun?</h2>
                    <p className="text-white/80 mb-8">
                      Daftar sekarang dan nikmati kemudahan mengelola bisnis Anda dengan Finsera!
                    </p>
                    <div className="space-y-3 text-left mb-8">
                      {features.map((feature, i) => (
                        <div key={i} className="flex items-center gap-2 text-white/90">
                          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                    <Button
                      onClick={toggleMode}
                      variant="outline"
                      className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 h-12 rounded-xl font-semibold transition-all"
                    >
                      Daftar Gratis
                    </Button>
                  </>
                ) : (
                  <>
                    <h2 className="text-3xl font-bold mb-4">Sudah Punya Akun?</h2>
                    <p className="text-white/80 mb-8">
                      Masuk ke akun Anda untuk melanjutkan mengelola bisnis dengan Finsera!
                    </p>
                    <div className="w-24 h-24 mx-auto mb-8 bg-white/20 rounded-3xl flex items-center justify-center">
                      <LogIn className="w-12 h-12" />
                    </div>
                    <Button
                      onClick={toggleMode}
                      variant="outline"
                      className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-purple-600 px-8 h-12 rounded-xl font-semibold transition-all"
                    >
                      Masuk Sekarang
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
