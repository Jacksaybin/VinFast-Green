/**
 * Register page component - User registration interface
 * Single-step registration: form -> success. No OTP screen.
 */

import React, { useState } from 'react';
import { ArrowLeft, User, Phone, Lock, Shield, CheckCircle, AlertCircle, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useAuthStore } from '../stores/authStore';
import { LogoVGreen } from '../components/ui/illustrations';
import { WelcomeOnboarding } from '../assets/illustrations';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const register = useAuthStore((s) => s.register);
  const [step, setStep] = useState<1 | 2>(1); // 1: info, 2: success
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    password: '',
    confirmPassword: '',
    referralCode: '',
    agreeTerms: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev: any) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: any = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Vui lòng nhập họ tên';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Họ tên phải có ít nhất 2 ký tự';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Vui lòng nhập số điện thoại';
    } else if (!/^[0-9]{10,11}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
    }

    if (!formData.password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    if (!formData.agreeTerms) {
      newErrors.agreeTerms = 'Vui lòng đồng ý với điều khoản sử dụng';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});
    try {
      const result = await register({
        fullName: formData.fullName,
        phone: formData.phone,
        password: formData.password,
        referralCode: formData.referralCode,
      });

      if (result.success) {
        setStep(2);
      } else {
        setErrors({ submit: result.error || 'Đăng ký thất bại' });
      }
    } catch (err: any) {
      setErrors({ submit: err?.message || 'Đăng ký thất bại' });
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, text: '', color: '' };

    let strength = 0;
    if (password.length >= 6) strength += 1;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;

    const levels = [
      { strength: 0, text: '', color: '' },
      { strength: 1, text: 'Yếu', color: 'text-red-500' },
      { strength: 2, text: 'Trung bình', color: 'text-orange-500' },
      { strength: 3, text: 'Khá', color: 'text-yellow-500' },
      { strength: 4, text: 'Mạnh', color: 'text-green-500' },
      { strength: 5, text: 'Rất mạnh', color: 'text-green-600' },
    ];

    return levels[strength];
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const renderRegistrationStep = () => (
    <form onSubmit={handleRegisterSubmit} className="space-y-4">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-glow">
          <User className="w-7 h-7 text-primary-foreground" />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-1">Tạo tài khoản</h3>
        <p className="text-sm text-muted-foreground">Đăng ký tài khoản V-GREEN</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-foreground">
            Họ và tên <span className="text-danger">*</span>
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <User className="w-4 h-4 text-muted-foreground" />
            </div>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              placeholder="Nhập họ và tên"
              className={`w-full pl-10 pr-4 py-3 bg-background border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.fullName ? 'border-danger' : 'border-input'
              }`}
            />
          </div>
          {errors.fullName && (
            <p className="text-sm text-danger flex items-center space-x-1">
              <AlertCircle className="w-4 h-4" />
              <span>{errors.fullName}</span>
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-foreground">
            Số điện thoại <span className="text-danger">*</span>
          </label>
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
              className={`w-full pl-10 pr-4 py-3 bg-background border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.phone ? 'border-danger' : 'border-input'
              }`}
            />
          </div>
          {errors.phone && (
            <p className="text-sm text-danger flex items-center space-x-1">
              <AlertCircle className="w-4 h-4" />
              <span>{errors.phone}</span>
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-foreground">
            Mật khẩu <span className="text-danger">*</span>
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <Lock className="w-4 h-4 text-muted-foreground" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Tối thiểu 6 ký tự"
              className={`w-full pl-10 pr-12 py-3 bg-background border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.password ? 'border-danger' : 'border-input'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {formData.password && (
            <div className="flex items-center justify-between text-xs">
              <div className="flex-1 bg-muted rounded-full h-1 mr-2 overflow-hidden">
                <div
                  className={`h-1 rounded-full transition-all duration-200 ${
                    passwordStrength.strength >= 4 ? 'bg-success' :
                    passwordStrength.strength >= 3 ? 'bg-warning' :
                    passwordStrength.strength >= 2 ? 'bg-brand-energy-orange' : 'bg-danger'
                  }`}
                  style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                />
              </div>
              <span className={passwordStrength.color}>{passwordStrength.text}</span>
            </div>
          )}
          {errors.password && (
            <p className="text-sm text-danger flex items-center space-x-1">
              <AlertCircle className="w-4 h-4" />
              <span>{errors.password}</span>
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-foreground">
            Xác nhận mật khẩu <span className="text-danger">*</span>
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <Lock className="w-4 h-4 text-muted-foreground" />
            </div>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="Nhập lại mật khẩu"
              className={`w-full pl-10 pr-12 py-3 bg-background border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.confirmPassword ? 'border-danger' : 'border-input'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-sm text-danger flex items-center space-x-1">
              <AlertCircle className="w-4 h-4" />
              <span>{errors.confirmPassword}</span>
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-foreground">
            Mã giới thiệu <span className="text-muted-foreground">(tùy chọn)</span>
          </label>
          <input
            type="text"
            name="referralCode"
            value={formData.referralCode}
            onChange={handleInputChange}
            placeholder="Nhập mã giới thiệu (nếu có)"
            className="w-full px-4 py-3 bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-start space-x-2 cursor-pointer">
            <input
              type="checkbox"
              name="agreeTerms"
              checked={formData.agreeTerms}
              onChange={handleInputChange}
              className="mt-1 w-4 h-4 text-primary border-input rounded focus:ring-primary bg-background"
            />
            <span className="text-sm text-muted-foreground">
              Tôi đồng ý với{' '}
              <button type="button" className="text-primary hover:text-primary/80 underline">
                điều khoản sử dụng
              </button>{' '}
              và{' '}
              <button type="button" className="text-primary hover:text-primary/80 underline">
                chính sách bảo mật
              </button>{' '}
              của V-GREEN
            </span>
          </label>
          {errors.agreeTerms && (
            <p className="text-sm text-danger flex items-center space-x-1">
              <AlertCircle className="w-4 h-4" />
              <span>{errors.agreeTerms}</span>
            </p>
          )}
        </div>

        {errors.submit && (
          <div className="bg-danger-subtle border border-danger/20 rounded-xl p-3 flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 text-danger mt-0.5 flex-shrink-0" />
            <p className="text-sm text-danger-strong">{errors.submit}</p>
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-primary text-primary-foreground py-3 rounded-xl font-semibold hover:shadow-glow transition-all disabled:opacity-50 mt-6 flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span>Đang tạo tài khoản...</span>
          </>
        ) : (
          'Tạo tài khoản'
        )}
      </button>
    </form>
  );

  const renderSuccessStep = () => (
    <div className="text-center space-y-6">
      <div className="w-20 h-20 bg-gradient-primary rounded-3xl flex items-center justify-center mx-auto shadow-glow-lg animate-scale-in">
        <CheckCircle className="w-10 h-10 text-primary-foreground" />
      </div>

      <div>
        <h3 className="text-2xl font-extrabold text-foreground mb-2">Đăng ký thành công!</h3>
        <p className="text-muted-foreground mb-4">
          Chào mừng <span className="font-semibold text-foreground">{formData.fullName}</span> đến với V-GREEN
        </p>
        <div className="text-sm text-muted-foreground">
          Tài khoản của bạn đã được tạo thành công.<br />
          Bạn có thể đăng nhập ngay bây giờ.
        </div>
      </div>

      <div className="bg-success-subtle p-4 rounded-xl border border-success/20 text-left">
        <h4 className="font-semibold text-success-strong mb-3 text-center">Thông tin tài khoản</h4>
        <div className="space-y-2 text-sm text-success-strong/90">
          <p><strong className="text-success-strong">Họ tên:</strong> {formData.fullName}</p>
          <p><strong className="text-success-strong">Số điện thoại:</strong> {formData.phone}</p>
          {formData.referralCode && (
            <p><strong className="text-success-strong">Mã giới thiệu:</strong> {formData.referralCode}</p>
          )}
        </div>
      </div>

      <button
        onClick={() => navigate('/my-account')}
        className="w-full bg-gradient-primary text-primary-foreground py-3 rounded-xl font-semibold hover:shadow-glow transition-all"
      >
        Vào tài khoản
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="border-b border-border bg-card">
        <div className="flex items-center justify-between p-4 max-w-6xl mx-auto">
          <button
            onClick={() => navigate('/login')}
            className="p-2 hover:bg-muted rounded-full transition-colors"
            aria-label="Quay lại"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-base md:text-lg font-semibold text-foreground tracking-wide">ĐĂNG KÝ TÀI KHOẢN</h1>
          <div className="w-9 h-9"></div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Left: Welcome illustration + benefits */}
        <div className="hidden md:block">
          <div className="bg-gradient-hero rounded-3xl p-10 text-white shadow-elevated relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-brand-accent-400/30 blur-3xl pointer-events-none" />
            <div className="relative">
              <LogoVGreen variant="full" theme="dark" />
              <h2 className="text-3xl font-extrabold mt-6 mb-3 leading-tight">
                Tham gia V-GREEN
              </h2>
              <p className="text-white/90 mb-6 leading-relaxed">
                Đầu tư xanh — Tương lai bền vững. Cùng 50,000+ nhà đầu tư phát triển hệ thống trạm sạc VinFast.
              </p>
              <WelcomeOnboarding className="mx-auto drop-shadow-2xl" size={280} />
              <ul className="space-y-2 mt-6 text-sm text-white/90">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-brand-primary-200" />
                  Đăng ký miễn phí trong 60 giây
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-brand-primary-200" />
                  Thưởng đăng ký lên đến 500,000đ
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-brand-primary-200" />
                  Hỗ trợ KYC & rút tiền 24/7
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Right: Form */}
        <div>
          {/* Mobile mini hero */}
          <div className="md:hidden mb-6 bg-gradient-hero rounded-2xl p-5 text-white text-center">
            <LogoVGreen variant="full" theme="dark" />
            <h2 className="text-lg font-bold mt-3">Tham gia V-GREEN</h2>
          </div>

          <div className="bg-card rounded-2xl shadow-card border border-border p-6 md:p-8">
            {step === 1 && renderRegistrationStep()}
            {step === 2 && renderSuccessStep()}
          </div>

          {step === 1 && (
            <div className="mt-6 text-center">
              <p className="text-muted-foreground text-sm">
                Đã có tài khoản?{' '}
                <button
                  onClick={() => navigate('/login')}
                  className="text-primary hover:text-primary/80 font-medium"
                >
                  Đăng nhập ngay
                </button>
              </p>
            </div>
          )}

          {step === 1 && (
            <div className="mt-6 bg-success-subtle rounded-xl p-4 border border-success/20">
              <div className="flex items-start space-x-3">
                <div className="w-9 h-9 bg-success/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-success-strong" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-success-strong mb-1">Bảo mật thông tin</h4>
                  <ul className="text-sm text-success-strong/80 space-y-1">
                    <li>• Thông tin cá nhân được mã hóa và bảo vệ</li>
                    <li>• Mật khẩu được lưu trữ an toàn (bcrypt)</li>
                    <li>• Không chia sẻ thông tin với bên thứ ba</li>
                    <li>• Tuân thủ quy định bảo mật ngân hàng</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;
