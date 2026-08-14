/**
 * Trang phúc lợi và thưởng đầu tư
 */

import React, { useEffect, useState } from 'react';
import { ArrowLeft, Gift, Calendar, TrendingUp, Star, ChevronRight, Users, Wallet } from 'lucide-react';
import { useNavigate } from 'react-router';
import Header from '../components/Header';
import BottomNavigation from '../components/BottomNavigation';
import { formatCurrency } from '../lib/format';
import { useAuthStore } from '../stores/authStore';
import { usePackageStore } from '../stores/packageStore';
import { authApi } from '../lib/api';

const Benefits: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const packages = usePackageStore((s) => s.packages);
  const loadPackages = usePackageStore((s) => s.load);

  const [referrals, setReferrals] = useState<any[]>([]);
  const [totalCommission, setTotalCommission] = useState(0);
  const [commissionCount, setCommissionCount] = useState(0);
  const [loadingReferrals, setLoadingReferrals] = useState(false);

  useEffect(() => {
    loadPackages();
  }, [loadPackages]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setLoadingReferrals(true);
    authApi
      .getReferrals()
      .then((data) => {
        if (cancelled) return;
        setReferrals(data.referred || []);
        setTotalCommission(data.totalCommission || 0);
        setCommissionCount(data.commissionCount || 0);
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoadingReferrals(false); });
    return () => { cancelled = true; };
  }, [user]);

  const packagesWithBonus = packages.filter((pkg) => pkg.details?.schedulingBonus);

  const referralBenefits = [
    { level: 'Cấp 1', rate: '5%', desc: 'Hoa hồng từ người được giới thiệu trực tiếp' },
    { level: 'Cấp 2', rate: '2%', desc: 'Hoa hồng từ cấp dưới thứ hai' },
    { level: 'Cấp 3', rate: '1%', desc: 'Hoa hồng từ cấp dưới thứ ba' },
  ];

  const formatPhone = (phone: string) => {
    if (!phone) return '';
    return phone.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3');
  };

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

        {/* Referral commission summary */}
        {user && (
          <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-xl shadow p-5 text-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-semibold">{commissionCount} khoản hoa hồng đã nhận</h2>
                <p className="text-green-100 text-sm">Tổng hoa hồng giới thiệu</p>
              </div>
              <Wallet className="w-8 h-8 text-green-200" />
            </div>
            <div className="text-3xl font-bold">{formatCurrency(totalCommission)}</div>
            <div className="mt-3 text-sm text-green-100">
              {referrals.length} người được giới thiệu
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

        {/* Referral list */}
        {user && (
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-blue-600" />
              Danh sách người được giới thiệu
            </h2>
            {loadingReferrals ? (
              <p className="text-sm text-gray-400 text-center py-4">Đang tải...</p>
            ) : referrals.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">
                Bạn chưa có người giới thiệu nào. Chia sẻ mã giới thiệu để nhận hoa hồng ngay!
              </p>
            ) : (
              <div className="space-y-2">
                {referrals.map((r) => (
                  <div key={r.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-bold">{r.fullName.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{r.fullName}</p>
                        <p className="text-xs text-gray-500">{formatPhone(r.phone)}</p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      r.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {new Date(r.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

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
              onClick={() => navigator.clipboard.writeText(`Đăng ký V-GREEN với mã giới thiệu ${user.referralCode}`)}
              className="bg-white text-green-600 px-6 py-2 rounded-lg font-semibold hover:bg-green-50"
            >
              Sao chép link giới thiệu
            </button>
          )}
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Benefits;
