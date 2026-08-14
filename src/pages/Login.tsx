/**
 * Login page component - User authentication interface
 * Đã tinh chỉnh: split layout với SVG SecurityShield, design token, gradient hero.
 */

import React, { useState } from 'react';
import { ArrowLeft, Eye, EyeOff, Phone, Lock, Shield, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router';
import { useAuthStore } from '../stores/authStore';
import { LogoVGreen } from '../components/ui/illustrations';
import { SecurityShield } from '../assets/illustrations';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((s) => s.login);
  const [formData, setFormData] = useState({
    phone: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const result = await login(formData.phone, formData.password);
    setIsLoading(false);

    if (!result.success) {
      setError(result.error || 'Đăng nhập thất bại');
      return;
    }

    const user = useAuthStore.getState().user;
    const from = (location.state as { from?: string })?.from;

    if (user?.role === 'admin') {
      navigate('/admin');
    } else {
      navigate(from || '/my-account');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="border-b border-border bg-card">
        <div className="flex items-center justify-between p-4 max-w-6xl mx-auto">
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-muted rounded-full transition-colors"
            aria-label="Quay lại"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-base md:text-lg font-semibold text-foreground tracking-wide">ĐĂNG NHẬP</h1>
          <div className="w-9 h-9" />
        </div>
      </div>

      {/* Body */}
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Left: Hero + Illustration */}
        <div className="hidden md:flex flex-col">
          <div className="bg-gradient-hero rounded-3xl p-10 text-white shadow-elevated relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-brand-accent-400/30 blur-3xl pointer-events-none" />
            <div className="relative">
              <LogoVGreen variant="full" theme="dark" />
              <h2 className="text-3xl font-extrabold mt-6 mb-3 leading-tight">
                Vì tương lai xanh
              </h2>
              <p className="text-white/90 mb-8 leading-relaxed">
                Đầu tư thông minh — Sinh lợi bền vững. Cùng V-GREEN phát triển hệ thống trạm sạc xe điện VinFast toàn cầu.
              </p>
              <SecurityShield className="mx-auto drop-shadow-2xl" size={280} />
              <div className="grid grid-cols-3 gap-3 mt-6 text-center">
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20">
                  <div className="text-xl font-bold">SSL</div>
                  <div className="text-[10px] text-white/80 uppercase">Mã hóa 256-bit</div>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20">
                  <div className="text-xl font-bold">24/7</div>
                  <div className="text-[10px] text-white/80 uppercase">Hỗ trợ</div>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20">
                  <div className="text-xl font-bold">100%</div>
                  <div className="text-[10px] text-white/80 uppercase">Bảo hiểm</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Form */}
        <div>
          {/* Mobile mini hero */}
          <div className="md:hidden mb-6 bg-gradient-hero rounded-2xl p-5 text-white text-center">
            <LogoVGreen variant="full" theme="dark" />
            <h2 className="text-lg font-bold mt-3">Vì tương lai xanh</h2>
          </div>

          <div className="bg-card rounded-2xl shadow-card border border-border p-6 md:p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-glow">
                <User className="w-7 h-7 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-1">Chào mừng trở lại!</h3>
              <p className="text-sm text-muted-foreground">Đăng nhập để tiếp tục đầu tư</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-foreground">Số điện thoại</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Nhập số điện thoại"
                    className="w-full pl-10 pr-4 py-3 bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-foreground">Mật khẩu</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <Lock className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Nhập mật khẩu"
                    className="w-full pl-10 pr-12 py-3 bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-danger-subtle text-danger-strong text-sm rounded-xl border border-danger/20">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-primary text-primary-foreground py-3 rounded-xl font-semibold hover:shadow-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Đang đăng nhập...</span>
                  </>
                ) : (
                  'Đăng nhập'
                )}
              </button>
            </form>

            <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
              <button
                onClick={() => navigate('/register')}
                className="text-sm text-primary hover:text-primary/80 font-medium"
              >
                Đăng ký tài khoản
              </button>
              <button
                onClick={() => navigate('/forgot-password')}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Quên mật khẩu?
              </button>
            </div>
          </div>

          {/* Security Notice */}
          <div className="mt-6 bg-success-subtle rounded-xl p-4 border border-success/20">
            <div className="flex items-start space-x-3">
              <div className="w-9 h-9 bg-success/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-success-strong" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-success-strong mb-1">Bảo mật tuyệt đối</h4>
                <p className="text-sm text-success-strong/80 leading-relaxed">
                  Thông tin của bạn được mã hóa SSL 256-bit và tuân thủ các tiêu chuẩn bảo mật quốc tế.
                  V-GREEN cam kết bảo vệ tuyệt đối quyền riêng tư và an toàn tài khoản của bạn.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;