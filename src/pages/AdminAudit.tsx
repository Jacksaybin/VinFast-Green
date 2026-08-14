/**
 * Admin Audit Log Viewer
 */
import React, { useEffect, useState, useCallback } from 'react';
import {
  Shield, ChevronLeft, ChevronRight, RefreshCw, Filter, Activity,
  Download, Search, X, Eye, ToggleLeft, ToggleRight, Calendar,
} from 'lucide-react';
import { Loading, Empty, ErrorBox } from '../components/ui/StateViews';

const API_URL = (typeof process !== 'undefined' && (process as any).env?.VITE_API_URL) || 'http://localhost:3001';

// Đồng bộ với AuditAction ở server/src/middleware/audit.ts
// Khi thêm action mới ở backend, phải bổ sung ở đây
const ACTIONS = [
  'login',
  'login_failed',
  'login_locked',
  'logout',
  'register',
  'password_changed',
  'profile_updated',
  'deposit_request',
  'deposit_approved',
  'deposit_rejected',
  'withdraw_request',
  'withdraw_approved',
  'withdraw_rejected',
  'investment_created',
  'investment_completed',
  'daily_profit_credited',
  'reinvestment_executed',
  'balance_adjusted',
  'kyc_submitted',
  'kyc_approved',
  'kyc_rejected',
  'user_status_changed',
  'user_role_changed',
  'user_permissions_changed',
  'referral_bonus_credited',
  'referral_bonus_claimed',
  'news_created',
  'news_updated',
  'news_deleted',
  'package_created',
  'package_updated',
  'package_status_changed',
  'notification_broadcast',
  'chat_closed',
  'admin_created',
  'admin_updated',
  'cron_profit_run',
  'settings_updated',
];

const formatDateTime = (s: string) => {
  if (!s) return '—';
  return new Date(s).toLocaleString('vi-VN');
};

const AdminAudit: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [action, setAction] = useState<string>('');
  const [userSearch, setUserSearch] = useState('');
  const [userId, setUserId] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [exportLoading, setExportLoading] = useState(false);
  const limit = 50;

  const authHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem('vgreen_token') || ''}`,
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (action) params.set('action', action);
      if (userId) params.set('userId', userId);
      if (userSearch.trim()) params.set('userSearch', userSearch.trim());
      if (fromDate) params.set('from', fromDate);
      if (toDate) params.set('to', toDate);

      const [logsRes, statsRes] = await Promise.all([
        fetch(`${API_URL}/api/audit?${params}`, { headers: authHeaders() }).then(r => r.json()),
        fetch(`${API_URL}/api/audit/stats`, { headers: authHeaders() }).then(r => r.json()),
      ]);

      if (logsRes?.success !== false) {
        setLogs(logsRes?.data?.items || logsRes?.data || []);
        setTotal(logsRes?.data?.total || logsRes?.total || 0);
      } else {
        setError(logsRes?.error || 'Lỗi tải nhật ký');
      }
      if (statsRes?.success !== false) {
        setStats(statsRes?.data || statsRes);
      }
    } catch (e: any) {
      setError(e?.message || 'Lỗi tải nhật ký');
    } finally {
      setLoading(false);
    }
  }, [page, action, userId, userSearch, fromDate, toDate]);

  useEffect(() => { load(); }, [load]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const resetFilters = () => {
    setAction('');
    setUserId('');
    setUserSearch('');
    setFromDate('');
    setToDate('');
    setPage(1);
  };

  const hasAdvancedFilter = Boolean(userSearch.trim() || userId || fromDate || toDate);

  // Áp dụng filter ngay khi user thay đổi text (debounce nhẹ qua reset page)
  const applyUserSearch = () => setPage(1);

  const handleExportCsv = async () => {
    setExportLoading(true);
    try {
      const params = new URLSearchParams();
      if (action) params.set('action', action);
      if (userId) params.set('userId', userId);
      if (userSearch.trim()) params.set('userSearch', userSearch.trim());
      if (fromDate) params.set('from', fromDate);
      if (toDate) params.set('to', toDate);

      const res = await fetch(`${API_URL}/api/audit/export?${params}`, {
        headers: authHeaders(),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const disposition = res.headers.get('Content-Disposition') || '';
      const match = disposition.match(/filename="?([^"]+)"?/);
      a.download = match?.[1] || `audit_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (e: any) {
      setError(`Xuất CSV thất bại: ${e.message || 'Lỗi không xác định'}`);
    } finally {
      setExportLoading(false);
    }
  };

  const renderMetadata = (log: any) => {
    const oldData = log.old_data;
    const newData = log.new_data;
    if (!oldData && !newData) return null;

    let merged: any = {};
    if (oldData && typeof oldData === 'object') Object.assign(merged, oldData);
    if (newData && typeof newData === 'object') Object.assign(merged, newData);

    const keys = Object.keys(merged);
    if (keys.length === 0) return null;

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
        {keys.map((k) => {
          const v = merged[k];
          const isBalance = k.toLowerCase().includes('balance');
          const isAmount = k.toLowerCase().includes('amount') || k.toLowerCase().includes('price');
          const vNum = typeof v === 'number' ? v : parseFloat(v);
          const formatted = isBalance || isAmount
            ? (Number.isFinite(vNum) ? vNum.toLocaleString('vi-VN') : String(v))
            : null;
          return (
            <div key={k} className="text-xs">
              <span className="text-muted-foreground">{k}:</span>{' '}
              <span className="font-medium text-foreground">
                {formatted ?? (typeof v === 'object' ? JSON.stringify(v) : String(v))}
                {formatted && ' ₫'}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-bold text-foreground">Nhật ký hoạt động</h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportCsv}
            disabled={exportLoading || loading}
            className="flex items-center gap-1.5 px-3 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {exportLoading ? 'Đang xuất...' : 'Xuất CSV'}
          </button>
          <button
            onClick={load}
            className="p-2 bg-muted rounded-lg hover:bg-gray-200"
            title="Tải lại"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-card rounded-xl shadow-card p-4">
            <p className="text-sm text-muted-foreground">Tổng sự kiện</p>
            <p className="text-2xl font-bold text-foreground">{stats.total}</p>
          </div>
          <div className="bg-card rounded-xl shadow-card p-4">
            <p className="text-sm text-muted-foreground">24 giờ qua</p>
            <p className="text-2xl font-bold text-primary">{stats.last24h}</p>
          </div>
          <div className="bg-card rounded-xl shadow-card p-4">
            <p className="text-sm text-muted-foreground">Hành động phổ biến (7 ngày)</p>
            <ul className="mt-1 text-xs text-foreground space-y-0.5">
              {(stats.byAction || []).slice(0, 3).map((a: any) => (
                <li key={a.action} className="flex justify-between">
                  <span className="font-mono">{a.action}</span>
                  <span className="font-semibold">{a.count}</span>
                </li>
              ))}
              {(!stats.byAction || stats.byAction.length === 0) && (
                <li className="text-muted-foreground">Chưa có dữ liệu</li>
              )}
            </ul>
          </div>
        </div>
      )}

      <div className="bg-card rounded-xl shadow-card p-4 space-y-3">
        <div className="flex items-center gap-3 flex-wrap">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-foreground">Hành động:</span>
          <select
            value={action}
            onChange={(e) => { setAction(e.target.value); setPage(1); }}
            className="px-3 py-1.5 border rounded-lg text-sm max-w-[200px]"
          >
            <option value="">Tất cả</option>
            {ACTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>

          <button
            onClick={() => setShowAdvanced((v) => !v)}
            className="flex items-center gap-1 px-3 py-1.5 text-sm border rounded-lg hover:bg-background"
          >
            {showAdvanced ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
            Bộ lọc nâng cao
            {hasAdvancedFilter && (
              <span className="ml-1 w-2 h-2 bg-primary rounded-full" />
            )}
          </button>

          <span className="ml-auto text-sm text-muted-foreground">{total} kết quả</span>
        </div>

        {showAdvanced && (
          <div className="flex items-center gap-3 flex-wrap pt-2 border-t">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-muted-foreground" />
              <input
                value={userSearch}
                onChange={(e) => { setUserSearch(e.target.value); setPage(1); }}
                placeholder="SĐT hoặc họ tên"
                className="px-3 py-1.5 border rounded-lg text-sm w-44"
              />
              <input
                value={userId}
                onChange={(e) => { setUserId(e.target.value); setPage(1); }}
                placeholder="User UUID (nâng cao)"
                className="px-3 py-1.5 border rounded-lg text-sm w-56 font-mono text-xs"
              />
              {(userSearch || userId) && (
                <button
                  onClick={() => { setUserSearch(''); setUserId(''); setPage(1); }}
                  className="p-1 text-muted-foreground hover:text-muted-foreground"
                  title="Xóa bộ lọc user"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <input
                type="date"
                value={fromDate}
                onChange={(e) => { setFromDate(e.target.value); setPage(1); }}
                className="px-3 py-1.5 border rounded-lg text-sm"
              />
              <span className="text-muted-foreground">→</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => { setToDate(e.target.value); setPage(1); }}
                className="px-3 py-1.5 border rounded-lg text-sm"
              />
            </div>

            {hasAdvancedFilter && (
              <button
                onClick={resetFilters}
                className="px-3 py-1.5 border border-danger/20 text-danger rounded-lg text-sm hover:bg-danger-subtle"
              >
                Đặt lại
              </button>
            )}
          </div>
        )}
      </div>

      {error && <ErrorBox message={error} onRetry={load} />}

      {loading ? (
        <Loading text="Đang tải nhật ký..." />
      ) : logs.length === 0 ? (
        <Empty
          title="Không có sự kiện"
          description="Chưa có hoạt động nào khớp bộ lọc."
          icon={<Activity className="w-12 h-12 text-gray-300 mb-3" />}
        />
      ) : (
        <div className="bg-card rounded-xl shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-background text-left">
                <tr>
                  <th className="px-4 py-3 font-medium text-foreground whitespace-nowrap">Thời gian</th>
                  <th className="px-4 py-3 font-medium text-foreground">Người dùng</th>
                  <th className="px-4 py-3 font-medium text-foreground">Hành động</th>
                  <th className="px-4 py-3 font-medium text-foreground">IP</th>
                  <th className="px-4 py-3 font-medium text-foreground">Chi tiết</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-t hover:bg-background">
                    <td className="px-4 py-2 text-foreground whitespace-nowrap">
                      {formatDateTime(log.created_at || log.createdAt)}
                    </td>
                    <td className="px-4 py-2">
                      {log.user_full_name ? (
                        <div>
                          <p className="font-medium">{log.user_full_name}</p>
                          <p className="text-xs text-muted-foreground">{log.user_phone}</p>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Hệ thống</span>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-xs text-muted-foreground whitespace-nowrap">
                      {log.ip_address || '—'}
                    </td>
                    <td className="px-4 py-2">
                      {(log.old_data || log.new_data) ? (
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="flex items-center gap-1 text-xs text-primary hover:text-success-strong"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Xem
                        </button>
                      ) : (
                        <span className="text-xs text-gray-300">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && total > 0 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 border rounded-lg disabled:opacity-50 hover:bg-muted"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm">Trang {page} / {totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="p-2 border rounded-lg disabled:opacity-50 hover:bg-muted"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {selectedLog && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedLog(null)}
        >
          <div
            className="bg-card rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-card">
              <h3 className="font-semibold text-foreground">Chi tiết sự kiện #{selectedLog.id}</h3>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-1 text-muted-foreground hover:text-muted-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Thời gian</p>
                  <p className="font-medium">{formatDateTime(selectedLog.created_at)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Hành động</p>
                  <p className="font-mono text-xs bg-muted px-2 py-1 rounded inline-block">
                    {selectedLog.action}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Người dùng</p>
                  <p className="font-medium">
                    {selectedLog.user_full_name || 'Hệ thống'}
                  </p>
                  {selectedLog.user_phone && (
                    <p className="text-xs text-muted-foreground">{selectedLog.user_phone}</p>
                  )}
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">IP</p>
                  <p className="font-mono text-xs">{selectedLog.ip_address || '—'}</p>
                </div>
                {selectedLog.user_agent && (
                  <div className="col-span-2">
                    <p className="text-muted-foreground text-xs">User-Agent</p>
                    <p className="text-xs break-all">{selectedLog.user_agent}</p>
                  </div>
                )}
              </div>

              <div className="border-t pt-3">
                <p className="text-muted-foreground text-xs mb-1">Metadata</p>
                {renderMetadata(selectedLog) || (
                  <p className="text-xs text-muted-foreground">Không có metadata</p>
                )}
              </div>

              <details className="border-t pt-3">
                <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                  Xem raw JSON
                </summary>
                <pre className="mt-2 text-xs bg-background p-3 rounded overflow-x-auto">
                  {JSON.stringify(
                    {
                      old_data: selectedLog.old_data,
                      new_data: selectedLog.new_data,
                    },
                    null,
                    2
                  )}
                </pre>
              </details>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAudit;
