/**
 * Customer Service Contact page for password recovery
 */

import React from 'react';
import { ArrowLeft, Phone, MessageCircle, Mail, Clock, HelpCircle, Shield, Users, Headphones } from 'lucide-react';
import { useNavigate } from 'react-router';

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();

  /**
   * Handle phone call
   */
  const handlePhoneCall = () => {
    window.location.href = 'tel:1900123456';
  };

  /**
   * Handle email contact
   */
  const handleEmailContact = () => {
    window.location.href = 'mailto:support@v-green.com';
  };

  /**
   * Handle live chat
   */
  const handleLiveChat = () => {
    // Implement live chat functionality
    alert('Đang kết nối với tổng đài...');
  };

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
          <h1 className="text-lg font-semibold text-gray-900">HỖ TRỢ KHÁCH HÀNG</h1>
          <div className="w-9 h-9"></div>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="relative h-40 bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
        <img 
          src="https://pub-cdn.sider.ai/u/U0E5HLZKXNK/web-coder/68750791b1dac45b18d4a236/resource/1d3733cb-604d-460f-ae29-e827d733e9f2.jpg"
          alt="Customer Support"
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />
        <div className="relative z-10 text-center px-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <Headphones className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">QUÊN MẬT KHẨU?</h2>
          <p className="text-blue-100 text-sm">Liên hệ CSKH để được hỗ trợ ngay lập tức</p>
        </div>
      </div>

      <div className="px-4 py-6">
        {/* Main Support Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 -mt-6 relative z-10">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">BẢO MẬT TUYỆT ĐỐI</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Để đảm bảo an toàn tài khoản, việc khôi phục mật khẩu cần được xác thực qua đội ngũ bảo mật chuyên nghiệp của chúng tôi.
            </p>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 mb-6 border border-blue-200">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0">
                <HelpCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-blue-900 mb-1">Quy trình khôi phục mật khẩu</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Liên hệ CSKH qua hotline hoặc chat</li>
                  <li>• Cung cấp thông tin định danh</li>
                  <li>• Xác thực danh tính qua CMND/CCCD</li>
                  <li>• Nhận mật khẩu mới qua SMS bảo mật</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 text-center mb-4">Chọn hình thức liên hệ</h4>
            


            {/* Live Chat */}
            <button
              onClick={handleLiveChat}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-blue-100 text-sm">Tư vấn viên online</p>
                  <p className="text-blue-100 text-xs">Phản hồi trong 2 phút</p>
                </div>
                <div className="text-white/80">
                  <span className="text-xs">Tiện lợi</span>
                </div>
              </div>
            </button>

            {/* Email Support */}
            <button
              onClick={handleEmailContact}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white p-4 rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-md"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Mail className="w-6 h-6" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-purple-100 text-sm">support@v-green.com</p>
                  <p className="text-purple-100 text-xs">Phản hồi trong 1 giờ</p>
                </div>
                <div className="text-white/80">
                  <span className="text-xs">Chi tiết</span>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Working Hours */}
        <div className="mt-6 bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <h4 className="font-semibold text-gray-900">Giờ làm việc CSKH</h4>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Hotline 24/7:</span>
              <span className="font-medium text-gray-900">1900 123 456</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Chat trực tuyến:</span>
              <span className="font-medium text-gray-900">6:00 - 22:00</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Email hỗ trợ:</span>
              <span className="font-medium text-gray-900">24/7</span>
            </div>
          </div>
        </div>



        {/* Team Info */}
        <div className="mt-6 bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <h4 className="font-semibold text-gray-900">Đội ngũ hỗ trợ</h4>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">CS</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Chuyên viên CSKH</p>
                <p className="text-sm text-gray-600">Hỗ trợ tổng quát và khôi phục mật khẩu</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">ST</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Chuyên viên bảo mật</p>
                <p className="text-sm text-gray-600">Xác thực danh tính và bảo mật tài khoản</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">TC</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Chuyên viên kỹ thuật</p>
                <p className="text-sm text-gray-600">Xử lý sự cố kỹ thuật và hệ thống</p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-6 bg-white rounded-xl shadow-sm p-4">
          <h4 className="font-semibold text-gray-900 mb-3">Câu hỏi thường gặp</h4>
          
          <div className="space-y-3">
            <div className="border-l-4 border-blue-500 pl-4">
              <h5 className="font-medium text-gray-900 mb-1">Tôi cần chuẩn bị gì khi liên hệ CSKH?</h5>
              <p className="text-sm text-gray-600">Chuẩn bị CMND/CCCD, số điện thoại đăng ký và thông tin tài khoản cơ bản.</p>
            </div>
            
            <div className="border-l-4 border-green-500 pl-4">
              <h5 className="font-medium text-gray-900 mb-1">Mất bao lâu để khôi phục mật khẩu?</h5>
              <p className="text-sm text-gray-600">Thường chỉ mất 5-10 phút sau khi xác thực danh tính thành công.</p>
            </div>
            
            <div className="border-l-4 border-purple-500 pl-4">
              <h5 className="font-medium text-gray-900 mb-1">Có tốn phí gì không?</h5>
              <p className="text-sm text-gray-600">Hoàn toàn miễn phí. Chúng tôi hỗ trợ khách hàng 24/7 không thu phí.</p>
            </div>
          </div>
        </div>

        {/* Back to Login */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/login')}
            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            ← Quay lại đăng nhập
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
