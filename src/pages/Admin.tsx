/**
 * Admin Dashboard component - Mobile-optimized administrative interface for managing V-GREEN system
 */

import React, { useState, useEffect } from 'react';
import {
  Users, Package, DollarSign, TrendingUp, ArrowLeft, Search, Filter,
  MoreVertical, Eye, Edit, Trash2, Plus, RefreshCw, Settings,
  Bell, FileText, ToggleLeft, ToggleRight, Clock, Menu, X,
  ChevronRight, Activity, AlertCircle, Minus, Check, AlertTriangle, Paintbrush,
  CreditCard, Wallet, TrendingDown
} from 'lucide-react';
import { useNavigate } from 'react-router';
import LiveChat from '../components/LiveChat';
import AppearanceManager from '../components/AppearanceManager';
import Header from '../components/Header';
import BottomNavigation from '../components/BottomNavigation';
import { useWalletStore } from '../stores/walletStore';
import { useAuthStore } from '../stores/authStore';
import { formatCurrency } from '../lib/format';

const Admin: React.FC = () => {
  const navigate = useNavigate();
  const [activeModule, setActiveModule] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [balanceAction, setBalanceAction] = useState<'add' | 'subtract'>('add');
  const [balanceAmount, setBalanceAmount] = useState('');
  const [balanceNote, setBalanceNote] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Mock admin data
  const adminStats = {
    totalUsers: 12547,
    totalInvestment: 125000000000,
    totalProfit: 8500000000,
    totalPackages: 8,
    todayRevenue: 2500000000,
    pendingWithdrawals: 15,
    activeInvestments: 8432,
    completedInvestments: 4115
  };

  const recentActivities = [
    { id: 1, action: 'Người dùng mới đăng ký', user: 'Nguyễn Văn B', time: '2 phút trước', type: 'user' },
    { id: 2, action: 'Đầu tư gói VIC07', user: 'Trần Thị C', time: '5 phút trước', type: 'investment' },
    { id: 3, action: 'Yêu cầu rút tiền', user: 'Lê Văn D', time: '10 phút trước', type: 'withdrawal' },
    { id: 4, action: 'Hoàn thành đầu tư', user: 'Phạm Thị E', time: '15 phút trước', type: 'completed' }
  ];

  const mockUsers = [
    { id: 1, name: 'Nguyễn Văn A', email: 'nguyenvana@email.com', phone: '0901234567', balance: 150000000, investments: 3, status: 'active' },
    { id: 2, name: 'Trần Thị B', email: 'tranthib@email.com', phone: '0907654321', balance: 280000000, investments: 2, status: 'active' },
    { id: 3, name: 'Lê Văn C', email: 'levanc@email.com', phone: '0912345678', balance: 75000000, investments: 1, status: 'pending' },
    { id: 4, name: 'Phạm Thị D', email: 'phamthid@email.com', phone: '0998765432', balance: 320000000, investments: 4, status: 'active' },
    { id: 5, name: 'Hoàng Văn E', email: 'hoangvane@email.com', phone: '0976543210', balance: 45000000, investments: 1, status: 'suspended' }
  ];

  const mockPackages = [
    { id: 1, name: 'VIC07', minInvest: 100000000, maxInvest: 2000000000, rate: 18, duration: 12, totalInvested: 15000000000, investors: 1250, status: 'active' },
    { id: 2, name: 'DC 120kW', minInvest: 200000000, maxInvest: 5000000000, rate: 20, duration: 18, totalInvested: 25000000000, investors: 980, status: 'active' },
    { id: 3, name: 'GÓI VIP', minInvest: 500000000, maxInvest: 10000000000, rate: 25, duration: 24, totalInvested: 45000000000, investors: 520, status: 'active' },
    { id: 4, name: 'BASIC', minInvest: 50000000, maxInvest: 500000000, rate: 15, duration: 6, totalInvested: 8000000000, investors: 2100, status: 'inactive' }
  ];

  const mockTransactions = [
    { id: 1, user: 'Nguyễn Văn A', type: 'deposit', amount: 500000000, status: 'completed', date: '2024-04-20 10:30' },
    { id: 2, user: 'Trần Thị B', type: 'withdraw', amount: 100000000, status: 'pending', date: '2024-04-20 14:15' },
    { id: 3, user: 'Lê Văn C', type: 'profit', amount: 25000000, status: 'completed', date: '2024-04-20 09:20' },
    { id: 4, user: 'Phạm Thị D', type: 'investment', amount: 1000000000, status: 'completed', date: '2024-04-19 16:45' },
    { id: 5, user: 'Hoàng Văn E', type: 'withdraw', amount: 50000000, status: 'failed', date: '2024-04-19 11:30' }
  ];

  /**
   * Format currency to Vietnamese format
   */
  const formatCurrency = (amount: number): string => {
    if (amount >= 1000000000) {
      return `${(amount / 1000000000).toFixed(1)} tỷ`;
    } else if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(0)} triệu`;
    }
    return amount.toLocaleString();
  };

  /**
   * Get status badge styling
   */
  const getStatusBadge = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-700',
      pending: 'bg-orange-100 text-orange-700',
      suspended: 'bg-red-100 text-red-700',
      completed: 'bg-blue-100 text-blue-700',
      failed: 'bg-red-100 text-red-700',
      inactive: 'bg-gray-100 text-gray-700'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  /**
   * Get activity icon based on type
   */
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user': return <Users className="w-4 h-4 text-blue-500" />;
      case 'investment': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'withdrawal': return <DollarSign className="w-4 h-4 text-orange-500" />;
      case 'completed': return <Activity className="w-4 h-4 text-purple-500" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  /**
   * Handle balance adjustment
   */
  const handleBalanceAdjustment = (user: any, action: 'add' | 'subtract') => {
    setSelectedUser(user);
    setBalanceAction(action);
    setBalanceAmount('');
    setBalanceNote('');
    setShowBalanceModal(true);
  };

  /**
   * Process balance adjustment
   */
  const processBalanceAdjustment = async () => {
    if (!selectedUser || !balanceAmount || !balanceNote) return;

    setIsProcessing(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Update user balance (mock)
    const amount = parseFloat(balanceAmount);
    const newBalance = balanceAction === 'add' 
      ? selectedUser.balance + amount 
      : selectedUser.balance - amount;
    
    // Update mock data
    selectedUser.balance = newBalance;
    
    // Add to transaction history
    const newTransaction = {
      id: Date.now(),
      user: selectedUser.name,
      type: balanceAction === 'add' ? 'admin_credit' : 'admin_debit',
      amount: amount,
      status: 'completed',
      date: new Date().toLocaleString('vi-VN'),
      description: `Admin ${balanceAction === 'add' ? 'cộng' : 'trừ'} tiền: ${balanceNote}`
    };
    
    mockTransactions.unshift(newTransaction);
    
    setIsProcessing(false);
    setShowConfirmDialog(false);
    setShowBalanceModal(false);
    
    // Show success notification
    alert(`Đã ${balanceAction === 'add' ? 'cộng' : 'trừ'} ${formatCurrency(amount)} VND cho ${selectedUser.name}`);
  };

  /**
   * Validate balance adjustment
   */
  const validateBalanceAdjustment = () => {
    const amount = parseFloat(balanceAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Vui lòng nhập số tiền hợp lệ');
      return false;
    }
    
    if (balanceAction === 'subtract' && amount > selectedUser.balance) {
      alert('Số tiền trừ không thể lớn hơn số dư hiện tại');
      return false;
    }
    
    if (!balanceNote.trim()) {
      alert('Vui lòng nhập ghi chú');
      return false;
    }
    
    return true;
  };

  /**
   * Handle balance form submission
   */
  const handleBalanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateBalanceAdjustment()) {
      setShowConfirmDialog(true);
    }
  };

  /**
   * Mobile menu navigation items
   */
  const navItems = [
    { id: 'dashboard', label: 'Tổng quan', icon: TrendingUp },
    { id: 'deposits', label: 'Duyệt nạp tiền', icon: CreditCard },
    { id: 'withdrawals', label: 'Duyệt rút tiền', icon: Wallet },
    { id: 'users', label: 'Người dùng', icon: Users },
    { id: 'packages', label: 'Gói đầu tư', icon: Package },
    { id: 'transactions', label: 'Giao dịch', icon: DollarSign },
    { id: 'appearance', label: 'Giao diện', icon: Paintbrush },
    { id: 'settings', label: 'Cài đặt', icon: Settings }
  ];

  /**
   * Dashboard overview component
   */
  const renderDashboard = () => (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Tổng người dùng</p>
              <p className="text-lg font-bold text-gray-900">{adminStats.totalUsers.toLocaleString()}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Tổng đầu tư</p>
              <p className="text-lg font-bold text-gray-900">{formatCurrency(adminStats.totalInvestment)}</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Tổng lợi nhuận</p>
              <p className="text-lg font-bold text-gray-900">{formatCurrency(adminStats.totalProfit)}</p>
            </div>
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Gói đầu tư</p>
              <p className="text-lg font-bold text-gray-900">{adminStats.totalPackages}</p>
            </div>
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <Package className="w-5 h-5 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">Hoạt động gần đây</h3>
          <button className="text-green-600 text-sm">Xem tất cả</button>
        </div>
        <div className="space-y-3">
          {recentActivities.map((activity) => (
            <div key={activity.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg">
              <div className="flex-shrink-0">
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{activity.action}</p>
                <p className="text-xs text-gray-600 truncate">{activity.user}</p>
              </div>
              <div className="flex-shrink-0">
                <span className="text-xs text-gray-500">{activity.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-3">
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-lg text-white">
          <h4 className="font-medium mb-1">Doanh thu hôm nay</h4>
          <p className="text-2xl font-bold">{formatCurrency(adminStats.todayRevenue)} VND</p>
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 rounded-lg text-white">
          <h4 className="font-medium mb-1">Chờ xử lý</h4>
          <p className="text-2xl font-bold">{adminStats.pendingWithdrawals} giao dịch</p>
        </div>
      </div>
    </div>
  );

  /**
   * Users management component
   */
  const renderUsers = () => (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Quản lý người dùng</h3>
          <button className="bg-green-600 text-white px-3 py-1 rounded-lg text-sm">
            <Plus className="w-4 h-4 mr-1 inline" />
            Thêm
          </button>
        </div>
        
        <div className="space-y-3">
          {mockUsers.map((user) => (
            <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-medium text-sm">{user.name.charAt(0)}</span>
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">{user.name}</p>
                  <p className="text-xs text-gray-600 truncate">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="text-right">
                  <p className="text-sm font-medium">{formatCurrency(user.balance)}</p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs ${getStatusBadge(user.status)}`}>
                    {user.status === 'active' ? 'Hoạt động' : 
                     user.status === 'pending' ? 'Chờ duyệt' : 'Tạm khóa'}
                  </span>
                </div>
                <div className="flex space-x-1">
                  <button 
                    onClick={() => handleBalanceAdjustment(user, 'add')}
                    className="p-1 hover:bg-green-100 rounded text-green-600"
                    title="Cộng tiền"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleBalanceAdjustment(user, 'subtract')}
                    className="p-1 hover:bg-red-100 rounded text-red-600"
                    title="Trừ tiền"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <MoreVertical className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  /**
   * Packages management component
   */
  const renderPackages = () => (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Gói đầu tư</h3>
          <button className="bg-green-600 text-white px-3 py-1 rounded-lg text-sm">
            <Plus className="w-4 h-4 mr-1 inline" />
            Thêm
          </button>
        </div>
        
        <div className="space-y-3">
          {mockPackages.map((pkg) => (
            <div key={pkg.id} className="p-3 border rounded-lg hover:bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-900">{pkg.name}</h4>
                <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadge(pkg.status)}`}>
                  {pkg.status === 'active' ? 'Hoạt động' : 'Tạm dừng'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-gray-600">Tối thiểu: {formatCurrency(pkg.minInvest)}</p>
                  <p className="text-gray-600">Lãi suất: {pkg.rate}%/năm</p>
                </div>
                <div>
                  <p className="text-gray-600">Tổng đầu tư: {formatCurrency(pkg.totalInvested)}</p>
                  <p className="text-gray-600">Nhà đầu tư: {pkg.investors}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  /**
   * Transactions management component
   */
  const renderTransactions = () => (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Giao dịch</h3>
          <button className="bg-green-600 text-white p-2 rounded-lg">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
        
        <div className="space-y-3">
          {mockTransactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
              <div className="min-w-0">
                <p className="font-medium text-gray-900 text-sm truncate">{transaction.user}</p>
                <p className="text-xs text-gray-600">
                  {transaction.type === 'deposit' ? 'Nạp tiền' :
                   transaction.type === 'withdraw' ? 'Rút tiền' :
                   transaction.type === 'profit' ? 'Lợi nhuận' :
                   transaction.type === 'admin_credit' ? 'Admin cộng tiền' :
                   transaction.type === 'admin_debit' ? 'Admin trừ tiền' : 'Đầu tư'}
                </p>
                <p className="text-xs text-gray-500">{transaction.date}</p>
              </div>
              <div className="text-right">
                <p className={`font-medium text-sm ${
                  transaction.type === 'admin_credit' ? 'text-green-600' :
                  transaction.type === 'admin_debit' ? 'text-red-600' :
                  'text-gray-900'
                }`}>
                  {transaction.type === 'admin_credit' ? '+' : 
                   transaction.type === 'admin_debit' ? '-' : ''}
                  {formatCurrency(transaction.amount)}
                </p>
                <span className={`inline-block px-2 py-1 rounded-full text-xs ${getStatusBadge(transaction.status)}`}>
                  {transaction.status === 'completed' ? 'Hoàn thành' :
                   transaction.status === 'pending' ? 'Chờ xử lý' : 'Thất bại'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  /**
   * Settings component
   */
  const renderSettings = () => (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-4">Cài đặt hệ thống</h3>
        
        <div className="space-y-3">
          {/* Email notification item */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center space-x-3">
              <Bell className="w-5 h-5 text-orange-600" />
              <div>
                <p className="font-medium text-gray-900 text-sm">Thông báo Email</p>
                <p className="text-xs text-gray-600">Gửi thông báo qua email</p>
              </div>
            </div>
            <ToggleRight className="w-8 h-8 text-green-600" />
          </div>
          
          {/* SMS notification item */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center space-x-3">
              <Bell className="w-5 h-5 text-purple-600" />
              <div>
                <p className="font-medium text-gray-900 text-sm">Thông báo SMS</p>
                <p className="text-xs text-gray-600">Gửi thông báo qua SMS</p>
              </div>
            </div>
            <ToggleLeft className="w-8 h-8 text-gray-400" />
          </div>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-4">Báo cáo</h3>
        <div className="space-y-3">
          <button className="w-full flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
            <div className="flex items-center space-x-3">
              <FileText className="w-5 h-5 text-green-600" />
              <span className="font-medium text-gray-900 text-sm">Báo cáo tháng</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
          
          <button className="w-full flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
            <div className="flex items-center space-x-3">
              <Users className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-gray-900 text-sm">Dữ liệu người dùng</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
          
          <button className="w-full flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
            <div className="flex items-center space-x-3">
              <DollarSign className="w-5 h-5 text-purple-600" />
              <span className="font-medium text-gray-900 text-sm">Báo cáo giao dịch</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  );

  /**
   * Appearance (UI) management component - nhúng AppearanceManager
   */
  const renderAppearance = () => (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-2">Quản lý giao diện</h3>
        <p className="text-sm text-gray-600 mb-4">
          Tùy chỉnh theme, cỡ chữ, chế độ cô đọng và màu nhấn. Thiết lập được lưu để áp dụng cho toàn bộ website.
        </p>
        <AppearanceManager />
      </div>
    </div>
  );

  /**
   * Deposit approval component
   */
  const renderDeposits = () => {
    const { transactions, approveTransaction, rejectTransaction } = useWalletStore();
    const pendingDeposits = transactions.filter(t => t.type === 'deposit' && t.status === 'pending');

    return (
      <div className="space-y-4">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Yêu cầu nạp tiền</h3>
            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-medium">
              {pendingDeposits.length} chờ duyệt
            </span>
          </div>

          {pendingDeposits.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">Không có yêu cầu nạp tiền nào</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingDeposits.map((tx) => {
                const txUser = mockUsers.find(u => u.id === parseInt(tx.userId.replace(/\D/g, '')) || u.id === 1) || mockUsers[0];
                return (
                  <div key={tx.id} className="border border-gray-100 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-semibold text-gray-900">{txUser.name}</p>
                        <p className="text-xs text-gray-500">{txUser.phone}</p>
                      </div>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {tx.reference}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-xs text-gray-500">Số tiền nạp</p>
                        <p className="text-lg font-bold text-green-600">{formatCurrency(tx.amount)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">{tx.description}</p>
                        <p className="text-xs text-gray-400">{new Date(tx.createdAt).toLocaleString('vi-VN')}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          approveTransaction(tx.id);
                          alert(`Đã duyệt nạp tiền ${formatCurrency(tx.amount)} cho ${txUser.name}`);
                        }}
                        className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-1"
                      >
                        <Check className="w-4 h-4" /> Duyệt
                      </button>
                      <button
                        onClick={() => {
                          rejectTransaction(tx.id);
                          alert(`Đã từ chối yêu cầu nạp tiền của ${txUser.name}`);
                        }}
                        className="flex-1 bg-red-50 text-red-600 py-2 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors flex items-center justify-center gap-1"
                      >
                        <X className="w-4 h-4" /> Từ chối
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  /**
   * Withdrawal approval component
   */
  const renderWithdrawals = () => {
    const { transactions, approveTransaction, rejectTransaction } = useWalletStore();
    const pendingWithdrawals = transactions.filter(t => t.type === 'withdraw' && t.status === 'pending');

    return (
      <div className="space-y-4">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Yêu cầu rút tiền</h3>
            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-medium">
              {pendingWithdrawals.length} chờ duyệt
            </span>
          </div>

          {pendingWithdrawals.length === 0 ? (
            <div className="text-center py-8">
              <Wallet className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">Không có yêu cầu rút tiền nào</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingWithdrawals.map((tx) => {
                const txUser = mockUsers.find(u => u.id === parseInt(tx.userId.replace(/\D/g, '')) || u.id === 1) || mockUsers[0];
                return (
                  <div key={tx.id} className="border border-gray-100 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-semibold text-gray-900">{txUser.name}</p>
                        <p className="text-xs text-gray-500">{txUser.phone}</p>
                      </div>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {tx.reference}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-xs text-gray-500">Số tiền rút</p>
                        <p className="text-lg font-bold text-red-600">{formatCurrency(tx.amount)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">{tx.description}</p>
                        <p className="text-xs text-gray-400">{new Date(tx.createdAt).toLocaleString('vi-VN')}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          approveTransaction(tx.id);
                          alert(`Đã duyệt rút tiền ${formatCurrency(tx.amount)} cho ${txUser.name}`);
                        }}
                        className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-1"
                      >
                        <Check className="w-4 h-4" /> Duyệt
                      </button>
                      <button
                        onClick={() => {
                          rejectTransaction(tx.id);
                          alert(`Đã từ chối yêu cầu rút tiền của ${txUser.name}`);
                        }}
                        className="flex-1 bg-red-50 text-red-600 py-2 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors flex items-center justify-center gap-1"
                      >
                        <X className="w-4 h-4" /> Từ chối
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      {/* Mobile Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-2 rounded-full hover:bg-gray-100 md:hidden"
            >
              {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <button 
              onClick={() => navigate('/login')}
              className="p-2 rounded-full hover:bg-gray-100 md:hidden"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">V</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-green-600">V-GREEN Admin</h1>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">Admin</p>
              <p className="text-xs text-gray-600">Quản trị viên</p>
            </div>
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 font-bold text-sm">A</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={() => setShowMobileMenu(false)} />
      )}

      {/* Mobile Menu */}
      <div className={`fixed left-0 top-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform ${showMobileMenu ? 'translate-x-0' : '-translate-x-full'} md:hidden`}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
            <button onClick={() => setShowMobileMenu(false)} className="p-2 hover:bg-gray-100 rounded">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <nav className="space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveModule(item.id);
                  setShowMobileMenu(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  activeModule === item.id ? 'bg-green-100 text-green-600' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden md:block w-64 bg-white shadow-sm h-screen">
          <div className="p-4">
            <nav className="space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveModule(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    activeModule === item.id ? 'bg-green-100 text-green-600' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 md:p-6">
          {/* Page Title */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              {navItems.find(item => item.id === activeModule)?.label || 'Tổng quan'}
            </h1>
          </div>

          {/* Module Content */}
          {activeModule === 'dashboard' && renderDashboard()}
          {activeModule === 'deposits' && renderDeposits()}
          {activeModule === 'withdrawals' && renderWithdrawals()}
          {activeModule === 'users' && renderUsers()}
          {activeModule === 'packages' && renderPackages()}
          {activeModule === 'transactions' && renderTransactions()}
          {activeModule === 'appearance' && renderAppearance()}
          {activeModule === 'settings' && renderSettings()}
        </div>
      </div>
      
      <LiveChat />
    </div>
  );
};

export default Admin;
