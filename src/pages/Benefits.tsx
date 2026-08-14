/**
 * Trang phúc lợi và thưởng đầu tư
 */

import React from 'react';
import { ArrowLeft, Gift, Calendar, TrendingUp, Star, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router';
import Header from '../components/Header';
import BottomNavigation from '../components/BottomNavigation';
import { investmentPackages } from '../data/investmentPackages';
import { formatCurrency } from '../lib/format';
import { useAuthStore } from '../stores/authStore';

const Benefits: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const packagesWithBonus = investmentPackages.filter((pkg) => pkg.details?.schedulingBonus);

  const referralBenefits = [
    { level: 'Cấp 1', rate: '5%', desc: 'Hoa hồng từ người được giới thiệu trực tiếp' },
    { level: 'Cấp 2', rate: '2%', desc: 'Hoa hồng từ cấp dưới thứ hai' },
    { level: 'Cấp 3', rate: '1%', desc: 'Hoa hồng từ cấp dưới thứ ba' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="relative">
        <div className="absolute top-4 left-4 z-10">
          <button
            onClick={() => navigate('/')}
            className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        <div className="relative h-40 bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
          <div className="relative z-10 text-center px-4">
            <Gift className="w-10 h-10 text-white mx-auto mb-2" />
            <h1 className="text-2xl font-bold text-white">Phúc lợi & Thưởng</h1>
            <p className="text-amber-100 text-sm">Ưu đãi dành cho nhà đầu tư V-GREEN</p>
          </div>
        </div>
      </div>

      <div className="px-4 pb-24 -mt-6 relative z-10 space-y-6">
        {user && (
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h2 className="text-sm font-semibold text-gray-500 mb-1">Mã giới thiệu của bạn</h2>
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold text-green-600">{user.referralCode}</span>
              <button
                onClick={() => navigator.clipboard.writeText(user.referralCode)}
                className="text-sm text-blue-600 hover:underline"
              >
                Sao chép
              </button>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm p-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-amber-500" />
            Thưởng đặt lịch
          </h2>
          <div className="space-y-3">
            {packagesWithBonus.slice(0, 6).map((pkg) => (
              <div
                key={pkg.id}
                className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-amber-50 transition-colors cursor-pointer"
                onClick={() => navigate('/investment')}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{pkg.name}</p>
                  <p className="text-xs text-gray-500">Kỳ hạn {pkg.investmentPeriod} ngày</p>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <p className="text-sm font-bold text-amber-600">
                    +{formatCurrency(pkg.details!.schedulingBonus!)}
                  </p>
                  <ChevronRight className="w-4 h-4 text-gray-400 ml-auto" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
            <Star className="w-5 h-5 text-yellow-500" />
            Hoa hồng giới thiệu
          </h2>
          <div className="space-y-3">
            {referralBenefits.map((item) => (
              <div key={item.level} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{item.level}</p>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
                <span className="text-lg font-bold text-green-600">{item.rate}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-6 text-white text-center">
          <h3 className="text-lg font-bold mb-2">Mời bạn bè, nhận thưởng</h3>
          <p className="text-green-100 text-sm mb-4">
            Chia sẻ mã giới thiệu và nhận hoa hồng khi bạn bè đầu tư thành công
          </p>
          {!user ? (
            <button
              onClick={() => navigate('/register')}
              className="bg-white text-green-600 px-6 py-2 rounded-lg font-semibold hover:bg-green-50"
            >
              Đăng ký ngay
            </button>
          ) : (
            <button
              onClick={() => navigate('/investment')}
              className="bg-white text-green-600 px-6 py-2 rounded-lg font-semibold hover:bg-green-50"
            >
              Bắt đầu đầu tư
            </button>
          )}
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Benefits;
