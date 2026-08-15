/**
 * Admin KYC Review Page
 */

import React, { useEffect, useState } from 'react';
import { FileCheck, ChevronLeft, ChevronRight, Check, X as XIcon, RefreshCw } from 'lucide-react';
import { Loading, Empty, ErrorBox } from '../components/ui/StateViews';

const API_URL = (typeof process !== 'undefined' && (process as any).env?.VITE_API_URL) || 'http://localhost:3001';

const AdminKyc: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState<any | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const limit = 20;

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem('vgreen_token') || ''}` };
      const res = await fetch(`${API_URL}/api/kyc/admin/pending?page=${page}&limit=${limit}`, { headers }).then(r => r.json());
      if (res?.success !== false) {
        setUsers(res?.data?.items || res?.data || []);
        setTotal(res?.data?.total || res?.total || 0);
      } else {
        setError(res.error || 'Lỗi tải dữ liệu');
      }
    } catch (e: any) {
      setError(e?.message || 'Lỗi kết nối');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page]);

  const approve = async (userId: string) => {
    if (!confirm('Duyệt KYC cho user này?')) return;
    setProcessing(true);
    try {
      const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('vgreen_token') || ''}` };
      const res = await fetch(`${API_URL}/api/kyc/admin/${userId}/approve`, { method: 'POST', headers }).then(r => r.json());
      if (res?.success) await load();
      else alert(res?.error || 'Thất bại');
    } finally { setProcessing(false); }
  };

  const reject = async (userId: string) => {
    if (!rejectReason.trim()) {
      alert('Vui lòng nhập lý do');
      return;
    }
    setProcessing(true);
    try {
      const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('vgreen_token') || ''}` };
      const res = await fetch(`${API_URL}/api/kyc/admin/${userId}/reject`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ reason: rejectReason }),
      }).then(r => r.json());
      if (res?.success) {
        setSelected(null);
        setRejectReason('');
        await load();
      } else alert(res?.error || 'Thất bại');
    } finally { setProcessing(false); }
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileCheck className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-bold text-foreground">Duyệt KYC</h2>
        </div>
        <button onClick={load} className="p-2 bg-muted rounded-lg hover:bg-muted/70">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {error && <ErrorBox message={error} onRetry={load} />}

      {loading ? (
        <Loading text="Đang tải hồ sơ..." />
      ) : users.length === 0 ? (
        <Empty title="Không có hồ sơ chờ duyệt" description="Tất cả hồ sơ KYC đã được xử lý." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {users.map((u) => (
            <div key={u.id} className="bg-card rounded-xl shadow-card p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-foreground">{u.full_name}</h4>
                  <p className="text-sm text-muted-foreground">{u.phone}</p>
                  {u.email && <p className="text-xs text-muted-foreground">{u.email}</p>}
                </div>
                <span className="text-xs px-2 py-1 bg-warning-subtle text-warning-strong rounded-full">Chờ duyệt</span>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3">
                {u.kyc_front_image && (
                  <a href={u.kyc_front_image} target="_blank" rel="noreferrer">
                    <img src={u.kyc_front_image} alt="CCCD mặt trước" className="w-full h-32 object-cover rounded border" />
                  </a>
                )}
                {u.kyc_back_image && (
                  <a href={u.kyc_back_image} target="_blank" rel="noreferrer">
                    <img src={u.kyc_back_image} alt="CCCD mặt sau" className="w-full h-32 object-cover rounded border" />
                  </a>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => approve(u.id)}
                  disabled={processing}
                  className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-primary flex items-center justify-center gap-1 text-sm disabled:opacity-50"
                >
                  <Check className="w-4 h-4" /> Duyệt
                </button>
                <button
                  onClick={() => { setSelected(u); setRejectReason(''); }}
                  className="flex-1 bg-danger text-white py-2 rounded-lg hover:bg-danger-strong flex items-center justify-center gap-1 text-sm"
                >
                  <XIcon className="w-4 h-4" /> Từ chối
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
            className="p-2 border rounded-lg disabled:opacity-50 hover:bg-muted">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm">Trang {page} / {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
            className="p-2 border rounded-lg disabled:opacity-50 hover:bg-muted">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-2">Từ chối hồ sơ KYC</h3>
            <p className="text-sm text-muted-foreground mb-3">{selected.full_name} ({selected.phone})</p>
            <label className="block text-sm font-medium mb-1">Lý do từ chối</label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
              placeholder="Vd: Ảnh mờ, không thấy rõ thông tin..."
              className="w-full px-3 py-2 border rounded-lg"
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => reject(selected.id)}
                disabled={processing}
                className="flex-1 bg-danger text-white py-2 rounded-lg hover:bg-danger-strong disabled:opacity-50"
              >
                {processing ? 'Đang xử lý...' : 'Xác nhận từ chối'}
              </button>
              <button onClick={() => setSelected(null)} className="flex-1 border py-2 rounded-lg hover:bg-background">Hủy</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminKyc;
