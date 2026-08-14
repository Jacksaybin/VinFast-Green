/**
 * Login page component - User authentication interface
 */

import React, { useState } from 'react';
import { ArrowLeft, Eye, EyeOff, Phone, Lock, Shield, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router';
import { useAuthStore } from '../stores/authStore';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((s) => s.login);
  const [formData, setFormData] = useState({
    phone: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  /**
   * Handle form input changes
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  /**
   * Handle form submission
   */
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm relative">
        <div className="flex items-center justify-between p-4">
          <button 
            onClick={() => navigate('/')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">ĐĂNG NHẬP</h1>
          <div className="w-9 h-9"></div>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="relative h-32 bg-gradient-to-br from-green-600 to-green-700 flex items-center justify-center">
        <img 
          src="https://pub-cdn.sider.ai/u/U0E5HLZKXNK/web-coder/68750791b1dac45b18d4a236/resource/9413804c-3b5d-4906-a76d-af00e9df0332.jpg"
          alt="VinFast Electric Vehicle"
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />
        <div className="relative z-10 text-center px-4">
          <h2 className="text-xl font-bold text-white mb-1">VÌ TƯƠNG LAI XANH</h2>
          <p className="text-green-100 text-sm">Đầu tư thông minh - Sinh lợi bền vững</p>
        </div>
      </div>

      <div className="px-4 py-6">
        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-lg p-6 -mt-4 relative z-10">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <User className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Chào mừng trở lại!</h3>
            <p className="text-sm text-gray-600">Đăng nhập để tiếp tục đầu tư</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Phone Number Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Số điện thoại
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
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Mật khẩu
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
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg">{error}</div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Đang đăng nhập...</span>
                </div>
              ) : (
                'Đăng nhập'
              )}
            </button>
          </form>

          {/* Action Links */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
            <button 
              onClick={() => navigate('/register')}
              className="text-sm text-green-600 hover:text-green-700 font-medium"
            >
              Đăng ký tài khoản
            </button>
            <button 
              onClick={() => navigate('/forgot-password')}
              className="text-sm text-gray-600 hover:text-gray-700"
            >
              Quên mật khẩu?
            </button>
          </div>
        </div>

        {/* Demo Access */}
        <div className="mt-6 bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
            <h4 className="font-semibold text-gray-900">Demo Access</h4>
          </div>
          
          <div className="space-y-2 text-sm text-gray-600 mb-4">
            <p>• <span className="font-medium">User:</span> Bất kỳ số điện thoại nào</p>
            <p>• <span className="font-medium">Admin:</span> phone: "admin", password: "admin123"</p>
          </div>
          
          <button
            type="button"
            onClick={() => setFormData({ phone: 'admin', password: 'admin123' })}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Điền thông tin Admin demo
          </button>
        </div>

        {/* Security Notice */}
        <div className="mt-6 bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-green-900 mb-1">Bảo mật tuyệt đối</h4>
              <p className="text-sm text-green-700 leading-relaxed">
                Thông tin của bạn được mã hóa SSL 256-bit và tuân thủ các tiêu chuẩn bảo mật quốc tế. 
                V-GREEN cam kết bảo vệ tuyệt đối quyền riêng tư và an toàn tài khoản của bạn.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;