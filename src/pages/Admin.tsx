/**
 * Admin Dashboard - Kết nối backend API + fallback localStorage
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Users, Package, DollarSign, TrendingUp, ArrowLeft, Search,
  MoreVertical, Eye, Trash2, Plus, RefreshCw, Settings,
  Bell, FileText, ToggleLeft, ToggleRight, Clock, Menu, X,
  ChevronRight, Activity, AlertCircle, Check, AlertTriangle, Paintbrush,
  CreditCard, Wallet, TrendingDown, RefreshCcw, MessageSquare, Send, User
} from 'lucide-react';
import { useNavigate } from 'react-router';
import Header from '../components/Header';
import BottomNavigation from '../components/BottomNavigation';
import { useAuthStore } from '../stores/authStore';
import { useWalletStore } from '../stores/walletStore';
import { formatCurrency } from '../lib/format';
import { adminApi, chatApi, ApiChatConversation, ApiChatMessage } from '../lib/api';

const Admin: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { transactions, approveTransaction, rejectTransaction, refresh } = useWalletStore();

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

  // Check admin role
  useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
      navigate('/');
    }
  }, [user, navigate]);

  const loadData = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    try {
      const stats = await adminApi.getStats();
      setAdminStats({
        totalUsers: stats.totalUsers || 0,
        totalInvestment: stats.totalInvestment || 0,
        totalProfit: stats.totalProfit || 0,
        pendingDeposits: stats.pendingDeposits || 0,
        pendingWithdrawals: stats.pendingWithdrawals || 0,
      });
    } catch (e) {
      // Backend offline - use local data
    }
    setRefreshing(false);
  }, [refresh]);

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
    if (ok) {
      approveTransaction(txId);
      await loadData();
    }
    setLoading(false);
  };

  const handleRejectDeposit = async (txId: string) => {
    setLoading(true);
    const ok = await adminApi.rejectDeposit(txId);
    if (ok) {
      rejectTransaction(txId);
    }
    setLoading(false);
  };

  const handleApproveWithdraw = async (txId: string) => {
    setLoading(true);
    const ok = await adminApi.approveWithdraw(txId);
    if (ok) {
      approveTransaction(txId);
      await loadData();
    }
    setLoading(false);
  };

  const handleRejectWithdraw = async (txId: string) => {
    setLoading(true);
    const ok = await adminApi.rejectWithdraw(txId);
    if (ok) {
      rejectTransaction(txId);
      await loadData();
    }
    setLoading(false);
  };

  const navItems = [
    { id: 'dashboard', label: 'Tổng quan', icon: TrendingUp },
    { id: 'deposits', label: 'Duyệt nạp tiền', icon: CreditCard },
    { id: 'withdrawals', label: 'Duyệt rút tiền', icon: Wallet },
    { id: 'chat', label: 'Chat hỗ trợ', icon: MessageSquare },
    { id: 'users', label: 'Người dùng', icon: Users },
    { id: 'packages', label: 'Gói đầu tư', icon: Package },
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
              {transactions.slice(0, 5).map((tx) => (
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
              {transactions.length === 0 && (
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
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">Người dùng ({adminStats.totalUsers})</h3>
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">Kết nối backend để xem danh sách người dùng</p>
            </div>
          </div>
        )}

        {/* Packages */}
        {activeModule === 'packages' && (
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">Gói đầu tư</h3>
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">Kết nối backend để quản lý gói đầu tư</p>
            </div>
          </div>
        )}

        {/* Transactions */}
        {activeModule === 'transactions' && (
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">Tất cả giao dịch</h3>
            {transactions.length === 0 ? (
              <div className="text-center py-8">
                <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">Chưa có giao dịch nào</p>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.slice(0, 20).map((tx) => (
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
