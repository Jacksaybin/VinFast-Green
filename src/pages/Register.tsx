/**
 * Register page component - User registration interface
 */

import React, { useState } from 'react';
import { ArrowLeft, User, Phone, Lock, Shield, CheckCircle, AlertCircle, RefreshCw, Eye, EyeOff, Gift } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useAuthStore } from '../stores/authStore';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const register = useAuthStore((s) => s.register);
  const [step, setStep] = useState(1); // 1: info, 2: OTP, 3: success
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    password: '',
    confirmPassword: '',
    referralCode: '',
    otp: '',
    agreeTerms: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [errors, setErrors] = useState<any>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  /**
   * Handle form input changes
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  /**
   * Start countdown timer
   */
  const startCountdown = () => {
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  /**
   * Validate registration form
   */
  const validateForm = () => {
    const newErrors: any = {};

    // Full name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Vui lòng nhập họ tên';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Họ tên phải có ít nhất 2 ký tự';
    }



    // Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone = 'Vui lòng nhập số điện thoại';
    } else if (!/^[0-9]{10,11}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    // Referral code validation - optional
    // (kept for future use when referral system is active)

    // Terms agreement validation
    if (!formData.agreeTerms) {
      newErrors.agreeTerms = 'Vui lòng đồng ý với điều khoản sử dụng';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle registration form submission
   */
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setStep(2);
      startCountdown();
    }, 1500);
  };

  /**
   * Handle OTP verification
   */
  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    // Validate OTP
    if (!formData.otp.trim() || formData.otp.length !== 6) {
      setErrors({ otp: 'Vui lòng nhập mã OTP 6 số' });
      setIsLoading(false);
      return;
    }

    // Simulate API call
    setTimeout(async () => {
      if (formData.otp === '123456') {
        const result = await register({
          fullName: formData.fullName,
          phone: formData.phone,
          password: formData.password,
          referralCode: formData.referralCode,
        });
        setIsLoading(false);
        if (result.success) {
          setStep(3);
        } else {
          setErrors({ otp: result.error || 'Đăng ký thất bại' });
        }
      } else {
        setIsLoading(false);
        setErrors({ otp: 'Mã OTP không chính xác' });
      }
    }, 1500);
  };

  /**
   * Handle resend OTP
   */
  const handleResendOTP = async () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      startCountdown();
    }, 1000);
  };

  /**
   * Get password strength
   */
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
      { strength: 5, text: 'Rất mạnh', color: 'text-green-600' }
    ];

    return levels[strength];
  };

  const passwordStrength = getPasswordStrength(formData.password);

  /**
   * Render step 1: Registration form
   */
  const renderRegistrationStep = () => (
    <form onSubmit={handleRegisterSubmit} className="space-y-4">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
          <User className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Tạo tài khoản</h3>
        <p className="text-sm text-gray-600">Đăng ký tài khoản V-GREEN</p>
      </div>

      <div className="space-y-4">
        {/* Full Name */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Họ và tên <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <User className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              placeholder="Nhập họ và tên"
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                errors.fullName ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            />
          </div>
          {errors.fullName && (
            <p className="text-sm text-red-600 flex items-center space-x-1">
              <AlertCircle className="w-4 h-4" />
              <span>{errors.fullName}</span>
            </p>
          )}
        </div>



        {/* Phone */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Số điện thoại <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <Phone className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Nhập số điện thoại"
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                errors.phone ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            />
          </div>
          {errors.phone && (
            <p className="text-sm text-red-600 flex items-center space-x-1">
              <AlertCircle className="w-4 h-4" />
              <span>{errors.phone}</span>
            </p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Mật khẩu <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <Lock className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Nhập mật khẩu"
              className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {formData.password && (
            <div className="flex items-center space-x-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    passwordStrength.strength === 1 ? 'bg-red-500 w-1/5' :
                    passwordStrength.strength === 2 ? 'bg-orange-500 w-2/5' :
                    passwordStrength.strength === 3 ? 'bg-yellow-500 w-3/5' :
                    passwordStrength.strength === 4 ? 'bg-green-500 w-4/5' :
                    passwordStrength.strength === 5 ? 'bg-green-600 w-full' : 'w-0'
                  }`}
                />
              </div>
              <span className={`text-sm font-medium ${passwordStrength.color}`}>
                {passwordStrength.text}
              </span>
            </div>
          )}
          {errors.password && (
            <p className="text-sm text-red-600 flex items-center space-x-1">
              <AlertCircle className="w-4 h-4" />
              <span>{errors.password}</span>
            </p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Xác nhận mật khẩu <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <Lock className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="Nhập lại mật khẩu"
              className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {formData.confirmPassword && formData.password === formData.confirmPassword && (
            <p className="text-sm text-green-600 flex items-center space-x-1">
              <CheckCircle className="w-4 h-4" />
              <span>Mật khẩu khớp</span>
            </p>
          )}
          {errors.confirmPassword && (
            <p className="text-sm text-red-600 flex items-center space-x-1">
              <AlertCircle className="w-4 h-4" />
              <span>{errors.confirmPassword}</span>
            </p>
          )}
        </div>

        {/* Referral Code */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Mã giới thiệu <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <Gift className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              name="referralCode"
              value={formData.referralCode}
              onChange={handleInputChange}
              placeholder="Nhập mã giới thiệu: VIC1289"
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                errors.referralCode ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            />
          </div>
          {formData.referralCode && formData.referralCode.trim().toUpperCase() === 'VIC1289' && (
            <p className="text-sm text-green-600 flex items-center space-x-1">
              <CheckCircle className="w-4 h-4" />
              <span>Mã giới thiệu hợp lệ - Bạn sẽ nhận được thưởng đặc biệt!</span>
            </p>
          )}
          {errors.referralCode && (
            <p className="text-sm text-red-600 flex items-center space-x-1">
              <AlertCircle className="w-4 h-4" />
              <span>{errors.referralCode}</span>
            </p>
          )}
          <p className="text-xs text-gray-500">
            <strong>Bắt buộc:</strong> Chỉ chấp nhận mã giới thiệu VIC1289
          </p>
        </div>

        {/* Terms Agreement */}
        <div className="space-y-2">
          <label className="flex items-start space-x-3">
            <input
              type="checkbox"
              name="agreeTerms"
              checked={formData.agreeTerms}
              onChange={handleInputChange}
              className="mt-1 w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <span className="text-sm text-gray-700">
              Tôi đồng ý với{' '}
              <a href="#" className="text-green-600 hover:text-green-700 font-medium">
                Điều khoản sử dụng
              </a>{' '}
              và{' '}
              <a href="#" className="text-green-600 hover:text-green-700 font-medium">
                Chính sách bảo mật
              </a>
            </span>
          </label>
          {errors.agreeTerms && (
            <p className="text-sm text-red-600 flex items-center space-x-1">
              <AlertCircle className="w-4 h-4" />
              <span>{errors.agreeTerms}</span>
            </p>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-200 disabled:opacity-50"
      >
        {isLoading ? (
          <div className="flex items-center justify-center space-x-2">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span>Đang tạo tài khoản...</span>
          </div>
        ) : (
          'Tạo tài khoản'
        )}
      </button>
    </form>
  );

  /**
   * Render step 2: OTP verification
   */
  const renderOTPStep = () => (
    <form onSubmit={handleOTPSubmit} className="space-y-4">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Xác nhận OTP</h3>
        <p className="text-sm text-gray-600">
          Mã xác nhận đã được gửi đến {formData.phone}
        </p>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Mã OTP (6 số)
        </label>
        <input
          type="text"
          name="otp"
          value={formData.otp}
          onChange={handleInputChange}
          placeholder="Nhập mã OTP"
          maxLength={6}
          className={`w-full px-4 py-3 border rounded-lg text-center text-lg font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.otp ? 'border-red-500' : 'border-gray-300'
          }`}
          required
        />
        {errors.otp && (
          <p className="text-sm text-red-600 flex items-center space-x-1">
            <AlertCircle className="w-4 h-4" />
            <span>{errors.otp}</span>
          </p>
        )}
      </div>

      <div className="text-center">
        <p className="text-sm text-gray-600 mb-2">
          Không nhận được mã?{' '}
          {countdown > 0 ? (
            <span className="text-blue-600 font-medium">
              Gửi lại sau {countdown}s
            </span>
          ) : (
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={isLoading}
              className="text-blue-600 font-medium hover:text-blue-700 disabled:opacity-50"
            >
              Gửi lại
            </button>
          )}
        </p>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:opacity-50"
      >
        {isLoading ? (
          <div className="flex items-center justify-center space-x-2">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span>Đang xác nhận...</span>
          </div>
        ) : (
          'Xác nhận OTP'
        )}
      </button>
    </form>
  );

  /**
   * Render step 3: Success
   */
  const renderSuccessStep = () => (
    <div className="text-center space-y-6">
      <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle className="w-10 h-10 text-white" />
      </div>
      
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Đăng ký thành công!</h3>
        <p className="text-gray-600 mb-4">
          Chào mừng {formData.fullName} đến với V-GREEN
        </p>
        <div className="text-sm text-gray-500">
          Tài khoản của bạn đã được tạo thành công.<br />
          Bạn có thể đăng nhập ngay bây giờ.
        </div>
      </div>

      <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
        <h4 className="font-semibold text-green-800 mb-2">Thông tin tài khoản</h4>
        <div className="space-y-1 text-sm text-green-700">
          <p><strong>Họ tên:</strong> {formData.fullName}</p>
          <p><strong>Số điện thoại:</strong> {formData.phone}</p>
          <p><strong>Mã giới thiệu:</strong> {formData.referralCode}</p>
        </div>
      </div>

      <button
        onClick={() => navigate('/my-account')}
        className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-200"
      >
        Vào tài khoản
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm relative">
        <div className="flex items-center justify-between p-4">
          <button 
            onClick={() => navigate('/login')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">ĐĂNG KÝ TÀI KHOẢN</h1>
          <div className="w-9 h-9"></div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b">
        <div className="flex items-center justify-center px-4 py-3">
          <div className="flex items-center space-x-2">
            {[1, 2, 3].map((stepNum) => (
              <React.Fragment key={stepNum}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  stepNum <= step 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {stepNum < step ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    stepNum
                  )}
                </div>
                {stepNum < 3 && (
                  <div className={`w-8 h-1 rounded-full ${
                    stepNum < step ? 'bg-green-600' : 'bg-gray-200'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="relative h-32 bg-gradient-to-br from-green-600 to-green-700 flex items-center justify-center">
        <img 
          src="https://pub-cdn.sider.ai/u/U0E5HLZKXNK/web-coder/68750791b1dac45b18d4a236/resource/46759845-a659-4b01-a3ae-e48b69172803.jpg"
          alt="Registration"
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />
        <div className="relative z-10 text-center px-4">
          <h2 className="text-xl font-bold text-white mb-1">THAM GIA V-GREEN</h2>
          <p className="text-green-100 text-sm">Đầu tư xanh - Tương lai bền vững</p>
        </div>
      </div>

      <div className="px-4 py-6">
        {/* Main Form */}
        <div className="bg-white rounded-2xl shadow-lg p-6 -mt-4 relative z-10">
          {step === 1 && renderRegistrationStep()}
          {step === 2 && renderOTPStep()}
          {step === 3 && renderSuccessStep()}
        </div>

        {/* Login Link */}
        {step === 1 && (
          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Đã có tài khoản?{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-green-600 hover:text-green-700 font-medium"
              >
                Đăng nhập ngay
              </button>
            </p>
          </div>
        )}

        {/* Security Notice */}
        <div className="mt-6 bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-green-900 mb-1">Bảo mật thông tin</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Thông tin cá nhân được mã hóa và bảo vệ</li>
                <li>• Mã OTP có hiệu lực trong 5 phút</li>
                <li>• Không chia sẻ thông tin với bên thứ ba</li>
                <li>• Tuân thủ quy định bảo mật ngân hàng</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div className="mt-6 bg-white rounded-xl shadow-sm p-4">
          <h4 className="font-semibold text-gray-900 mb-3">Quyền lợi thành viên V-GREEN</h4>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Đầu tư vào hệ sinh thái xanh VinFast</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Lợi nhuận hàng ngày từ 0.2% - 2.2%</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Rút tiền mọi lúc, mọi nơi</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Hỗ trợ 24/7 từ đội ngũ chuyên gia</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Tham gia các chương trình ưu đãi</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
