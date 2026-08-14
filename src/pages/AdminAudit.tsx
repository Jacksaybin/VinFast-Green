/**
 * Admin Audit Log Viewer
 */

import React, { useEffect, useState } from 'react';
import { Shield, ChevronLeft, ChevronRight, RefreshCw, Filter, Activity } from 'lucide-react';
import { Loading, Empty, ErrorBox } from '../components/ui/StateViews';

const API_URL = (typeof process !== 'undefined' && (process as any).env?.VITE_API_URL) || 'http://localhost:3001';

const ACTIONS = [
  'login', 'login_failed', 'login_locked', 'logout', 'register',
  'kyc_submitted', 'kyc_approved', 'kyc_rejected',
  'deposit_approve', 'deposit_reject', 'withdraw_approve', 'withdraw_reject',
  'admin_credit', 'admin_debit',
  'package_created', 'package_updated', 'news_created', 'news_updated',
];

const AdminAudit: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [action, setAction] = useState<string>('');
  const limit = 50;

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem('vgreen_token') || ''}` };
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (action) params.set('action', action);

      const [logsRes, statsRes] = await Promise.all([
        fetch(`${API_URL}/api/audit?${params}`, { headers }).then(r => r.json()),
        fetch(`${API_URL}/api/audit/stats`, { headers }).then(r => r.json()),
      ]);

      if (logsRes?.success !== false) {
        setLogs(logsRes?.data?.items || logsRes?.data || []);
        setTotal(logsRes?.data?.total || logsRes?.total || 0);
      }
      if (statsRes?.success !== false) {
        setStats(statsRes?.data || statsRes);
      }
    } catch (e: any) {
      setError(e?.message || 'Lỗi tải nhật ký');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page, action]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-green-600" />
          <h2 className="text-xl font-bold text-gray-900">Nhật ký hoạt động</h2>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200" title="Tải lại">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <p className="text-sm text-gray-600">Tổng sự kiện</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <p className="text-sm text-gray-600">24 giờ qua</p>
            <p className="text-2xl font-bold text-green-600">{stats.last24h}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <p className="text-sm text-gray-600">Hành động phổ biến</p>
            <ul className="mt-1 text-xs text-gray-700 space-y-0.5">
              {(stats.byAction || []).slice(0, 3).map((a: any) => (
                <li key={a.action}>{a.action}: <span className="font-semibold">{a.count}</span></li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-3">
        <Filter className="w-4 h-4 text-gray-500" />
        <span className="text-sm text-gray-700">Hành động:</span>
        <select value={action} onChange={(e) => { setAction(e.target.value); setPage(1); }} className="px-3 py-1.5 border rounded-lg text-sm">
          <option value="">Tất cả</option>
          {ACTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
        <span className="ml-auto text-sm text-gray-500">{total} kết quả</span>
      </div>

      {error && <ErrorBox message={error} onRetry={load} />}

      {loading ? (
        <Loading text="Đang tải nhật ký..." />
      ) : logs.length === 0 ? (
        <Empty title="Không có sự kiện" description="Chưa có hoạt động nào khớp bộ lọc." icon={<Activity className="w-12 h-12 text-gray-300 mb-3" />} />
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium text-gray-700">Thời gian</th>
                  <th className="px-4 py-3 font-medium text-gray-700">Người dùng</th>
                  <th className="px-4 py-3 font-medium text-gray-700">Hành động</th>
                  <th className="px-4 py-3 font-medium text-gray-700">IP</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2 text-gray-700 whitespace-nowrap">
                      {new Date(log.created_at || log.createdAt).toLocaleString('vi-VN')}
                    </td>
                    <td className="px-4 py-2">
                      {log.user_full_name ? (
                        <div>
                          <p className="font-medium">{log.user_full_name}</p>
                          <p className="text-xs text-gray-500">{log.user_phone}</p>
                        </div>
                      ) : (
                        <span className="text-gray-400">Hệ thống</span>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{log.action}</span>
                    </td>
                    <td className="px-4 py-2 text-xs text-gray-500">{log.ip_address || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && total > 0 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
            className="p-2 border rounded-lg disabled:opacity-50 hover:bg-gray-100">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm">Trang {page} / {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
            className="p-2 border rounded-lg disabled:opacity-50 hover:bg-gray-100">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminAudit;
