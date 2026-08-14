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
    <div className="min-h-screen bg-background">
      <Header />

      <div className="relative">
        <div className="absolute top-4 left-4 z-10">
          <button
            onClick={() => navigate('/')}
            className="bg-card/90 backdrop-blur-sm p-2 rounded-full shadow-elevated"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
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
          <div className="bg-card rounded-xl shadow-card p-4">
            <h2 className="text-sm font-semibold text-muted-foreground mb-1">Mã giới thiệu của bạn</h2>
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold text-primary">{user.referralCode}</span>
              <button
                onClick={() => navigator.clipboard.writeText(user.referralCode)}
                className="text-sm text-info hover:underline"
              >
                Sao chép
              </button>
            </div>
          </div>
        )}

        {/* Referral commission summary */}
        {user && (
          <div className="bg-gradient-to-br from-brand-primary-600 to-emerald-700 rounded-xl shadow p-5 text-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-semibold">{commissionCount} khoản hoa hồng đã nhận</h2>
                <p className="text-primary-foreground text-sm">Tổng hoa hồng giới thiệu</p>
              </div>
              <Wallet className="w-8 h-8 text-primary-foreground/80" />
            </div>
            <div className="text-3xl font-bold">{formatCurrency(totalCommission)}</div>
            <div className="mt-3 text-sm text-primary-foreground">
              {referrals.length} người được giới thiệu
            </div>
          </div>
        )}

        <div className="bg-card rounded-xl shadow-card p-4">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-amber-500" />
            Thưởng đặt lịch
          </h2>
          <div className="space-y-3">
            {packagesWithBonus.slice(0, 6).map((pkg) => (
              <div
                key={pkg.id}
                className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-warning-subtle transition-colors cursor-pointer"
                onClick={() => navigate('/investment')}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{pkg.name}</p>
                  <p className="text-xs text-muted-foreground">Kỳ hạn {pkg.investmentPeriod} ngày</p>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <p className="text-sm font-bold text-warning-strong">
                    +{formatCurrency(pkg.details!.schedulingBonus!)}
                  </p>
                  <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-xl shadow-card p-4">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
            <Star className="w-5 h-5 text-yellow-500" />
            Hoa hồng giới thiệu
          </h2>
          <div className="space-y-3">
            {referralBenefits.map((item) => (
              <div key={item.level} className="flex items-center gap-3 p-3 bg-background rounded-lg">
                <div className="w-10 h-10 bg-success-subtle rounded-full flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{item.level}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <span className="text-lg font-bold text-primary">{item.rate}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Referral list */}
        {user && (
          <div className="bg-card rounded-xl shadow-card p-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-info" />
              Danh sách người được giới thiệu
            </h2>
            {loadingReferrals ? (
              <p className="text-sm text-muted-foreground text-center py-4">Đang tải...</p>
            ) : referrals.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Bạn chưa có người giới thiệu nào. Chia sẻ mã giới thiệu để nhận hoa hồng ngay!
              </p>
            ) : (
              <div className="space-y-2">
                {referrals.map((r) => (
                  <div key={r.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-info-subtle rounded-full flex items-center justify-center">
                        <span className="text-info font-bold">{r.fullName.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{r.fullName}</p>
                        <p className="text-xs text-muted-foreground">{formatPhone(r.phone)}</p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      r.status === 'active' ? 'bg-success-subtle text-primary' : 'bg-muted text-muted-foreground'
                    }`}>
                      {new Date(r.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="bg-gradient-to-br from-brand-primary-600 to-brand-primary-700 rounded-xl p-6 text-white text-center">
          <h3 className="text-lg font-bold mb-2">Mời bạn bè, nhận thưởng</h3>
          <p className="text-primary-foreground text-sm mb-4">
            Chia sẻ mã giới thiệu và nhận hoa hồng khi bạn bè đầu tư thành công
          </p>
          {!user ? (
            <button
              onClick={() => navigate('/register')}
              className="bg-card text-primary px-6 py-2 rounded-lg font-semibold hover:bg-success-subtle"
            >
              Đăng ký ngay
            </button>
          ) : (
            <button
              onClick={() => navigator.clipboard.writeText(`Đăng ký V-GREEN với mã giới thiệu ${user.referralCode}`)}
              className="bg-card text-primary px-6 py-2 rounded-lg font-semibold hover:bg-success-subtle"
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
