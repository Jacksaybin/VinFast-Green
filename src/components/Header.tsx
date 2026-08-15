/**
 * Header component - Top navigation bar with logo, search, user actions and real notifications
 * Đã tinh chỉnh: Logo SVG V-GREEN + focus-visible ring, brand token (brand-primary-*)
 * cho search focus, notif highlight và avatar gradient brand, dark-mode friendly.
 */

import React, { useEffect, useState } from 'react';
import { Search, Bell, User, ChevronDown, Menu, X, LogOut, Users, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../stores/authStore';
import { useNotificationStore } from '../stores/notificationStore';
import { formatDate } from '../lib/format';
import { LogoVGreen } from './ui/illustrations';
import LanguageSwitcher from './ui/LanguageSwitcher';
import { AvatarInitials } from './ui/AvatarInitials';

const Header: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const { user, isAuthenticated, logout } = useAuthStore();
  const { getUserNotifications, getUnreadCount, markAsRead, refresh } = useNotificationStore();

  // Poll notifications when authenticated (catches admin reply, deposit approval, etc.)
  useEffect(() => {
    if (!isAuthenticated || !user) return;
    refresh();
    const id = setInterval(() => refresh(), 30_000);
    return () => clearInterval(id);
  }, [isAuthenticated, user, refresh]);

  const notifications = user ? getUserNotifications(user.id) : [];
  const unreadCount = user ? getUnreadCount(user.id) : 0;

  const handleLogout = () => {
    logout();
    setShowUserDropdown(false);
    navigate('/login');
  };

  const handleProfile = () => {
    setShowUserDropdown(false);
    navigate('/my-account');
  };

  const handleNotifClick = (notifId: string, link?: string) => {
    markAsRead(notifId);
    setShowNotifDropdown(false);
    if (link) navigate(link);
  };

  return (
    <header className="glass-card sticky top-0 z-40 border-b border-border">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo and Mobile Menu */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
              aria-label={showMobileMenu ? t('header.closeMenu') : t('header.openMenu')}
            >
              {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div
              className="cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary-500 rounded-md"
              onClick={() => navigate('/')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  navigate('/');
                }
              }}
            >
              <LogoVGreen variant="full" theme="auto" />
            </div>
          </div>

          {/* Search Bar - Hidden on mobile */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchTerm.trim()) {
                    navigate(`/news?q=${encodeURIComponent(searchTerm.trim())}`);
                  }
                }}
                placeholder={t('header.searchPlaceholder')}
                className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Language Switcher */}
          <LanguageSwitcher variant="compact" className="hidden sm:inline-flex" />

          {/* User Actions */}
          <div className="flex items-center space-x-2">
            {/* Notification Bell */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => {
                    setShowNotifDropdown(!showNotifDropdown);
                    setShowUserDropdown(false);
                  }}
                  className="p-2 rounded-lg hover:bg-muted transition-colors relative"
                  aria-label={t('header.notifications')}
                >
                  <Bell className="w-5 h-5 text-muted-foreground" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-danger rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-sm">
                      {unreadCount > 9 ? t('header.unreadBadge') : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown */}
                {showNotifDropdown && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowNotifDropdown(false)}
                    />
                    <div className="absolute right-0 mt-2 w-80 glass-card rounded-xl shadow-elevated z-50 max-h-96 overflow-hidden flex flex-col animate-slide-down">
                      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                        <h3 className="font-semibold text-foreground">{t('header.notifications')}</h3>
                        {unreadCount > 0 && (
                          <span className="text-xs text-brand-primary-600 dark:text-brand-primary-400 font-medium">
                            {t('header.unreadCount', { count: unreadCount })}
                          </span>
                        )}
                      </div>
                      <div className="overflow-y-auto flex-1 max-h-72 scrollbar-thin">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center text-muted-foreground text-sm">
                            {t('header.noNotifications')}
                          </div>
                        ) : (
                          notifications.slice(0, 10).map((notif) => (
                            <button
                              key={notif.id}
                              onClick={() => handleNotifClick(notif.id, notif.link)}
                              className={`w-full text-left px-4 py-3 border-b border-border/50 hover:bg-muted transition-colors ${
                                !notif.read ? 'bg-brand-primary-500/5' : ''
                              }`}
                            >
                              <div className="flex items-start gap-2">
                                {!notif.read && (
                                  <div className="w-2 h-2 rounded-full bg-brand-primary-500 mt-1.5 flex-shrink-0" />
                                )}
                                <div className={!notif.read ? '' : 'ml-4'}>
                                  <p className="text-sm font-medium text-foreground">{notif.title}</p>
                                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notif.message}</p>
                                  <p className="text-xs text-muted-foreground/70 mt-1">{formatDate(notif.createdAt)}</p>
                                </div>
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                      {notifications.length > 0 && (
                        <button
                          onClick={() => {
                            setShowNotifDropdown(false);
                            navigate('/notifications');
                          }}
                          className="w-full px-4 py-3 text-sm text-brand-primary-600 dark:text-brand-primary-400 font-medium hover:bg-brand-primary-500/10 transition-colors border-t border-border"
                        >
                          {t('header.viewAllNotifications')}
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            ) : null}

            {/* User Account */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowUserDropdown(!showUserDropdown);
                  setShowNotifDropdown(false);
                }}
                className="flex items-center space-x-2 p-1 rounded-lg hover:bg-muted transition-colors"
                aria-label={t('header.account')}
              >
                <AvatarInitials name={user?.fullName} size="sm" showRing />
                <ChevronDown className="w-4 h-4 text-muted-foreground hidden sm:block" />
              </button>

              {/* User Dropdown */}
              {showUserDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowUserDropdown(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 glass-card rounded-xl shadow-elevated py-2 z-50 animate-slide-down">
                    {isAuthenticated ? (
                      <>
                        <div className="px-4 py-2 border-b border-border">
                          <p className="text-sm font-medium text-foreground">{user?.fullName}</p>
                          <p className="text-xs text-muted-foreground">{user?.phone}</p>
                        </div>
                        <button
                          onClick={handleProfile}
                          className="w-full text-left px-4 py-2 hover:bg-muted transition-colors flex items-center space-x-2 text-foreground"
                        >
                          <User className="w-4 h-4" />
                          <span>{t('header.myAccount')}</span>
                        </button>
                        <button
                          onClick={() => {
                            setShowUserDropdown(false);
                            navigate('/referral');
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-muted transition-colors flex items-center space-x-2 text-foreground"
                        >
                          <Users className="w-4 h-4" />
                          <span>{t('header.referFriends')}</span>
                        </button>
                        <button
                          onClick={() => {
                            setShowUserDropdown(false);
                            navigate('/reinvest');
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-muted transition-colors flex items-center space-x-2 text-foreground"
                        >
                          <RefreshCw className="w-4 h-4" />
                          <span>{t('header.reinvest')}</span>
                        </button>
                        <button
                          onClick={() => {
                            setShowUserDropdown(false);
                            navigate('/notifications');
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-muted transition-colors flex items-center space-x-2 text-foreground"
                        >
                          <Bell className="w-4 h-4" />
                          <span>{t('header.notifications')}</span>
                          {unreadCount > 0 && (
                            <span className="ml-auto bg-danger text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                              {unreadCount}
                            </span>
                          )}
                        </button>
                        <hr className="my-2 border-border" />
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 hover:bg-danger/10 transition-colors flex items-center space-x-2 text-danger"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>{t('header.logout')}</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setShowUserDropdown(false);
                            navigate('/login');
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-muted transition-colors text-foreground"
                        >
                          {t('header.login')}
                        </button>
                        <button
                          onClick={() => {
                            setShowUserDropdown(false);
                            navigate('/register');
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-muted transition-colors text-foreground"
                        >
                          {t('header.register')}
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="md:hidden border-t border-border bg-background animate-slide-down">
          <div className="px-4 py-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchTerm.trim()) {
                    navigate(`/news?q=${encodeURIComponent(searchTerm.trim())}`);
                    setShowMobileMenu(false);
                  }
                }}
                placeholder={t('header.searchPlaceholder')}
                className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="px-4 pb-3">
            <LanguageSwitcher variant="compact" />
          </div>
          <nav className="px-4 py-2 space-y-1">
            <button onClick={() => { navigate('/'); setShowMobileMenu(false); }} className="block w-full text-left px-3 py-2 rounded-lg hover:bg-muted transition-colors text-foreground">{t('header.navHome')}</button>
            <button onClick={() => { navigate('/investment'); setShowMobileMenu(false); }} className="block w-full text-left px-3 py-2 rounded-lg hover:bg-muted transition-colors text-foreground">{t('header.navInvestment')}</button>
            <button onClick={() => { navigate('/news'); setShowMobileMenu(false); }} className="block w-full text-left px-3 py-2 rounded-lg hover:bg-muted transition-colors text-foreground">{t('header.navNews')}</button>
            <button onClick={() => { navigate('/benefits'); setShowMobileMenu(false); }} className="block w-full text-left px-3 py-2 rounded-lg hover:bg-muted transition-colors text-foreground">{t('header.navBenefits')}</button>
            {isAuthenticated ? (
              <>
                <button onClick={() => { navigate('/my-account'); setShowMobileMenu(false); }} className="block w-full text-left px-3 py-2 rounded-lg hover:bg-muted transition-colors text-foreground">{t('header.myAccount')}</button>
                <button onClick={() => { navigate('/wallet'); setShowMobileMenu(false); }} className="block w-full text-left px-3 py-2 rounded-lg hover:bg-muted transition-colors text-foreground">{t('header.navWallet')}</button>
                <button onClick={() => { navigate('/referral'); setShowMobileMenu(false); }} className="block w-full text-left px-3 py-2 rounded-lg hover:bg-muted transition-colors text-foreground">{t('header.referFriends')}</button>
                <button onClick={() => { navigate('/reinvest'); setShowMobileMenu(false); }} className="block w-full text-left px-3 py-2 rounded-lg hover:bg-muted transition-colors text-foreground">{t('header.reinvest')}</button>
              </>
            ) : (
              <>
                <button onClick={() => { navigate('/login'); setShowMobileMenu(false); }} className="block w-full text-left px-3 py-2 rounded-lg hover:bg-muted transition-colors text-foreground">{t('header.login')}</button>
                <button onClick={() => { navigate('/register'); setShowMobileMenu(false); }} className="block w-full text-left px-3 py-2 rounded-lg hover:bg-muted transition-colors text-foreground">{t('header.register')}</button>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;