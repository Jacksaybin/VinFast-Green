
/**
 * Header component - Top navigation bar with logo, search, user actions and real notifications
 */

import React, { useEffect, useState } from 'react';
import { Search, Bell, User, ChevronDown, Menu, X, LogOut, Users, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useAuthStore } from '../stores/authStore';
import { useNotificationStore } from '../stores/notificationStore';
import { formatDate } from '../lib/format';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

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
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo and Mobile Menu */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className="flex items-center space-x-2">
              <div
                className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center cursor-pointer"
                onClick={() => navigate('/')}
              >
                <span className="text-white font-bold text-sm">V</span>
              </div>
              <span className="text-lg font-bold text-green-600 hidden sm:block cursor-pointer" onClick={() => navigate('/')}>
                V-GREEN
              </span>
            </div>
          </div>

          {/* Search Bar - Hidden on mobile */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Tìm kiếm..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-3">
            {/* Notification Bell */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => {
                    setShowNotifDropdown(!showNotifDropdown);
                    setShowUserDropdown(false);
                  }}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative"
                >
                  <Bell className="w-6 h-6 text-gray-600" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {unreadCount > 9 ? '9+' : unreadCount}
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
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-hidden flex flex-col">
                      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900">Thông báo</h3>
                        {unreadCount > 0 && (
                          <span className="text-xs text-green-600 font-medium">{unreadCount} chưa đọc</span>
                        )}
                      </div>
                      <div className="overflow-y-auto flex-1 max-h-72">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center text-gray-500 text-sm">
                            Chưa có thông báo nào
                          </div>
                        ) : (
                          notifications.slice(0, 10).map((notif) => (
                            <button
                              key={notif.id}
                              onClick={() => handleNotifClick(notif.id, notif.link)}
                              className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                                !notif.read ? 'bg-green-50/50' : ''
                              }`}
                            >
                              <div className="flex items-start gap-2">
                                {!notif.read && (
                                  <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                                )}
                                <div className={!notif.read ? '' : 'ml-4'}>
                                  <p className="text-sm font-medium text-gray-900">{notif.title}</p>
                                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notif.message}</p>
                                  <p className="text-xs text-gray-400 mt-1">{formatDate(notif.createdAt)}</p>
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
                          className="w-full px-4 py-3 text-sm text-green-600 font-medium hover:bg-green-50 transition-colors border-t border-gray-100"
                        >
                          Xem tất cả thông báo
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
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <ChevronDown className="w-4 h-4 text-gray-600 hidden sm:block" />
              </button>

              {/* User Dropdown */}
              {showUserDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowUserDropdown(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    {isAuthenticated ? (
                      <>
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900">{user?.fullName}</p>
                          <p className="text-xs text-gray-500">{user?.phone}</p>
                        </div>
                        <button
                          onClick={handleProfile}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors flex items-center space-x-2"
                        >
                          <User className="w-4 h-4" />
                          <span>Tài khoản của tôi</span>
                        </button>
                        <button
                          onClick={() => {
                            setShowUserDropdown(false);
                            navigate('/referral');
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors flex items-center space-x-2"
                        >
                          <Users className="w-4 h-4" />
                          <span>Giới thiệu bạn bè</span>
                        </button>
                        <button
                          onClick={() => {
                            setShowUserDropdown(false);
                            navigate('/reinvest');
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors flex items-center space-x-2"
                        >
                          <RefreshCw className="w-4 h-4" />
                          <span>Tái đầu tư</span>
                        </button>
                        <button
                          onClick={() => {
                            setShowUserDropdown(false);
                            navigate('/notifications');
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors flex items-center space-x-2"
                        >
                          <Bell className="w-4 h-4" />
                          <span>Thông báo</span>
                          {unreadCount > 0 && (
                            <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                              {unreadCount}
                            </span>
                          )}
                        </button>
                        <hr className="my-2" />
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors flex items-center space-x-2 text-red-600"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Đăng xuất</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setShowUserDropdown(false);
                            navigate('/login');
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors"
                        >
                          Đăng nhập
                        </button>
                        <button
                          onClick={() => {
                            setShowUserDropdown(false);
                            navigate('/register');
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors"
                        >
                          Đăng ký
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
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Tìm kiếm..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
          <nav className="px-4 py-2 space-y-1">
            <button onClick={() => { navigate('/'); setShowMobileMenu(false); }} className="block w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">Trang chủ</button>
            <button onClick={() => { navigate('/investment'); setShowMobileMenu(false); }} className="block w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">Đầu tư</button>
            <button onClick={() => { navigate('/news'); setShowMobileMenu(false); }} className="block w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">Tin tức</button>
            <button onClick={() => { navigate('/benefits'); setShowMobileMenu(false); }} className="block w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">Phúc lợi</button>
            {isAuthenticated ? (
              <>
                <button onClick={() => { navigate('/my-account'); setShowMobileMenu(false); }} className="block w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">Tài khoản</button>
                <button onClick={() => { navigate('/wallet'); setShowMobileMenu(false); }} className="block w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">Ví</button>
                <button onClick={() => { navigate('/referral'); setShowMobileMenu(false); }} className="block w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">Giới thiệu bạn bè</button>
                <button onClick={() => { navigate('/reinvest'); setShowMobileMenu(false); }} className="block w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">Tái đầu tư</button>
              </>
            ) : (
              <>
                <button onClick={() => { navigate('/login'); setShowMobileMenu(false); }} className="block w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">Đăng nhập</button>
                <button onClick={() => { navigate('/register'); setShowMobileMenu(false); }} className="block w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">Đăng ký</button>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
