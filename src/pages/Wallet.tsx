/**
 * Trang quản lý ví - nạp/rút tiền
 * Kết nối backend API + fallback localStorage
 */

import React, { useEffect, useState } from 'react';
import { ArrowLeft, Wallet, ArrowDownCircle, ArrowUpCircle, Lock, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router';
import Header from '../components/Header';
import BottomNavigation from '../components/BottomNavigation';
import { useAuthStore } from '../stores/authStore';
import { useWalletStore } from '../stores/walletStore';
import { useInvestmentStore } from '../stores/investmentStore';
import { useNotificationStore } from '../stores/notificationStore';
import { formatCurrency } from '../lib/format';

const WalletPage: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user)!;
  const { balance, lockedBalance, requestDeposit, requestWithdraw, refresh } = useWalletStore();
  const totalInvested = useInvestmentStore((s) => s.getTotalInvested(user.id));
  const addNotification = useNotificationStore((s) => s.addNotification);

  const [tab, setTab] = useState<'deposit' | 'withdraw'>('deposit');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const load = async () => {
      setRefreshing(true);
      await refresh();
      setRefreshing(false);
    };
    load();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    const numAmount = parseFloat(amount.replace(/\D/g, ''));

    if (isNaN(numAmount) || numAmount <= 0) {
      setMessage({ type: 'error', text: 'Vui lòng nhập số tiền hợp lệ' });
      setLoading(false);
      return;
    }

    if (tab === 'deposit') {
      const result = await requestDeposit(user.id, numAmount, note || 'Yêu cầu nạp tiền qua chuyển khoản');
      if (result.success) {
        addNotification({
          userId: user.id,
          title: 'Yêu cầu nạp tiền đã gửi',
          message: `Giao dịch ${result.transaction?.reference} đang chờ admin duyệt.`,
          type: 'transaction',
          link: '/transactions',
        });
        setMessage({ type: 'success', text: 'Yêu cầu nạp tiền đã được gửi. Vui lòng chờ admin duyệt.' });
      } else {
        setMessage({ type: 'error', text: result.error! });
      }
    } else {
      const result = await requestWithdraw(user.id, numAmount, note || 'Yêu cầu rút tiền');
      if (result.success) {
        addNotification({
          userId: user.id,
          title: 'Yêu cầu rút tiền đã gửi',
          message: `Giao dịch ${result.transaction?.reference} đang được xử lý.`,
          type: 'transaction',
          link: '/transactions',
        });
        setMessage({ type: 'success', text: 'Yêu cầu rút tiền đã được gửi thành công.' });
      } else {
        setMessage({ type: 'error', text: result.error! });
      }
    }

    setAmount('');
    setNote('');
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate('/my-account')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Quay lại tài khoản</span>
          </button>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 text-gray-500 hover:text-green-600 disabled:opacity-50"
            title="Làm mới"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl p-6 text-white mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Wallet className="w-6 h-6" />
            <span className="text-green-100">Số dư khả dụng</span>
          </div>
          <div className="text-3xl font-bold mb-4">{formatCurrency(balance)}</div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-white/10 rounded-lg p-3">
              <div className="text-green-100 flex items-center gap-1">
                <Lock className="w-3 h-3" /> Đang đầu tư
              </div>
              <div className="font-semibold">{formatCurrency(totalInvested)}</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="text-green-100">Đang chờ rút</div>
              <div className="font-semibold">{formatCurrency(lockedBalance)}</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="flex border-b border-gray-100">
            <button
              onClick={() => { setTab('deposit'); setMessage(null); }}
              className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 ${
                tab === 'deposit' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500'
              }`}
            >
              <ArrowDownCircle className="w-4 h-4" />
              Nạp tiền
            </button>
            <button
              onClick={() => { setTab('withdraw'); setMessage(null); }}
              className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 ${
                tab === 'withdraw' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500'
              }`}
            >
              <ArrowUpCircle className="w-4 h-4" />
              Rút tiền
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            {tab === 'deposit' && (
              <div className="bg-blue-50 rounded-lg p-3 text-sm text-blue-800">
                <p className="font-medium mb-1">Thông tin chuyển khoản</p>
                <p>Ngân hàng: Vietcombank</p>
                <p>STK: 1234567890 - V-GREEN FUND</p>
                <p>Nội dung: NAP {user.phone}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Số tiền (VND)</label>
              <input
                type="text"
                inputMode="numeric"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={tab === 'deposit' ? 'Tối thiểu 100.000' : 'Tối thiểu 100.000'}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ghi chú thêm (tuỳ chọn)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
              />
            </div>

            {message && (
              <div
                className={`p-3 rounded-lg text-sm ${
                  message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                }`}
              >
                {message.text}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Đang xử lý...' : tab === 'deposit' ? 'Gửi yêu cầu nạp tiền' : 'Gửi yêu cầu rút tiền'}
            </button>
          </form>
        </div>

        <button
          onClick={() => navigate('/transactions')}
          className="w-full mt-4 py-3 text-green-600 border border-green-600 rounded-lg font-medium hover:bg-green-50"
        >
          Xem lịch sử giao dịch
        </button>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default WalletPage;
