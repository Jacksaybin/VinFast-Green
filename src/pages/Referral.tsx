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
import { useTranslation } from 'react-i18next';
import Header from '../components/Header';
import BottomNavigation from '../components/BottomNavigation';
import { useAuthStore } from '../stores/authStore';
import { useReferralStore } from '../stores/referralStore';
import { formatCurrency } from '../lib/format';

const Referral: React.FC = () => {
  const { t, i18n } = useTranslation();
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

    const shareText = t('referral.shareText', { code: stats.referralCode });

    if (navigator.share) {
      try {
        await navigator.share({
          title: t('referral.shareTitle'),
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
    await claimBonus(bonusId);
    setClaimingBonusId(null);
  };

  const getBonusTypeLabel = (type: string) => {
    const keyMap: Record<string, string> = {
      signup: 'referral.bonusSignup',
      first_investment: 'referral.bonusFirstInvestment',
      milestone: 'referral.bonusMilestone',
    };
    return keyMap[type] ? t(keyMap[type]) : type;
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
    const locale = i18n.language === 'en' ? 'en-US' : 'vi-VN';
    return new Date(dateStr).toLocaleDateString(locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="px-4 py-4 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>{t('common.back')}</span>
          </button>
          <button
            onClick={() => { fetchStats(); fetchBonuses(1); }}
            className="p-2 text-muted-foreground hover:text-primary"
            aria-label={t('common.refresh')}
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <h1 className="text-xl font-bold text-foreground mb-1">{t('referral.title')}</h1>
        <p className="text-sm text-muted-foreground mb-6">{t('referral.subtitle')}</p>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {[
            { id: 'overview', label: t('referral.tabOverview'), icon: TrendingUp },
            { id: 'bonuses', label: t('referral.tabBonuses'), icon: Gift },
            { id: 'friends', label: t('referral.tabFriends'), icon: Users },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary text-white'
                  : 'bg-card text-muted-foreground border'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.id === 'bonuses' && stats?.pendingCount && stats.pendingCount > 0 && (
                <span className="bg-danger text-white text-[10px] px-1.5 py-0.5 rounded-full">
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
            <div className="bg-gradient-to-br from-brand-primary-600 to-brand-primary-700 rounded-2xl p-5 text-white">
              <div className="flex items-center gap-2 mb-3">
                <Star className="w-5 h-5 text-warning-strong" />
                <span className="text-sm text-primary-foreground">{t('referral.yourCode')}</span>
              </div>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl font-bold tracking-wider">
                  {stats?.referralCode || '...'}
                </span>
                <button
                  onClick={handleCopyCode}
                  className="p-2 bg-card/20 rounded-lg hover:bg-card/30 transition-colors"
                  aria-label={t('referral.copyCode')}
                >
                  {copied ? (
                    <Check className="w-5 h-5 text-primary-foreground/80" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCopyCode}
                  className="flex-1 py-2.5 bg-card text-primary rounded-xl font-medium hover:bg-success-subtle transition-colors flex items-center justify-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  {copied ? t('referral.copied') : t('referral.copyCode')}
                </button>
                <button
                  onClick={handleShare}
                  className="flex-1 py-2.5 bg-card/20 text-white rounded-xl font-medium hover:bg-card/30 transition-colors flex items-center justify-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  {t('referral.share')}
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-card rounded-xl p-4 shadow-card">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-info-subtle rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 text-info" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-foreground">{stats?.referralCount || 0}</p>
                <p className="text-xs text-muted-foreground">{t('referral.referredCount')}</p>
              </div>

              <div className="bg-card rounded-xl p-4 shadow-card">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-warning-subtle rounded-full flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-warning-strong" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {formatCurrency(stats?.totalEarnings || 0)}
                </p>
                <p className="text-xs text-muted-foreground">{t('referral.totalEarnings')}</p>
              </div>
            </div>

            {/* Pending Bonuses */}
            {(stats?.pendingCount || 0) > 0 && (
              <div className="bg-warning-subtle border border-warning/30 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-warning-subtle rounded-full flex items-center justify-center flex-shrink-0">
                    <Gift className="w-5 h-5 text-warning-strong" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground mb-1">
                      {t('referral.pendingBonusCount', { count: stats?.pendingCount })}
                    </p>
                    <p className="text-sm text-muted-foreground mb-3">
                      {t('referral.pendingBonusAmount', { amount: formatCurrency(stats?.pendingAmount || 0) })}
                    </p>
                    <button
                      onClick={() => setActiveTab('bonuses')}
                      className="rounded-lg bg-gradient-warning px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:shadow-glow"
                    >
                      {t('referral.claimNow')}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* How it works */}
            <div className="bg-card rounded-xl p-4 shadow-card">
              <h3 className="font-semibold text-foreground mb-4">{t('referral.howItWorks')}</h3>
              <div className="space-y-4">
                {[
                  { step: 1, title: t('referral.step1Title'), desc: t('referral.step1Desc'), icon: Share2, color: 'bg-success-subtle text-primary' },
                  { step: 2, title: t('referral.step2Title'), desc: t('referral.step2Desc'), icon: User, color: 'bg-info-subtle text-info' },
                  { step: 3, title: t('referral.step3Title'), desc: t('referral.step3Desc'), icon: TrendingUp, color: 'bg-warning-subtle text-warning-strong' },
                  { step: 4, title: t('referral.step4Title'), desc: t('referral.step4Desc'), icon: Gift, color: 'bg-primary/10 text-primary' },
                ].map((item) => (
                  <div key={item.step} className="flex gap-3">
                    <div className={`w-10 h-10 ${item.color} rounded-full flex items-center justify-center flex-shrink-0`}>
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-sm">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
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
            <div className="bg-card rounded-xl p-4 shadow-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t('referral.totalBonus')}</p>
                  <p className="text-xl font-bold text-foreground">
                    {formatCurrency(stats?.totalEarnings || 0)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">{t('referral.pending')}</p>
                  <p className="text-xl font-bold text-warning-strong">
                    {formatCurrency(stats?.pendingAmount || 0)}
                  </p>
                </div>
              </div>
            </div>

            {/* Bonus List */}
            <div className="bg-card rounded-xl shadow-card overflow-hidden">
              <div className="p-4 border-b border-border">
                <h3 className="font-semibold text-foreground">{t('referral.bonusHistory')}</h3>
              </div>

              {bonuses.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-warning-subtle text-warning-strong">
                    <Gift className="h-7 w-7" />
                  </div>
                  <p className="font-medium text-foreground">{t('referral.noBonusesYet')}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t('referral.inviteToEarn')}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {bonuses.map((bonus) => (
                    <div key={bonus.id} className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          bonus.status === 'pending' ? 'bg-warning-subtle text-warning-strong' :
                          bonus.status === 'credited' ? 'bg-success-subtle text-primary' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {getBonusTypeIcon(bonus.bonus_type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-medium text-foreground text-sm">
                              {getBonusTypeLabel(bonus.bonus_type)}
                            </p>
                            <p className={`font-bold text-sm ${
                              bonus.status === 'pending' ? 'text-warning-strong' :
                              bonus.status === 'credited' ? 'text-primary' :
                              'text-muted-foreground'
                            }`}>
                              {formatCurrency(bonus.bonus_amount)}
                            </p>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {bonus.referred_user_name || bonus.referred_user_phone || 'N/A'}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {formatDate(bonus.created_at)}
                          </p>
                          {bonus.status === 'pending' && (
                            <div className="mt-2">
                              <button
                                onClick={() => handleClaimBonus(bonus.id)}
                                disabled={claimingBonusId === bonus.id}
                                className="rounded-lg bg-gradient-warning px-3 py-1.5 text-xs font-medium text-primary-foreground shadow-sm transition-all hover:shadow-glow disabled:opacity-50"
                              >
                                {claimingBonusId === bonus.id ? t('common.processing') : t('referral.claim')}
                              </button>
                            </div>
                          )}
                          {bonus.status === 'credited' && (
                            <div className="flex items-center gap-1 mt-1">
                              <Check className="w-3 h-3 text-success-strong" />
                              <span className="text-xs text-success-strong">{t('referral.claimed')}</span>
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
                <div className="p-4 border-t border-border flex items-center justify-center gap-2">
                  <button
                    onClick={() => fetchBonuses(bonusPage - 1)}
                    disabled={bonusPage <= 1}
                    className="px-3 py-1 border border-border rounded text-sm disabled:opacity-40"
                  >
                    ←
                  </button>
                  <span className="text-sm text-muted-foreground">
                    {t('referral.pageInfo', { page: bonusPage, total: Math.ceil(totalBonuses / 10) })}
                  </span>
                  <button
                    onClick={() => fetchBonuses(bonusPage + 1)}
                    disabled={bonusPage >= Math.ceil(totalBonuses / 10)}
                    className="px-3 py-1 border border-border rounded text-sm disabled:opacity-40"
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
            <div className="bg-card rounded-xl p-4 shadow-card text-center">
              <p className="text-4xl font-bold text-primary mb-1">
                {stats?.referralCount || 0}
              </p>
              <p className="text-sm text-muted-foreground">{t('referral.friendsReferred')}</p>
            </div>

            {/* Friends List */}
            {stats?.referredUsers && stats.referredUsers.length > 0 ? (
              <div className="bg-card rounded-xl shadow-card overflow-hidden">
                <div className="divide-y divide-border">
                  {stats.referredUsers.map((friend) => (
                    <div key={friend.id} className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground text-sm">
                            {friend.full_name || friend.phone || 'N/A'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(friend.created_at)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-primary text-sm">
                            {formatCurrency(friend.total_bonus || 0)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {t('referral.bonusUnit', { count: friend.bonus_count || 0 })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-card rounded-xl p-8 shadow-card text-center">
                <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-info-subtle text-info">
                  <Users className="h-7 w-7" />
                </div>
                <p className="font-medium text-foreground">{t('referral.noFriendsYet')}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t('referral.shareToEarn')}
                </p>
                <button
                  onClick={handleShare}
                  className="mt-4 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary transition-colors"
                >
                  {t('referral.shareNow')}
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
