/**
 * Referral Page - Trang giới thiệu bạn bè và xem thưởng
 */

import React, { useEffect, useState } from 'react';
import {
  ArrowLeft, Users, Gift, Trophy, Copy, Check, Share2,
  ChevronRight, Clock, DollarSign, TrendingUp, RefreshCw,
  User, Star
} from 'lucide-react';
import { useNavigate } from 'react-router';
import Header from '../components/Header';
import BottomNavigation from '../components/BottomNavigation';
import { useAuthStore } from '../stores/authStore';
import { useReferralStore } from '../stores/referralStore';
import { formatCurrency } from '../lib/format';

const Referral: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    stats,
    bonuses,
    loading,
    fetchStats,
    fetchBonuses,
    claimBonus,
    bonusPage,
    totalBonuses,
  } = useReferralStore();

  const [copied, setCopied] = useState(false);
  const [claimingBonusId, setClaimingBonusId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'bonuses' | 'friends'>('overview');

  useEffect(() => {
    fetchStats();
    fetchBonuses(1);
  }, []);

  const handleCopyCode = async () => {
    if (stats?.referralCode) {
      await navigator.clipboard.writeText(stats.referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    if (!stats?.referralCode) return;
    
    const shareText = `Đầu tư trạm sạc VinFast cùng V-GREEN! Mã giới thiệu của tôi: ${stats.referralCode}. Đăng ký ngay tại V-GREEN Platform!`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'V-GREEN Platform',
          text: shareText,
          url: window.location.origin,
        });
      } catch {
        // User cancelled or error
      }
    } else {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClaimBonus = async (bonusId: string) => {
    setClaimingBonusId(bonusId);
    const success = await claimBonus(bonusId);
    if (success) {
      // Refresh wallet or show success message
    }
    setClaimingBonusId(null);
  };

  const getBonusTypeLabel = (type: string) => {
    switch (type) {
      case 'signup': return 'Thưởng đăng ký';
      case 'first_investment': return 'Thưởng đầu tư';
      case 'milestone': return 'Thưởng mốc';
      default: return type;
    }
  };

  const getBonusTypeIcon = (type: string) => {
    switch (type) {
      case 'signup': return <User className="w-4 h-4" />;
      case 'first_investment': return <TrendingUp className="w-4 h-4" />;
      case 'milestone': return <Trophy className="w-4 h-4" />;
      default: return <Gift className="w-4 h-4" />;
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="px-4 py-4 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Quay lại</span>
          </button>
          <button
            onClick={() => { fetchStats(); fetchBonuses(1); }}
            className="p-2 text-gray-500 hover:text-green-600"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <h1 className="text-xl font-bold text-gray-900 mb-1">Giới thiệu bạn bè</h1>
        <p className="text-sm text-gray-500 mb-6">Chia sẻ mã và nhận thưởng khi bạn bè đăng ký & đầu tư</p>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {[
            { id: 'overview', label: 'Tổng quan', icon: TrendingUp },
            { id: 'bonuses', label: 'Thưởng', icon: Gift },
            { id: 'friends', label: 'Bạn bè', icon: Users },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-600 border'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.id === 'bonuses' && stats?.pendingCount && stats.pendingCount > 0 && (
                <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                  {stats.pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Referral Code Card */}
            <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl p-5 text-white">
              <div className="flex items-center gap-2 mb-3">
                <Star className="w-5 h-5 text-yellow-300" />
                <span className="text-sm text-green-100">Mã giới thiệu của bạn</span>
              </div>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl font-bold tracking-wider">
                  {stats?.referralCode || '...'}
                </span>
                <button
                  onClick={handleCopyCode}
                  className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                >
                  {copied ? (
                    <Check className="w-5 h-5 text-green-200" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCopyCode}
                  className="flex-1 py-2.5 bg-white text-green-700 rounded-xl font-medium hover:bg-green-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  {copied ? 'Đã sao chép!' : 'Sao chép mã'}
                </button>
                <button
                  onClick={handleShare}
                  className="flex-1 py-2.5 bg-white/20 text-white rounded-xl font-medium hover:bg-white/30 transition-colors flex items-center justify-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  Chia sẻ
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 text-blue-600" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats?.referralCount || 0}</p>
                <p className="text-xs text-gray-500">Người đã giới thiệu</p>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-yellow-600" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats?.totalEarnings || 0)}
                </p>
                <p className="text-xs text-gray-500">Tổng thưởng đã nhận</p>
              </div>
            </div>

            {/* Pending Bonuses */}
            {(stats?.pendingCount || 0) > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Gift className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 mb-1">
                      Bạn có {stats?.pendingCount} thưởng chờ nhận!
                    </p>
                    <p className="text-sm text-gray-600 mb-3">
                      Tổng cộng {formatCurrency(stats?.pendingAmount || 0)} VNĐ
                    </p>
                    <button
                      onClick={() => setActiveTab('bonuses')}
                      className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
                    >
                      Nhận thưởng ngay
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* How it works */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">Cách thức hoạt động</h3>
              <div className="space-y-4">
                {[
                  {
                    step: 1,
                    title: 'Chia sẻ mã giới thiệu',
                    desc: 'Gửi mã của bạn cho bạn bè qua tin nhắn hoặc mạng xã hội',
                    icon: Share2,
                    color: 'bg-green-100 text-green-600',
                  },
                  {
                    step: 2,
                    title: 'Bạn bè đăng ký',
                    desc: 'Khi bạn bè đăng ký với mã của bạn, bạn nhận 10,000 VNĐ',
                    icon: User,
                    color: 'bg-blue-100 text-blue-600',
                  },
                  {
                    step: 3,
                    title: 'Bạn bè đầu tư',
                    desc: 'Nhận 1% giá trị đầu tư (tối đa 500,000 VNĐ) + thưởng mốc',
                    icon: TrendingUp,
                    color: 'bg-yellow-100 text-yellow-600',
                  },
                  {
                    step: 4,
                    title: 'Nhận thưởng',
                    desc: 'Bonus sẽ được cộng vào ví sau khi bạn xác nhận nhận',
                    icon: Gift,
                    color: 'bg-purple-100 text-purple-600',
                  },
                ].map((item) => (
                  <div key={item.step} className="flex gap-3">
                    <div className={`w-10 h-10 ${item.color} rounded-full flex items-center justify-center flex-shrink-0`}>
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{item.title}</p>
                      <p className="text-xs text-gray-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Bonuses Tab */}
        {activeTab === 'bonuses' && (
          <div className="space-y-4">
            {/* Summary */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Tổng thưởng</p>
                  <p className="text-xl font-bold text-gray-900">
                    {formatCurrency(stats?.totalEarnings || 0)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Chờ nhận</p>
                  <p className="text-xl font-bold text-orange-600">
                    {formatCurrency(stats?.pendingAmount || 0)}
                  </p>
                </div>
              </div>
            </div>

            {/* Bonus List */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900">Lịch sử thưởng</h3>
              </div>

              {bonuses.length === 0 ? (
                <div className="p-8 text-center">
                  <Gift className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">Chưa có thưởng nào</p>
                  <p className="text-gray-400 text-xs mt-1">
                    Giới thiệu bạn bè để nhận thưởng!
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {bonuses.map((bonus) => (
                    <div key={bonus.id} className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          bonus.status === 'pending' ? 'bg-orange-100 text-orange-600' :
                          bonus.status === 'credited' ? 'bg-green-100 text-green-600' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {getBonusTypeIcon(bonus.bonus_type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-medium text-gray-900 text-sm">
                              {getBonusTypeLabel(bonus.bonus_type)}
                            </p>
                            <p className={`font-bold text-sm ${
                              bonus.status === 'pending' ? 'text-orange-600' :
                              bonus.status === 'credited' ? 'text-green-600' :
                              'text-gray-500'
                            }`}>
                              {formatCurrency(bonus.bonus_amount)}
                            </p>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {bonus.referred_user_name || bonus.referred_user_phone || 'N/A'}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {formatDate(bonus.created_at)}
                          </p>
                          {bonus.status === 'pending' && (
                            <div className="mt-2">
                              <button
                                onClick={() => handleClaimBonus(bonus.id)}
                                disabled={claimingBonusId === bonus.id}
                                className="px-3 py-1.5 bg-orange-500 text-white rounded-lg text-xs font-medium hover:bg-orange-600 disabled:opacity-50 transition-colors"
                              >
                                {claimingBonusId === bonus.id ? (
                                  'Đang xử lý...'
                                ) : (
                                  'Nhận thưởng'
                                )}
                              </button>
                            </div>
                          )}
                          {bonus.status === 'credited' && (
                            <div className="flex items-center gap-1 mt-1">
                              <Check className="w-3 h-3 text-green-500" />
                              <span className="text-xs text-green-600">Đã nhận</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalBonuses > 10 && (
                <div className="p-4 border-t border-gray-100 flex items-center justify-center gap-2">
                  <button
                    onClick={() => fetchBonuses(bonusPage - 1)}
                    disabled={bonusPage <= 1}
                    className="px-3 py-1 border rounded text-sm disabled:opacity-40"
                  >
                    ←
                  </button>
                  <span className="text-sm text-gray-500">
                    Trang {bonusPage} / {Math.ceil(totalBonuses / 10)}
                  </span>
                  <button
                    onClick={() => fetchBonuses(bonusPage + 1)}
                    disabled={bonusPage >= Math.ceil(totalBonuses / 10)}
                    className="px-3 py-1 border rounded text-sm disabled:opacity-40"
                  >
                    →
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Friends Tab */}
        {activeTab === 'friends' && (
          <div className="space-y-4">
            {/* Summary */}
            <div className="bg-white rounded-xl p-4 shadow-sm text-center">
              <p className="text-4xl font-bold text-green-600 mb-1">
                {stats?.referralCount || 0}
              </p>
              <p className="text-sm text-gray-500">Người bạn đã giới thiệu</p>
            </div>

            {/* Friends List */}
            {stats?.referredUsers && stats.referredUsers.length > 0 ? (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="divide-y divide-gray-100">
                  {stats.referredUsers.map((friend) => (
                    <div key={friend.id} className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-gray-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 text-sm">
                            {friend.full_name || friend.phone || 'N/A'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(friend.created_at)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-green-600 text-sm">
                            {formatCurrency(friend.total_bonus || 0)}
                          </p>
                          <p className="text-xs text-gray-400">
                            {friend.bonus_count || 0} thưởng
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl p-8 shadow-sm text-center">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">Chưa có người bạn nào</p>
                <p className="text-gray-400 text-xs mt-1">
                  Chia sẻ mã giới thiệu để nhận thưởng!
                </p>
                <button
                  onClick={handleShare}
                  className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                >
                  Chia sẻ ngay
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Referral;
