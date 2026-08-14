/**
 * Customer Service Contact page for password recovery
 * Đã tinh chỉnh: design token (bg-background, text-foreground, semantic colors),
 * gradient hero V-GREEN (thay vì blue), thêm SecurityShield icon với animation.
 */

import React from 'react';
import { ArrowLeft, Phone, MessageCircle, Mail, Clock, HelpCircle, Shield, Users, Headphones, Lock } from 'lucide-react';
import { useNavigate } from 'react-router';
import { LogoVGreen } from '../components/ui/illustrations';

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();

  const handlePhoneCall = () => {
    window.location.href = 'tel:1900123456';
  };

  const handleEmailContact = () => {
    window.location.href = 'mailto:support@v-green.com';
  };

  const handleLiveChat = () => {
    alert('Đang kết nối với tổng đài...');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border relative">
        <div className="flex items-center justify-between p-4 max-w-6xl mx-auto">
          <button
            onClick={() => navigate('/login')}
            className="p-2 hover:bg-muted rounded-full transition-colors"
            aria-label="Quay lại"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-base md:text-lg font-semibold text-foreground tracking-wide">HỖ TRỢ KHÁCH HÀNG</h1>
          <div className="w-9 h-9" />
        </div>
      </div>

      {/* Hero Banner */}
      <div className="relative h-44 bg-gradient-hero flex items-center justify-center overflow-hidden">
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-card/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-brand-accent-400/30 blur-3xl pointer-events-none" />

        <div className="relative z-10 text-center px-4 flex flex-col items-center">
          <div className="w-16 h-16 bg-card/20 backdrop-blur-md rounded-full flex items-center justify-center mb-3 border border-white/30 animate-float">
            <Headphones className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white mb-2 tracking-tight">QUÊN MẬT KHẨU?</h2>
          <p className="text-white/90 text-sm">Liên hệ CSKH để được hỗ trợ ngay lập tức</p>
        </div>
      </div>

      <div className="px-4 py-6 max-w-6xl mx-auto">
        {/* Main Support Card */}
        <div className="bg-card rounded-2xl shadow-card border border-border p-6 -mt-8 relative z-10">
          <div className="text-center mb-6">
            <div className="relative w-20 h-20 mx-auto mb-4">
              <div className="absolute inset-0 bg-gradient-to-br from-success to-brand-primary-600 rounded-full" />
              <div className="absolute inset-0 bg-success/40 rounded-full blur-xl animate-pulse-slow" />
              <div className="relative w-20 h-20 bg-gradient-to-br from-success to-brand-primary-700 rounded-full flex items-center justify-center shadow-glow">
                <Shield className="w-10 h-10 text-white" />
                {/* Lock open indicator */}
                <Lock className="w-3 h-3 text-warning-strong absolute -bottom-1 -right-1 rotate-12" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">BẢO MẬT TUYỆT ĐỐI</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Để đảm bảo an toàn tài khoản, việc khôi phục mật khẩu cần được xác thực qua đội ngũ bảo mật chuyên nghiệp của chúng tôi.
            </p>
          </div>

          <div className="bg-info-subtle rounded-xl p-4 mb-6 border border-info/20">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-info/20 rounded-full flex items-center justify-center flex-shrink-0">
                <HelpCircle className="w-5 h-5 text-info" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-info-strong mb-1">Quy trình khôi phục mật khẩu</h4>
                <ul className="text-sm text-info-strong/80 space-y-1">
                  <li>• Liên hệ CSKH qua hotline hoặc chat</li>
                  <li>• Cung cấp thông tin định danh</li>
                  <li>• Xác thực danh tính qua CMND/CCCD</li>
                  <li>• Nhận mật khẩu mới qua SMS bảo mật</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-foreground text-center mb-4">Chọn hình thức liên hệ</h4>

            {/* Live Chat */}
            <button
              onClick={handleLiveChat}
              className="w-full bg-gradient-primary text-primary-foreground p-4 rounded-xl hover:shadow-glow transition-all shadow-card group"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-card/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold">Tư vấn viên online</p>
                  <p className="text-white/80 text-xs">Phản hồi trong 2 phút</p>
                </div>
                <div className="text-white/80">
                  <span className="text-xs font-medium px-2 py-1 bg-card/20 rounded-full">Tiện lợi</span>
                </div>
              </div>
            </button>

            {/* Email Support */}
            <button
              onClick={handleEmailContact}
              className="w-full bg-gradient-to-r from-brand-accent-600 to-brand-accent-700 text-white p-4 rounded-xl hover:shadow-glow transition-all shadow-card group"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-card/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Mail className="w-6 h-6" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold">support@v-green.com</p>
                  <p className="text-white/80 text-xs">Phản hồi trong 1 giờ</p>
                </div>
                <div className="text-white/80">
                  <span className="text-xs font-medium px-2 py-1 bg-card/20 rounded-full">Chi tiết</span>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Working Hours */}
        <div className="mt-6 bg-card rounded-xl shadow-card border border-border p-4">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-warning-subtle rounded-full flex items-center justify-center">
              <Clock className="w-5 h-5 text-warning-strong" />
            </div>
            <h4 className="font-semibold text-foreground">Giờ làm việc CSKH</h4>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Hotline 24/7:</span>
              <span className="font-medium text-foreground">1900 123 456</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Chat trực tuyến:</span>
              <span className="font-medium text-foreground">6:00 - 22:00</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email hỗ trợ:</span>
              <span className="font-medium text-foreground">24/7</span>
            </div>
          </div>
        </div>

        {/* Team Info */}
        <div className="mt-6 bg-card rounded-xl shadow-card border border-border p-4">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-info-subtle rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-info" />
            </div>
            <h4 className="font-semibold text-foreground">Đội ngũ hỗ trợ</h4>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center shadow-glow">
                <span className="text-primary-foreground font-medium text-sm">CS</span>
              </div>
              <div>
                <p className="font-medium text-foreground">Chuyên viên CSKH</p>
                <p className="text-sm text-muted-foreground">Hỗ trợ tổng quát và khôi phục mật khẩu</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-success to-brand-primary-700 rounded-full flex items-center justify-center shadow-glow">
                <span className="text-white font-medium text-sm">ST</span>
              </div>
              <div>
                <p className="font-medium text-foreground">Chuyên viên bảo mật</p>
                <p className="text-sm text-muted-foreground">Xác thực danh tính và bảo mật tài khoản</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-brand-accent-500 to-brand-accent-700 rounded-full flex items-center justify-center shadow-glow">
                <span className="text-white font-medium text-sm">TC</span>
              </div>
              <div>
                <p className="font-medium text-foreground">Chuyên viên kỹ thuật</p>
                <p className="text-sm text-muted-foreground">Xử lý sự cố kỹ thuật và hệ thống</p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-6 bg-card rounded-xl shadow-card border border-border p-4">
          <h4 className="font-semibold text-foreground mb-3">Câu hỏi thường gặp</h4>

          <div className="space-y-3">
            <div className="border-l-4 border-primary pl-4">
              <h5 className="font-medium text-foreground mb-1">Tôi cần chuẩn bị gì khi liên hệ CSKH?</h5>
              <p className="text-sm text-muted-foreground">Chuẩn bị CMND/CCCD, số điện thoại đăng ký và thông tin tài khoản cơ bản.</p>
            </div>

            <div className="border-l-4 border-success pl-4">
              <h5 className="font-medium text-foreground mb-1">Mất bao lâu để khôi phục mật khẩu?</h5>
              <p className="text-sm text-muted-foreground">Thường chỉ mất 5-10 phút sau khi xác thực danh tính thành công.</p>
            </div>

            <div className="border-l-4 border-info pl-4">
              <h5 className="font-medium text-foreground mb-1">Có tốn phí gì không?</h5>
              <p className="text-sm text-muted-foreground">Hoàn toàn miễn phí. Chúng tôi hỗ trợ khách hàng 24/7 không thu phí.</p>
            </div>
          </div>
        </div>

        {/* Back to Login + V-GREEN brand footer */}
        <div className="mt-8 flex flex-col items-center gap-3">
          <button
            onClick={() => navigate('/login')}
            className="text-primary hover:text-primary/80 font-medium text-sm transition-colors"
          >
            ← Quay lại đăng nhập
          </button>
          <div className="text-xs text-muted-foreground">
            Được bảo trợ bởi
          </div>
          <LogoVGreen variant="full" />
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;