/**
 * Trang chủ - Landing page với thông tin tổng quan và các gói đầu tư nổi bật
 */

import React, { useEffect } from 'react';
import { ArrowRight, TrendingUp, Shield, Zap, Users, Star } from 'lucide-react';
import { useNavigate } from 'react-router';
import Header from '../components/Header';
import BottomNavigation from '../components/BottomNavigation';
import InvestmentCard from '../components/InvestmentCard';
import { useAuthStore } from '../stores/authStore';
import { usePackageStore } from '../stores/packageStore';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const packages = usePackageStore((s) => s.packages);
  const loadPackages = usePackageStore((s) => s.load);

  useEffect(() => {
    loadPackages();
  }, [loadPackages]);

  const featuredPackages = packages
    .filter(pkg => pkg.status === 'active')
    .slice(0, 3);

  const stats = [
    { label: 'Tổng người dùng', value: '50,000+', icon: <Users className="w-5 h-5" /> },
    { label: 'Trạm sạc VinFast', value: '1,000+', icon: <Zap className="w-5 h-5" /> },
    { label: 'Quỹ đầu tư', value: '2.5 tỷ $', icon: <TrendingUp className="w-5 h-5" /> },
    { label: 'Đánh giá', value: '4.9/5.0', icon: <Star className="w-5 h-5" /> },
  ];

  const benefits = [
    { title: 'Lợi nhuận cao', desc: 'Lên đến 2.2%/ngày', icon: '💰' },
    { title: 'An toàn tuyệt đối', desc: 'Bảo hiểm 100% vốn', icon: '🛡️' },
    { title: 'Rút tiền linh hoạt', desc: 'Nhanh chóng trong 24h', icon: '⚡' },
    { title: 'Hỗ trợ 24/7', desc: 'Đội ngũ chuyên nghiệp', icon: '🎧' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-green-600 via-green-700 to-green-800 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 py-16 md:py-24">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm mb-6">
              <Zap className="w-4 h-4 text-yellow-300" />
              <span>Quỹ đầu tư trạm sạc VinFast chính thức</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-4">
              Đầu tư tương lai xanh,
              <br />
              <span className="text-green-300">Sinh lời bền vững</span>
            </h1>
            <p className="text-green-100 text-lg mb-8 max-w-lg">
              Tham gia cùng hàng nghìn nhà đầu tư thông minh, góp phần phát triển hệ thống trạm sạc xe điện VinFast toàn cầu.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => navigate('/investment')}
                className="bg-white text-green-700 px-6 py-3 rounded-xl font-semibold hover:bg-green-50 transition-colors flex items-center gap-2"
              >
                Khám phá gói đầu tư
                <ArrowRight className="w-5 h-5" />
              </button>
              {!isAuthenticated && (
                <button
                  onClick={() => navigate('/register')}
                  className="bg-white/10 backdrop-blur-sm text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/20 transition-colors border border-white/20"
                >
                  Đăng ký miễn phí
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 pb-24 -mt-6">
        {/* Stats */}
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-4 text-center">
              <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-2 text-green-600">
                {stat.icon}
              </div>
              <div className="text-xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Benefits */}
        <div className="max-w-6xl mx-auto mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Tại sao chọn V-GREEN?</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {benefits.map((b, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm p-4">
                <div className="text-2xl mb-2">{b.icon}</div>
                <h3 className="font-semibold text-gray-900 text-sm mb-1">{b.title}</h3>
                <p className="text-xs text-gray-500">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Featured Investment Packages */}
        <div className="max-w-6xl mx-auto mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Gói đầu tư nổi bật</h2>
              <p className="text-sm text-gray-500">Lựa chọn tốt nhất cho nhà đầu tư</p>
            </div>
            <button
              onClick={() => navigate('/investment')}
              className="text-green-600 text-sm font-medium hover:underline flex items-center gap-1"
            >
              Xem tất cả <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {featuredPackages.map((pkg) => (
              <div
                key={pkg.id}
                onClick={() => navigate('/investment')}
                className="cursor-pointer"
              >
                <InvestmentCard
                  pkg={{
                    id: pkg.id,
                    code: pkg.name.match(/\(([^)]+)\)/)?.[1] || pkg.type,
                    name: pkg.name,
                    amount: pkg.investmentAmount,
                    duration: `${pkg.investmentPeriod} ngày`,
                    progress: Math.min(100, pkg.progress),
                    status: 'Đang hoạt động',
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* CTA Banner */}
        <div className="max-w-6xl mx-auto">
          <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl p-6 md:p-8 text-white text-center">
            <h2 className="text-xl md:text-2xl font-bold mb-2">
              Bắt đầu đầu tư ngay hôm nay
            </h2>
            <p className="text-green-100 text-sm mb-4 max-w-md mx-auto">
              Đăng ký tài khoản miễn phí và nhận thưởng đặt lịch lên đến hàng tỷ đồng
            </p>
            {!isAuthenticated ? (
              <div className="flex flex-wrap justify-center gap-3">
                <button
                  onClick={() => navigate('/register')}
                  className="bg-white text-green-700 px-6 py-3 rounded-xl font-semibold hover:bg-green-50 transition-colors"
                >
                  Đăng ký ngay
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="bg-white/10 backdrop-blur-sm text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/20 transition-colors border border-white/20"
                >
                  Đăng nhập
                </button>
              </div>
            ) : (
              <button
                onClick={() => navigate('/investment')}
                className="bg-white text-green-700 px-6 py-3 rounded-xl font-semibold hover:bg-green-50 transition-colors flex items-center gap-2 mx-auto"
              >
                Đầu tư ngay <ArrowRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Home;
