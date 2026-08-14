/**
 * Personal Information page component - User profile management
 */

import React, { useState } from 'react';
import { ArrowLeft, User, Phone, Mail, MapPin, Calendar, Camera, Edit, Save, X, CheckCircle, AlertCircle, Shield, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router';

interface PersonalInfo {
  fullName: string;
  phone: string;
  email: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  address: string;
  city: string;
  district: string;
  ward: string;
  occupation: string;
  income: string;
  bankAccount: string;
  bankName: string;
  idNumber: string;
  idIssueDate: string;
  idIssuePlace: string;
}

const PersonalInfo: React.FC = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [showSensitive, setShowSensitive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});

  // Mock user data
  const [userInfo, setUserInfo] = useState<PersonalInfo>({
    fullName: 'Nguyễn Văn A',
    phone: '0901234567',
    email: 'nguyenvana@email.com',
    dateOfBirth: '1990-01-15',
    gender: 'male',
    address: '123 Nguyễn Huệ',
    city: 'Hồ Chí Minh',
    district: 'Quận 1',
    ward: 'Phường Bến Nghé',
    occupation: 'Kỹ sư phần mềm',
    income: '20000000',
    bankAccount: '1234567890',
    bankName: 'Vietcombank',
    idNumber: '123456789',
    idIssueDate: '2015-01-01',
    idIssuePlace: 'CA TP.HCM'
  });

  const [originalInfo, setOriginalInfo] = useState<PersonalInfo>({ ...userInfo });

  /**
   * Handle input change
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUserInfo(prev => ({
      ...prev,
      [name]: value
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
   * Validate form
   */
  const validateForm = () => {
    const newErrors: any = {};

    // Required fields validation
    if (!userInfo.fullName.trim()) {
      newErrors.fullName = 'Vui lòng nhập họ tên';
    }

    if (!userInfo.phone.trim()) {
      newErrors.phone = 'Vui lòng nhập số điện thoại';
    } else if (!/^[0-9]{10,11}$/.test(userInfo.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
    }

    if (!userInfo.email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userInfo.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!userInfo.dateOfBirth) {
      newErrors.dateOfBirth = 'Vui lòng nhập ngày sinh';
    }

    if (!userInfo.address.trim()) {
      newErrors.address = 'Vui lòng nhập địa chỉ';
    }

    if (!userInfo.idNumber.trim()) {
      newErrors.idNumber = 'Vui lòng nhập số CMND/CCCD';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle save changes
   */
  const handleSave = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsEditing(false);
      setOriginalInfo({ ...userInfo });
      
      // Show success message
      alert('Thông tin đã được cập nhật thành công!');
    }, 1500);
  };

  /**
   * Handle cancel editing
   */
  const handleCancel = () => {
    setUserInfo({ ...originalInfo });
    setErrors({});
    setIsEditing(false);
  };

  /**
   * Format currency
   */
  const formatCurrency = (amount: string) => {
    if (!amount) return '';
    return `${parseInt(amount).toLocaleString()} VND`;
  };

  /**
   * Get masked info
   */
  const getMaskedInfo = (info: string, showCount = 4) => {
    if (!info) return '';
    if (showSensitive) return info;
    return '*'.repeat(info.length - showCount) + info.slice(-showCount);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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

      {/* Hero Section */}
      <div className="relative h-32 bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 text-center px-4">
          <h2 className="text-xl font-bold text-white mb-1">THÔNG TIN TÀI KHOẢN</h2>
          <p className="text-blue-100 text-sm">Quản lý thông tin cá nhân của bạn</p>
        </div>
      </div>

      <div className="px-4 pb-6">
        {/* Profile Picture */}
        <div className="bg-white rounded-xl shadow-sm p-6 -mt-6 relative z-10 mb-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-2xl">
                  {userInfo.fullName.charAt(0)}
                </span>
              </div>
              {isEditing && (
                <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors">
                  <Camera className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900">{userInfo.fullName}</h3>
              <p className="text-gray-600">{userInfo.phone}</p>
              <div className="flex items-center space-x-2 mt-1">
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                  Đã xác thực
                </span>
                <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full font-medium">
                  VIP Gold
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Personal Information */}
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
            {/* Full Name */}
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
                    value={userInfo.fullName}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.fullName ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.fullName && (
                    <p className="text-sm text-red-600 mt-1">{errors.fullName}</p>
                  )}
                </div>
              ) : (
                <p className="text-gray-900">{userInfo.fullName}</p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Số điện thoại <span className="text-red-500">*</span>
              </label>
              {isEditing ? (
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={userInfo.phone}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.phone && (
                    <p className="text-sm text-red-600 mt-1">{errors.phone}</p>
                  )}
                </div>
              ) : (
                <p className="text-gray-900">{getMaskedInfo(userInfo.phone, 4)}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Email <span className="text-red-500">*</span>
              </label>
              {isEditing ? (
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={userInfo.email}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600 mt-1">{errors.email}</p>
                  )}
                </div>
              ) : (
                <p className="text-gray-900">{userInfo.email}</p>
              )}
            </div>

            {/* Date of Birth */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Ngày sinh <span className="text-red-500">*</span>
              </label>
              {isEditing ? (
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={userInfo.dateOfBirth}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.dateOfBirth ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.dateOfBirth && (
                    <p className="text-sm text-red-600 mt-1">{errors.dateOfBirth}</p>
                  )}
                </div>
              ) : (
                <p className="text-gray-900">{new Date(userInfo.dateOfBirth).toLocaleDateString('vi-VN')}</p>
              )}
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Giới tính</label>
              {isEditing ? (
                <select
                  name="gender"
                  value={userInfo.gender}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
                >
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                  <option value="other">Khác</option>
                </select>
              ) : (
                <p className="text-gray-900">
                  {userInfo.gender === 'male' ? 'Nam' : userInfo.gender === 'female' ? 'Nữ' : 'Khác'}
                </p>
              )}
            </div>

            {/* Occupation */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Nghề nghiệp</label>
              {isEditing ? (
                <input
                  type="text"
                  name="occupation"
                  value={userInfo.occupation}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
                />
              ) : (
                <p className="text-gray-900">{userInfo.occupation || 'Chưa cập nhật'}</p>
              )}
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Địa chỉ liên hệ</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Address */}
            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Địa chỉ <span className="text-red-500">*</span>
              </label>
              {isEditing ? (
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    name="address"
                    value={userInfo.address}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.address ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.address && (
                    <p className="text-sm text-red-600 mt-1">{errors.address}</p>
                  )}
                </div>
              ) : (
                <p className="text-gray-900">{userInfo.address}</p>
              )}
            </div>

            {/* Ward */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Phường/Xã</label>
              {isEditing ? (
                <input
                  type="text"
                  name="ward"
                  value={userInfo.ward}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
                />
              ) : (
                <p className="text-gray-900">{userInfo.ward}</p>
              )}
            </div>

            {/* District */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Quận/Huyện</label>
              {isEditing ? (
                <input
                  type="text"
                  name="district"
                  value={userInfo.district}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
                />
              ) : (
                <p className="text-gray-900">{userInfo.district}</p>
              )}
            </div>

            {/* City */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Tỉnh/Thành phố</label>
              {isEditing ? (
                <input
                  type="text"
                  name="city"
                  value={userInfo.city}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
                />
              ) : (
                <p className="text-gray-900">{userInfo.city}</p>
              )}
            </div>
          </div>
        </div>

        {/* Financial Information */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin tài chính</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Income */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Thu nhập hàng tháng</label>
              {isEditing ? (
                <input
                  type="number"
                  name="income"
                  value={userInfo.income}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
                />
              ) : (
                <p className="text-gray-900">{formatCurrency(userInfo.income)}</p>
              )}
            </div>

            {/* Bank Name */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Ngân hàng</label>
              {isEditing ? (
                <input
                  type="text"
                  name="bankName"
                  value={userInfo.bankName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
                />
              ) : (
                <p className="text-gray-900">{userInfo.bankName}</p>
              )}
            </div>

            {/* Bank Account */}
            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Số tài khoản ngân hàng</label>
              {isEditing ? (
                <input
                  type="text"
                  name="bankAccount"
                  value={userInfo.bankAccount}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
                />
              ) : (
                <p className="text-gray-900">{getMaskedInfo(userInfo.bankAccount, 4)}</p>
              )}
            </div>
          </div>
        </div>

        {/* Identity Information */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin định danh</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* ID Number */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Số CMND/CCCD <span className="text-red-500">*</span>
              </label>
              {isEditing ? (
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    name="idNumber"
                    value={userInfo.idNumber}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.idNumber ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.idNumber && (
                    <p className="text-sm text-red-600 mt-1">{errors.idNumber}</p>
                  )}
                </div>
              ) : (
                <p className="text-gray-900">{getMaskedInfo(userInfo.idNumber, 3)}</p>
              )}
            </div>

            {/* ID Issue Date */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Ngày cấp</label>
              {isEditing ? (
                <input
                  type="date"
                  name="idIssueDate"
                  value={userInfo.idIssueDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
                />
              ) : (
                <p className="text-gray-900">{new Date(userInfo.idIssueDate).toLocaleDateString('vi-VN')}</p>
              )}
            </div>

            {/* ID Issue Place */}
            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Nơi cấp</label>
              {isEditing ? (
                <input
                  type="text"
                  name="idIssuePlace"
                  value={userInfo.idIssuePlace}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
                />
              ) : (
                <p className="text-gray-900">{userInfo.idIssuePlace}</p>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
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

        {/* Verification Status */}
        <div className="mt-6 bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-green-900 mb-1">Trạng thái xác thực</h4>
              <div className="space-y-1 text-sm text-green-700">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Số điện thoại đã xác thực</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Email đã xác thực</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>CMND/CCCD đã xác thực</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalInfo;
