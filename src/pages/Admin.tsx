/**
 * Admin Dashboard - Kết nối backend API + fallback localStorage
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Users, Package, DollarSign, TrendingUp, ArrowLeft, Search,
  MoreVertical, Eye, Trash2, Plus, RefreshCw, Settings,
  Bell, FileText, ToggleLeft, ToggleRight, Clock, Menu, X,
  ChevronRight, Activity, AlertCircle, Check, AlertTriangle, Paintbrush,
  CreditCard, Wallet, TrendingDown, RefreshCcw, MessageSquare, Send, User, FileText
} from 'lucide-react';
import { useNavigate } from 'react-router';
import Header from '../components/Header';
import BottomNavigation from '../components/BottomNavigation';
import { useAuthStore } from '../stores/authStore';
import { formatCurrency } from '../lib/format';
import { adminApi, chatApi, newsApi, ApiChatConversation, ApiChatMessage } from '../lib/api';

const Admin: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [activeModule, setActiveModule] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [adminStats, setAdminStats] = useState({
    totalUsers: 0, totalInvestment: 0, totalProfit: 0,
    pendingDeposits: 0, pendingWithdrawals: 0,
  });
  const [pendingDeposits, setPendingDeposits] = useState<any[]>([]);
  const [pendingWithdrawals, setPendingWithdrawals] = useState<any[]>([]);

  // Chat support state
  const [chatConversations, setChatConversations] = useState<ApiChatConversation[]>([]);
  const [chatUnread, setChatUnread] = useState(0);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ApiChatMessage[]>([]);
  const [replyText, setReplyText] = useState('');

  // User management state
  const [users, setUsers] = useState<any[]>([]);
  const [userPage, setUserPage] = useState(1);
  const [userTotal, setUserTotal] = useState(0);
  const [userSearch, setUserSearch] = useState('');
  const [userSearchInput, setUserSearchInput] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustAction, setAdjustAction] = useState<'add' | 'subtract'>('add');
  const [adjustNote, setAdjustNote] = useState('');
  const [adjustLoading, setAdjustLoading] = useState(false);
  const [adjustError, setAdjustError] = useState('');
  const [adjustSuccess, setAdjustSuccess] = useState('');

  // Recent transactions for dashboard
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);

  // Transactions list state
  const [txPage, setTxPage] = useState(1);
  const [txTotal, setTxTotal] = useState(0);
  const [allTransactions, setAllTransactions] = useState<any[]>([]);

  // Package management state
  const [packages, setPackages] = useState<any[]>([]);
  const [editingPackage, setEditingPackage] = useState<any>(null);
  const [pkgForm, setPkgForm] = useState({
    name: '', code: '', minAmount: '', maxAmount: '',
    dailyProfit: '', period: '', totalProfit: '', status: 'active',
  });
  const [pkgLoading, setPkgLoading] = useState(false);

  // News management state
  const [newsList, setNewsList] = useState<any[]>([]);
  const [newsPage, setNewsPage] = useState(1);
  const [newsTotal, setNewsTotal] = useState(0);
  const [editingNews, setEditingNews] = useState<any>(null);
  const [newsForm, setNewsForm] = useState({
    title: '', slug: '', content: '', category: 'news', imageUrl: '', status: 'published',
  });
  const [newsLoading, setNewsLoading] = useState(false);

  // Check admin role
  useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
      navigate('/');
    }
  }, [user, navigate]);

  const loadData = useCallback(async () => {
    setRefreshing(true);
    try {
      const [stats, deposits, withdrawals, txs] = await Promise.all([
        adminApi.getStats(),
        adminApi.getPendingDeposits(1, 20),
        adminApi.getPendingWithdrawals(1, 20),
        adminApi.getAllTransactions(1, 10),
      ]);
      setAdminStats({
        totalUsers: stats.totalUsers || 0,
        totalInvestment: stats.totalInvestment || 0,
        totalProfit: stats.totalProfit || 0,
        pendingDeposits: stats.pendingDeposits || 0,
        pendingWithdrawals: stats.pendingWithdrawals || 0,
      });
      setPendingDeposits(deposits.deposits || []);
      setPendingWithdrawals(withdrawals.withdrawals || []);
      setRecentTransactions(txs.transactions || []);
    } catch {
      // backend offline
    }
    setRefreshing(false);
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleApproveDeposit = async (txId: string) => {
    setLoading(true);
    const ok = await adminApi.approveDeposit(txId);
    if (ok) await loadData();
    setLoading(false);
  };

  const handleRejectDeposit = async (txId: string) => {
    setLoading(true);
    const ok = await adminApi.rejectDeposit(txId);
    if (ok) await loadData();
    setLoading(false);
  };

  const handleApproveWithdraw = async (txId: string) => {
    setLoading(true);
    const ok = await adminApi.approveWithdraw(txId);
    if (ok) await loadData();
    setLoading(false);
  };

  const handleRejectWithdraw = async (txId: string) => {
    setLoading(true);
    const ok = await adminApi.rejectWithdraw(txId);
    if (ok) await loadData();
    setLoading(false);
  };

  const navItems = [
    { id: 'dashboard', label: 'Tổng quan', icon: TrendingUp },
    { id: 'deposits', label: 'Duyệt nạp tiền', icon: CreditCard },
    { id: 'withdrawals', label: 'Duyệt rút tiền', icon: Wallet },
    { id: 'chat', label: 'Chat hỗ trợ', icon: MessageSquare },
    { id: 'users', label: 'Người dùng', icon: Users },
    { id: 'packages', label: 'Gói đầu tư', icon: Package },
    { id: 'news', label: 'Tin tức', icon: FileText },
    { id: 'transactions', label: 'Giao dịch', icon: DollarSign },
    { id: 'settings', label: 'Cài đặt', icon: Settings },
  ];

  // Chat support logic
  const loadChatConversations = useCallback(async () => {
    try {
      const data = await chatApi.adminGetConversations();
      setChatConversations(data.conversations);
      setChatUnread(data.totalUnread);
    } catch {
      // backend offline
    }
  }, []);

  useEffect(() => {
    if (activeModule === 'chat') loadChatConversations();
  }, [activeModule, loadChatConversations]);

  // Poll for new chat messages every 5s while on chat module
  useEffect(() => {
    if (activeModule !== 'chat') return;
    const interval = setInterval(() => {
      loadChatConversations();
      if (activeChat) {
        chatApi.adminGetMessages(activeChat).then((data) => {
          if (data) setChatMessages(data.messages);
        });
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [activeModule, activeChat, loadChatConversations]);

  const handleSelectConversation = async (convId: string) => {
    setActiveChat(convId);
    try {
      const data = await chatApi.adminGetMessages(convId);
      if (data) setChatMessages(data.messages);
      await loadChatConversations();
    } catch {
      // ignore
    }
  };

  const handleAdminReply = async () => {
    const text = replyText.trim();
    if (!text || !activeChat) return;
    try {
      const sent = await chatApi.adminReply(activeChat, text);
      if (sent) setChatMessages((prev) => [...prev, sent]);
      setReplyText('');
      await loadChatConversations();
    } catch {
      // ignore
    }
  };

  const handleCloseConversation = async (convId: string) => {
    try {
      await chatApi.adminCloseConversation(convId);
      if (activeChat === convId) setActiveChat(null);
      await loadChatConversations();
    } catch {
      // ignore
    }
  };

  const loadUsers = useCallback(async () => {
    setRefreshing(true);
    try {
      const result = await adminApi.getUsers(userPage, 20);
      let list = result.users || [];
      if (userSearch) {
        const q = userSearch.toLowerCase();
        list = list.filter((u: any) =>
          (u.fullName || '').toLowerCase().includes(q) ||
          (u.phone || '').includes(q)
        );
      }
      setUsers(list);
      setUserTotal(result.total);
    } catch {
      // offline
    }
    setRefreshing(false);
  }, [userPage, userSearch]);

  useEffect(() => {
    if (activeModule === 'users') loadUsers();
  }, [activeModule, userPage, userSearch, loadUsers]);

  const handleToggleUserStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    setLoading(true);
    const ok = await adminApi.updateUserStatus(userId, newStatus);
    if (ok) {
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, status: newStatus } : u));
    }
    setLoading(false);
  };

  const handleAdjustBalance = async () => {
    if (!selectedUser || !adjustAmount || !adjustNote.trim()) return;
    setAdjustLoading(true);
    setAdjustError('');
    setAdjustSuccess('');
    const ok = await adminApi.adjustBalance(
      selectedUser.id,
      parseFloat(adjustAmount),
      adjustAction,
      adjustNote.trim()
    );
    if (ok) {
      setAdjustSuccess('Đã điều chỉnh số dư thành công');
      setAdjustAmount('');
      setAdjustNote('');
      setTimeout(() => {
        setSelectedUser(null);
        setAdjustSuccess('');
      }, 1500);
    } else {
      setAdjustError('Điều chỉnh thất bại');
    }
    setAdjustLoading(false);
  };

  const handleUserSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setUserSearch(userSearchInput);
  };

  // --- Packages ---
  const loadPackages = useCallback(async () => {
    setRefreshing(true);
    try {
      const data = await adminApi.getPackages();
      setPackages(data);
    } catch { /* offline */ }
    setRefreshing(false);
  }, []);

  useEffect(() => {
    if (activeModule === 'packages') loadPackages();
  }, [activeModule, loadPackages]);

  const openEditPackage = (pkg?: any) => {
    if (pkg) {
      setEditingPackage(pkg);
      setPkgForm({
        name: pkg.name || '',
        code: pkg.code || '',
        minAmount: String(pkg.minAmount || pkg.min_amount || ''),
        maxAmount: String(pkg.maxAmount || pkg.max_amount || ''),
        dailyProfit: String(pkg.dailyProfit || pkg.daily_profit || ''),
        period: String(pkg.period || ''),
        totalProfit: String(pkg.totalProfit || pkg.total_profit || ''),
        status: pkg.status || 'active',
      });
    } else {
      setEditingPackage(null);
      setPkgForm({ name: '', code: '', minAmount: '', maxAmount: '', dailyProfit: '', period: '', totalProfit: '', status: 'active' });
    }
  };

  const handleSavePackage = async () => {
    if (!pkgForm.name || !pkgForm.code) return;
    setPkgLoading(true);
    const data = {
      name: pkgForm.name,
      code: pkgForm.code,
      min_amount: parseFloat(pkgForm.minAmount) || 0,
      max_amount: parseFloat(pkgForm.maxAmount) || 0,
      daily_profit: parseFloat(pkgForm.dailyProfit) || 0,
      period: parseInt(pkgForm.period) || 0,
      total_profit: parseFloat(pkgForm.totalProfit) || 0,
      status: pkgForm.status,
    };
    const ok = editingPackage
      ? await adminApi.updatePackage(editingPackage.id, data)
      : false;
    if (ok) {
      setEditingPackage(null);
      await loadPackages();
    }
    setPkgLoading(false);
  };

  // --- News ---
  const loadNews = useCallback(async (page = 1) => {
    setRefreshing(true);
    try {
      const result = await adminApi.getNews(page, 20);
      setNewsList(result.news || []);
      setNewsTotal(result.total || 0);
    } catch { /* offline */ }
    setRefreshing(false);
  }, []);

  useEffect(() => {
    if (activeModule === 'news') loadNews(newsPage);
  }, [activeModule, newsPage, loadNews]);

  const openEditNews = (item?: any) => {
    if (item) {
      setEditingNews(item);
      setNewsForm({
        title: item.title || '',
        slug: item.slug || '',
        content: item.content || '',
        category: item.category || 'news',
        imageUrl: item.image_url || item.imageUrl || '',
        status: item.status || 'published',
      });
    } else {
      setEditingNews(null);
      setNewsForm({ title: '', slug: '', content: '', category: 'news', imageUrl: '', status: 'published' });
    }
  };

  const handleSaveNews = async () => {
    if (!newsForm.title || !newsForm.content) return;
    setNewsLoading(true);
    const data = {
      title: newsForm.title,
      slug: newsForm.slug || newsForm.title.toLowerCase().replace(/\s+/g, '-'),
      content: newsForm.content,
      category: newsForm.category,
      image_url: newsForm.imageUrl,
      status: newsForm.status,
    };
    const ok = editingNews
      ? await adminApi.updateNews(editingNews.id, data)
      : await adminApi.createNews(data);
    if (ok) {
      setEditingNews(null);
      await loadNews(newsPage);
    }
    setNewsLoading(false);
  };

  const handleDeleteNews = async (id: string) => {
    if (!confirm('Xóa bài viết này?')) return;
    setNewsLoading(true);
    const ok = await adminApi.deleteNews(id);
    if (ok) await loadNews(newsPage);
    setNewsLoading(false);
  };

  const loadAllTransactions = useCallback(async (page = 1) => {
    setRefreshing(true);
    try {
      const result = await adminApi.getAllTransactions(page, 20);
      setAllTransactions(result.transactions || []);
      setTxTotal(result.total);
    } catch {
      // offline
    }
    setRefreshing(false);
  }, []);

  useEffect(() => {
    if (activeModule === 'transactions') loadAllTransactions(txPage);
  }, [activeModule, txPage, loadAllTransactions]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="px-4 py-4 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Quay lại</span>
          </button>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 text-gray-500 hover:text-green-600 disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <h1 className="text-xl font-bold text-gray-900 mb-1">Quản trị hệ thống</h1>
        <p className="text-sm text-gray-500 mb-4">Xin chào, {user?.fullName}</p>

        {/* Mobile Nav */}
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveModule(item.id)}
              className={`flex items-center gap-1 px-3 py-2 rounded-full text-xs whitespace-nowrap relative ${
                activeModule === item.id
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-600 border'
              }`}
            >
              <item.icon className="w-3 h-3" />
              {item.label}
              {item.id === 'chat' && chatUnread > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                  {chatUnread > 9 ? '9+' : chatUnread}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Dashboard */}
        {activeModule === 'dashboard' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Tổng người dùng', value: adminStats.totalUsers.toLocaleString(), icon: Users, color: 'bg-blue-50 text-blue-600' },
                { label: 'Tổng đầu tư', value: formatCurrency(adminStats.totalInvestment), icon: DollarSign, color: 'bg-green-50 text-green-600' },
                { label: 'Nạp tiền chờ', value: adminStats.pendingDeposits, icon: CreditCard, color: 'bg-orange-50 text-orange-600' },
                { label: 'Rút tiền chờ', value: adminStats.pendingWithdrawals, icon: Wallet, color: 'bg-red-50 text-red-600' },
              ].map((stat) => (
                <div key={stat.label} className="bg-white rounded-xl p-4 shadow-sm">
                  <div className={`w-10 h-10 ${stat.color} rounded-full flex items-center justify-center mb-2`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <div className="text-xs text-gray-500">{stat.label}</div>
                  <div className="text-lg font-bold text-gray-900">{stat.value}</div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-3">Giao dịch gần đây</h3>
              {recentTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {tx.type === 'deposit' ? 'Nạp tiền' : tx.type === 'withdraw' ? 'Rút tiền' : tx.type}
                    </p>
                    <p className="text-xs text-gray-400">{tx.reference}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${tx.type === 'deposit' ? 'text-green-600' : 'text-red-600'}`}>
                      {tx.type === 'deposit' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </p>
                    <p className={`text-xs ${tx.status === 'completed' ? 'text-green-500' : 'text-orange-500'}`}>
                      {tx.status === 'completed' ? 'Hoàn thành' : 'Chờ duyệt'}
                    </p>
                  </div>
                </div>
              ))}
              {recentTransactions.length === 0 && (
                <p className="text-center text-gray-400 py-4 text-sm">Chưa có giao dịch nào</p>
              )}
            </div>
          </div>
        )}

        {/* Deposits */}
        {activeModule === 'deposits' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">Yêu cầu nạp tiền</h3>
              {pendingDeposits.length === 0 ? (
                <div className="text-center py-8">
                  <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">Không có yêu cầu nạp tiền nào</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingDeposits.map((tx) => (
                    <div key={tx.id} className="border border-gray-100 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-semibold text-gray-900">{(tx as any).full_name || tx.userId}</p>
                          <p className="text-xs text-gray-500">{(tx as any).phone || ''}</p>
                        </div>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">{tx.reference}</span>
                      </div>
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-xs text-gray-500">Số tiền nạp</p>
                          <p className="text-lg font-bold text-green-600">{formatCurrency(parseFloat(tx.amount))}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-400">{tx.created_at ? new Date(tx.created_at).toLocaleString('vi-VN') : ''}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApproveDeposit(tx.id)}
                          disabled={loading}
                          className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-1"
                        >
                          <Check className="w-4 h-4" /> Duyệt
                        </button>
                        <button
                          onClick={() => handleRejectDeposit(tx.id)}
                          disabled={loading}
                          className="flex-1 bg-red-50 text-red-600 py-2 rounded-lg text-sm font-medium hover:bg-red-100 disabled:opacity-50 flex items-center justify-center gap-1"
                        >
                          <X className="w-4 h-4" /> Từ chối
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Withdrawals */}
        {activeModule === 'withdrawals' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">Yêu cầu rút tiền</h3>
              {pendingWithdrawals.length === 0 ? (
                <div className="text-center py-8">
                  <Wallet className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">Không có yêu cầu rút tiền nào</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingWithdrawals.map((tx) => (
                    <div key={tx.id} className="border border-gray-100 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-semibold text-gray-900">{(tx as any).full_name || tx.userId}</p>
                          <p className="text-xs text-gray-500">{(tx as any).phone || ''}</p>
                        </div>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">{tx.reference}</span>
                      </div>
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-xs text-gray-500">Số tiền rút</p>
                          <p className="text-lg font-bold text-red-600">{formatCurrency(parseFloat(tx.amount))}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-400">{tx.created_at ? new Date(tx.created_at).toLocaleString('vi-VN') : ''}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApproveWithdraw(tx.id)}
                          disabled={loading}
                          className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-1"
                        >
                          <Check className="w-4 h-4" /> Duyệt
                        </button>
                        <button
                          onClick={() => handleRejectWithdraw(tx.id)}
                          disabled={loading}
                          className="flex-1 bg-red-50 text-red-600 py-2 rounded-lg text-sm font-medium hover:bg-red-100 disabled:opacity-50 flex items-center justify-center gap-1"
                        >
                          <X className="w-4 h-4" /> Từ chối
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Users */}
        {activeModule === 'users' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">
                Người dùng {userTotal > 0 && `(${userTotal})`}
              </h3>

              {/* Search */}
              <form onSubmit={handleUserSearch} className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={userSearchInput}
                  onChange={(e) => setUserSearchInput(e.target.value)}
                  placeholder="Tìm theo tên hoặc số điện thoại..."
                  className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
                >
                  <Search className="w-4 h-4" />
                </button>
              </form>

              {/* User list */}
              {users.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">Không tìm thấy người dùng</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {users.map((u) => (
                    <div key={u.id} className="border border-gray-100 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="w-5 h-5 text-gray-500" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 text-sm truncate">{u.fullName || '—'}</p>
                            <p className="text-xs text-gray-500">{u.phone}</p>
                            <p className="text-xs text-gray-400">
                              {u.createdAt ? new Date(u.createdAt).toLocaleDateString('vi-VN') : ''} · {u.referralCode || ''}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            u.status === 'active' ? 'bg-green-100 text-green-700' :
                            u.status === 'suspended' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {u.status === 'active' ? 'Hoạt động' : u.status === 'suspended' ? 'Bị khóa' : u.status}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => {
                            setSelectedUser(u);
                            setAdjustAmount('');
                            setAdjustNote('');
                            setAdjustError('');
                            setAdjustSuccess('');
                          }}
                          className="flex-1 text-xs bg-blue-50 text-blue-600 py-1.5 rounded-lg hover:bg-blue-100 flex items-center justify-center gap-1"
                        >
                          <DollarSign className="w-3 h-3" /> Điều chỉnh số dư
                        </button>
                        <button
                          onClick={() => handleToggleUserStatus(u.id, u.status)}
                          disabled={loading}
                          className={`text-xs py-1.5 px-3 rounded-lg flex items-center gap-1 disabled:opacity-50 ${
                            u.status === 'active'
                              ? 'bg-red-50 text-red-600 hover:bg-red-100'
                              : 'bg-green-50 text-green-600 hover:bg-green-100'
                          }`}
                        >
                          {u.status === 'active' ? (
                            <><ToggleLeft className="w-3 h-3" /> Khóa</>
                          ) : (
                            <><ToggleRight className="w-3 h-3" /> Mở khóa</>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {userTotal > 20 && (
                <div className="flex items-center justify-center gap-2 mt-4">
                  <button
                    onClick={() => setUserPage((p) => Math.max(1, p - 1))}
                    disabled={userPage === 1}
                    className="px-3 py-1 border rounded text-sm disabled:opacity-40"
                  >
                    ←
                  </button>
                  <span className="text-sm text-gray-500">
                    Trang {userPage} / {Math.ceil(userTotal / 20)}
                  </span>
                  <button
                    onClick={() => setUserPage((p) => p + 1)}
                    disabled={userPage >= Math.ceil(userTotal / 20)}
                    className="px-3 py-1 border rounded text-sm disabled:opacity-40"
                  >
                    →
                  </button>
                </div>
              )}
            </div>

            {/* Balance adjust modal */}
            {selectedUser && (
              <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
                <div className="bg-white rounded-xl p-5 w-full max-w-sm">
                  <h4 className="font-semibold text-gray-900 mb-1">
                    Điều chỉnh số dư
                  </h4>
                  <p className="text-sm text-gray-500 mb-4">
                    {selectedUser.fullName || selectedUser.phone}
                  </p>

                  <div className="flex gap-2 mb-3">
                    {(['add', 'subtract'] as const).map((action) => (
                      <button
                        key={action}
                        onClick={() => setAdjustAction(action)}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                          adjustAction === action
                            ? action === 'add'
                              ? 'bg-green-600 text-white'
                              : 'bg-red-600 text-white'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {action === 'add' ? '+ Cộng tiền' : '− Trừ tiền'}
                      </button>
                    ))}
                  </div>

                  <input
                    type="number"
                    value={adjustAmount}
                    onChange={(e) => setAdjustAmount(e.target.value)}
                    placeholder="Số tiền (VNĐ)"
                    className="w-full px-3 py-2 border rounded-lg text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />

                  <textarea
                    value={adjustNote}
                    onChange={(e) => setAdjustNote(e.target.value)}
                    placeholder="Lý do (bắt buộc)"
                    rows={2}
                    className="w-full px-3 py-2 border rounded-lg text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                  />

                  {adjustError && (
                    <p className="text-red-600 text-sm mb-2">{adjustError}</p>
                  )}
                  {adjustSuccess && (
                    <p className="text-green-600 text-sm mb-2">{adjustSuccess}</p>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedUser(null)}
                      className="flex-1 py-2 border rounded-lg text-sm"
                    >
                      Hủy
                    </button>
                    <button
                      onClick={handleAdjustBalance}
                      disabled={adjustLoading || !adjustAmount || !adjustNote.trim()}
                      className="flex-1 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-50"
                    >
                      {adjustLoading ? 'Đang xử lý...' : 'Xác nhận'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Packages */}
        {activeModule === 'packages' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Gói đầu tư</h3>
              </div>
              {packages.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">Không có gói nào</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {packages.map((pkg) => (
                    <div key={pkg.id} className="border border-gray-100 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-semibold text-gray-900">{pkg.name}</p>
                          <p className="text-xs text-gray-500">Mã: {pkg.code}</p>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          pkg.status === 'active' ? 'bg-green-100 text-green-700' :
                          pkg.status === 'inactive' ? 'bg-gray-100 text-gray-500' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {pkg.status === 'active' ? 'Hoạt động' : pkg.status === 'inactive' ? 'Tạm dừng' : pkg.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs text-gray-600 mb-3">
                        <div>
                          <p className="text-gray-400">Min</p>
                          <p className="font-medium">{formatCurrency(pkg.min_amount || pkg.minAmount || 0)}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Lợi nhuận/ngày</p>
                          <p className="font-medium text-green-600">{pkg.daily_profit || pkg.dailyProfit || 0}%</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Kỳ hạn</p>
                          <p className="font-medium">{pkg.period || 0} ngày</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* News Management */}
        {activeModule === 'news' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Tin tức {newsTotal > 0 && `(${newsTotal})`}</h3>
                <button
                  onClick={() => openEditNews()}
                  className="flex items-center gap-1 text-sm bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700"
                >
                  <Plus className="w-3.5 h-3.5" /> Viết bài
                </button>
              </div>
              {newsList.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">Chưa có bài viết nào</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {newsList.map((item) => (
                    <div key={item.id} className="border border-gray-100 rounded-lg p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-900 text-sm truncate">{item.title}</p>
                          <p className="text-xs text-gray-500 truncate">{item.slug}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              item.status === 'published' ? 'bg-green-100 text-green-700' :
                              'bg-gray-100 text-gray-500'
                            }`}>
                              {item.status === 'published' ? 'Đã đăng' : 'Bản nháp'}
                            </span>
                            <span className="text-xs text-gray-400">{item.category}</span>
                            <span className="text-xs text-gray-400">
                              {item.created_at ? new Date(item.created_at).toLocaleDateString('vi-VN') : ''}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={() => openEditNews(item)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                          >
                            <Paintbrush className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteNews(item.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {newsTotal > 20 && (
                <div className="flex items-center justify-center gap-2 mt-4">
                  <button onClick={() => setNewsPage((p) => Math.max(1, p - 1))} disabled={newsPage === 1}
                    className="px-3 py-1 border rounded text-sm disabled:opacity-40">←</button>
                  <span className="text-sm text-gray-500">Trang {newsPage} / {Math.ceil(newsTotal / 20)}</span>
                  <button onClick={() => setNewsPage((p) => p + 1)} disabled={newsPage >= Math.ceil(newsTotal / 20)}
                    className="px-3 py-1 border rounded text-sm disabled:opacity-40">→</button>
                </div>
              )}
            </div>

            {/* News editor modal */}
            {editingNews !== undefined && (
              <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4 overflow-y-auto py-8">
                <div className="bg-white rounded-xl p-5 w-full max-w-md">
                  <h4 className="font-semibold text-gray-900 mb-4">
                    {editingNews ? 'Sửa bài viết' : 'Viết bài mới'}
                  </h4>
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={newsForm.title}
                      onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })}
                      placeholder="Tiêu đề"
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <input
                      type="text"
                      value={newsForm.slug}
                      onChange={(e) => setNewsForm({ ...newsForm, slug: e.target.value })}
                      placeholder="Slug (tự động nếu trống)"
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <textarea
                      value={newsForm.content}
                      onChange={(e) => setNewsForm({ ...newsForm, content: e.target.value })}
                      placeholder="Nội dung bài viết"
                      rows={6}
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                    />
                    <div className="flex gap-2">
                      <select
                        value={newsForm.category}
                        onChange={(e) => setNewsForm({ ...newsForm, category: e.target.value })}
                        className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="news">Tin tức</option>
                        <option value="promotion">Khuyến mãi</option>
                        <option value="announcement">Thông báo</option>
                      </select>
                      <select
                        value={newsForm.status}
                        onChange={(e) => setNewsForm({ ...newsForm, status: e.target.value })}
                        className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="published">Đăng ngay</option>
                        <option value="draft">Bản nháp</option>
                      </select>
                    </div>
                    <input
                      type="text"
                      value={newsForm.imageUrl}
                      onChange={(e) => setNewsForm({ ...newsForm, imageUrl: e.target.value })}
                      placeholder="URL ảnh (tùy chọn)"
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => setEditingNews(undefined)}
                      className="flex-1 py-2 border rounded-lg text-sm"
                    >
                      Hủy
                    </button>
                    <button
                      onClick={handleSaveNews}
                      disabled={newsLoading || !newsForm.title || !newsForm.content}
                      className="flex-1 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-50"
                    >
                      {newsLoading ? 'Đang lưu...' : 'Lưu bài viết'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Transactions */}
        {activeModule === 'transactions' && (
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">Tất cả giao dịch {txTotal > 0 && `(${txTotal})`}</h3>
            {allTransactions.length === 0 ? (
              <div className="text-center py-8">
                <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">Chưa có giao dịch nào</p>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {allTransactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {tx.type === 'deposit' ? 'Nạp tiền' : tx.type === 'withdraw' ? 'Rút tiền' : tx.type}
                        </p>
                        <p className="text-xs text-gray-400">{tx.reference}</p>
                        <p className="text-xs text-gray-500">
                          {(tx as any).full_name || (tx as any).phone || ''}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-bold ${tx.type === 'deposit' ? 'text-green-600' : 'text-red-600'}`}>
                          {tx.type === 'deposit' ? '+' : '-'}{formatCurrency(tx.amount)}
                        </p>
                        <span className={`text-xs px-1.5 py-0.5 rounded ${
                          tx.status === 'completed' ? 'bg-green-100 text-green-700' :
                          tx.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {tx.status === 'completed' ? 'Hoàn thành' : tx.status === 'pending' ? 'Chờ duyệt' : 'Thất bại'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                {txTotal > 20 && (
                  <div className="flex items-center justify-center gap-2 mt-4">
                    <button
                      onClick={() => setTxPage((p) => Math.max(1, p - 1))}
                      disabled={txPage === 1}
                      className="px-3 py-1 border rounded text-sm disabled:opacity-40"
                    >
                      ←
                    </button>
                    <span className="text-sm text-gray-500">
                      Trang {txPage} / {Math.ceil(txTotal / 20)}
                    </span>
                    <button
                      onClick={() => setTxPage((p) => p + 1)}
                      disabled={txPage >= Math.ceil(txTotal / 20)}
                      className="px-3 py-1 border rounded text-sm disabled:opacity-40"
                    >
                      →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Chat Support */}
        {activeModule === 'chat' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Hỗ trợ khách hàng</h3>
              {chatUnread > 0 && (
                <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">
                  {chatUnread} tin chưa đọc
                </span>
              )}
            </div>

            {/* Conversation list */}
            {!activeChat && (
              <div className="bg-white rounded-xl p-4 shadow-sm">
                {chatConversations.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">Chưa có cuộc hội thoại nào</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {chatConversations.map((conv) => (
                      <div
                        key={conv.id}
                        onClick={() => handleSelectConversation(conv.id)}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                      >
                        <div className="flex items-center space-x-3 min-w-0">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="w-5 h-5 text-green-600" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 text-sm truncate">
                              {conv.user_full_name || conv.user_name || 'Khách'}{' '}
                              <span className="text-xs text-gray-400">{conv.user_phone || ''}</span>
                            </p>
                            <p className="text-xs text-gray-500 truncate">{conv.last_message || 'Cuộc hội thoại mới'}</p>
                            <p className="text-xs text-gray-400">
                              {conv.last_message_at ? new Date(conv.last_message_at).toLocaleString('vi-VN') : new Date(conv.created_at).toLocaleString('vi-VN')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 flex-shrink-0">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            conv.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                          }`}>
                            {conv.status === 'open' ? 'Mở' : 'Đóng'}
                          </span>
                          {conv.unread_count > 0 && (
                            <span className="bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center">
                              {conv.unread_count}
                            </span>
                          )}
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Chat detail */}
            {activeChat && (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                {/* Chat header */}
                <div className="bg-gradient-to-r from-green-600 to-green-700 p-4 text-white flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <button onClick={() => setActiveChat(null)} className="text-white">
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                      <p className="font-semibold text-sm">
                        {chatConversations.find(c => c.id === activeChat)?.user_full_name ||
                         chatConversations.find(c => c.id === activeChat)?.user_name || 'Khách'}
                      </p>
                      <p className="text-xs text-green-100">
                        {chatConversations.find(c => c.id === activeChat)?.user_phone || ''}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleCloseConversation(activeChat)}
                    className="text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded"
                  >
                    Đóng hội thoại
                  </button>
                </div>

                {/* Messages */}
                <div className="p-4 bg-gray-50 h-80 overflow-y-auto space-y-3">
                  {chatMessages.length === 0 && (
                    <p className="text-center text-gray-400 text-sm py-8">Chưa có tin nhắn</p>
                  )}
                  {chatMessages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${
                        msg.sender === 'admin'
                          ? 'bg-green-600 text-white rounded-br-md'
                          : 'bg-white text-gray-800 border rounded-bl-md'
                      }`}>
                        <p className="break-words">{msg.text}</p>
                        <p className={`text-[10px] mt-1 ${msg.sender === 'admin' ? 'text-green-100' : 'text-gray-400'}`}>
                          {new Date(msg.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Reply input */}
                <div className="p-4 bg-white border-t flex items-center space-x-2">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAdminReply()}
                    placeholder="Nhập câu trả lời..."
                    className="flex-1 px-3 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                  />
                  <button
                    onClick={handleAdminReply}
                    disabled={!replyText.trim()}
                    className="w-9 h-9 bg-green-600 text-white rounded-full flex items-center justify-center hover:bg-green-700 disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Settings */}
        {activeModule === 'settings' && (
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">Cài đặt hệ thống</h3>
            <div className="text-center py-8">
              <Settings className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">Quản lý cài đặt hệ thống</p>
            </div>
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Admin;
