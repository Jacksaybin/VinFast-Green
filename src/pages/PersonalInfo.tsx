/**
 * Personal Information page component - User profile management
 * Dữ liệu thật từ authStore/backend, kèm đổi mật khẩu
 */

import React, { useEffect, useState } from 'react';
import { ArrowLeft, User, Phone, Mail, Camera, Edit, Save, X, CheckCircle, Eye, EyeOff, Lock, KeyRound } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useAuthStore } from '../stores/authStore';

const PersonalInfo: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [showSensitive, setShowSensitive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    bankAccount: '',
    bankName: '',
    bankBranch: '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        fullName: user.fullName || '',
        email: user.email || '',
        bankAccount: (user as any).bankAccount || '',
        bankName: (user as any).bankName || '',
        bankBranch: (user as any).bankBranch || '',
      });
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Vui lòng đăng nhập</p>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev: any) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors: any = {};
    if (!form.fullName.trim()) newErrors.fullName = 'Vui lòng nhập họ tên';
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Email không hợp lệ';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setIsLoading(true);
    setErrors({});

    updateProfile({
      fullName: form.fullName,
      email: form.email,
      bankAccount: form.bankAccount,
      bankName: form.bankName,
      bankBranch: form.bankBranch,
    });

    setIsLoading(false);
    setIsEditing(false);
    alert('Thông tin đã được cập nhật thành công!');
  };

  const handleCancel = () => {
    if (user) {
      setForm({
        fullName: user.fullName || '',
        email: user.email || '',
        bankAccount: (user as any).bankAccount || '',
        bankName: (user as any).bankName || '',
        bankBranch: (user as any).bankBranch || '',
      });
    }
    setErrors({});
    setIsEditing(false);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (passwordForm.newPassword.length < 6) {
      setPasswordError('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Mật khẩu xác nhận không khớp');
      return;
    }

    setIsChangingPassword(true);
    try {
      const { authApi } = await import('../lib/api');
      const result = await authApi.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      if (result.success) {
        setPasswordSuccess('Đổi mật khẩu thành công');
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setPasswordError(result.error || 'Đổi mật khẩu thất bại');
      }
    } catch {
      setPasswordError('Lỗi kết nối, vui lòng thử lại');
    }
    setIsChangingPassword(false);
  };

  const formatCurrency = (amount: string) => {
    if (!amount) return '';
    return `${parseInt(amount).toLocaleString()} VND`;
  };

  const getMaskedInfo = (info: string, showCount = 4) => {
    if (!info) return '';
    if (showSensitive) return info;
    return '*'.repeat(Math.max(0, info.length - showCount)) + info.slice(-showCount);
  };

  const inputClass = (hasError = false) =>
    `w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
      hasError ? 'border-red-500' : 'border-gray-300'
    }`;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => navigate('/my-account')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">THÔNG TIN CÁ NHÂN</h1>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`p-2 rounded-full transition-colors ${
              isEditing ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
            }`}
          >
            {isEditing ? <X className="w-5 h-5" /> : <Edit className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <div className="relative h-32 bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 text-center px-4">
          <h2 className="text-xl font-bold text-white mb-1">THÔNG TIN TÀI KHOẢN</h2>
          <p className="text-blue-100 text-sm">Quản lý thông tin cá nhân của bạn</p>
        </div>
      </div>

      <div className="px-4 pb-6">
        <div className="bg-white rounded-xl shadow-sm p-6 -mt-6 relative z-10 mb-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-2xl">
                  {form.fullName.charAt(0) || 'U'}
                </span>
              </div>
              {isEditing && (
                <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors">
                  <Camera className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900">{form.fullName}</h3>
              <p className="text-gray-600">{user.phone}</p>
              <div className="flex items-center space-x-2 mt-1">
                {user.kycStatus === 'approved' ? (
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                    Đã xác thực
                  </span>
                ) : (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full font-medium">
                    {user.kycStatus === 'pending' ? 'Chờ xác thực' : 'Chưa xác thực'}
                  </span>
                )}
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                  Mã giới thiệu: {user.referralCode}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Thông tin cá nhân</h3>
            <button
              onClick={() => setShowSensitive(!showSensitive)}
              className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
            >
              {showSensitive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Họ và tên <span className="text-red-500">*</span>
              </label>
              {isEditing ? (
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    name="fullName"
                    value={form.fullName}
                    onChange={handleInputChange}
                    className={`${inputClass(!!errors.fullName)} pl-10`}
                  />
                  {errors.fullName && (
                    <p className="text-sm text-red-600 mt-1">{errors.fullName}</p>
                  )}
                </div>
              ) : (
                <p className="text-gray-900">{form.fullName}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Số điện thoại</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="tel"
                  value={user.phone}
                  disabled
                  className={`${inputClass()} pl-10 bg-gray-50 text-gray-500`}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Email</label>
              {isEditing ? (
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleInputChange}
                    className={`${inputClass(!!errors.email)} pl-10`}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600 mt-1">{errors.email}</p>
                  )}
                </div>
              ) : (
                <p className="text-gray-900">{form.email || 'Chưa cập nhật'}</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin ngân hàng</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Ngân hàng</label>
              {isEditing ? (
                <input
                  type="text"
                  name="bankName"
                  value={form.bankName}
                  onChange={handleInputChange}
                  className={inputClass()}
                  placeholder="VD: Vietcombank"
                />
              ) : (
                <p className="text-gray-900">{form.bankName || 'Chưa cập nhật'}</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Chi nhánh</label>
              {isEditing ? (
                <input
                  type="text"
                  name="bankBranch"
                  value={form.bankBranch}
                  onChange={handleInputChange}
                  className={inputClass()}
                  placeholder="VD: Chi nhánh Hà Nội"
                />
              ) : (
                <p className="text-gray-900">{form.bankBranch || 'Chưa cập nhật'}</p>
              )}
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Số tài khoản ngân hàng</label>
              {isEditing ? (
                <input
                  type="text"
                  name="bankAccount"
                  value={form.bankAccount}
                  onChange={handleInputChange}
                  className={inputClass()}
                  placeholder="Nhập số tài khoản để nhận tiền rút"
                />
              ) : (
                <p className="text-gray-900">{getMaskedInfo(form.bankAccount, 4) || 'Chưa cập nhật'}</p>
              )}
            </div>
          </div>
        </div>

        {isEditing && (
          <div className="flex space-x-3">
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Save className="w-5 h-5" />
              )}
              <span>{isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
            </button>
            <button
              onClick={handleCancel}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center space-x-2"
            >
              <X className="w-5 h-5" />
              <span>Hủy</span>
            </button>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <Lock className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Đổi mật khẩu</h3>
              <p className="text-sm text-gray-500">Cập nhật mật khẩu đăng nhập của bạn</p>
            </div>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Mật khẩu hiện tại</label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
                  className={`${inputClass()} pl-10`}
                  placeholder="Nhập mật khẩu hiện tại"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Mật khẩu mới</label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                  className={`${inputClass()} pl-10`}
                  placeholder="Ít nhất 6 ký tự"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Xác nhận mật khẩu mới</label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                  className={`${inputClass()} pl-10`}
                  placeholder="Nhập lại mật khẩu mới"
                  required
                />
              </div>
            </div>

            {passwordError && (
              <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{passwordError}</p>
            )}
            {passwordSuccess && (
              <p className="text-sm text-green-700 bg-green-50 p-3 rounded-lg flex items-center gap-2">
                <CheckCircle className="w-4 h-4" /> {passwordSuccess}
              </p>
            )}

            <button
              type="submit"
              disabled={isChangingPassword}
              className="w-full py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isChangingPassword ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Đang xử lý...</span>
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  <span>Đổi mật khẩu</span>
                </>
              )}
            </button>
          </form>
        </div>

        <div className="mt-6 bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-green-900 mb-1">Trạng thái xác thực</h4>
              {user.kycStatus === 'approved' ? (
                <p className="text-sm text-green-700">Tài khoản của bạn đã được xác thực đầy đủ.</p>
              ) : user.kycStatus === 'pending' ? (
                <p className="text-sm text-green-700">Yêu cầu xác thực của bạn đang được xem xét.</p>
              ) : (
                <p className="text-sm text-green-700">Tài khoản của bạn chưa hoàn tất xác thực.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalInfo;