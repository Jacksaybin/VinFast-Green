/**
 * Admin Settings Page - manage system settings
 */

import React, { useEffect, useState } from 'react';
import { Settings as SettingsIcon, Plus, Trash2, Save, RefreshCw, Edit2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Loading, Empty, ErrorBox } from '../components/ui/StateViews';

const API_URL = (typeof process !== 'undefined' && (process as any).env?.VITE_API_URL) || 'http://localhost:3001';

async function getAuthHeaders(): Promise<Record<string, string>> {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('vgreen_token') || ''}`,
  };
}

async function apiGet(path: string) {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}${path}`, { headers });
  return res.json();
}

async function apiSend(path: string, body: any, method = 'PUT') {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}${path}`, { method, headers, body: JSON.stringify(body) });
  return res.json();
}

const AdminSettings: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiGet('/api/settings');
      // data.data is paginated wrapper, or items array depending on implementation
      const list = (data?.data?.items || data?.data || data?.items || []) as any[];
      setItems(list);
    } catch (e: any) {
      setError(e?.message || 'Không thể tải cài đặt');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const startEdit = (item: any) => {
    setEditing(item.id);
    setEditValue(typeof item.value === 'string' ? item.value : JSON.stringify(item.value, null, 2));
    setEditDesc(item.description || '');
  };

  const saveEdit = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      let parsed: any = editValue;
      try { parsed = JSON.parse(editValue); } catch {}

      const res = await apiSend(`/api/settings/${editing}`, { value: parsed, description: editDesc });
      if (res.success !== false) {
        setEditing(null);
        await load();
      } else {
        setError(res.error || 'Lưu thất bại');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(`Xóa cài đặt "${id}"?`)) return;
    const res = await fetch(`${API_URL}/api/settings/${id}`, {
      method: 'DELETE',
      headers: await getAuthHeaders(),
    });
    const result = await res.json();
    if (result.success !== false) await load();
    else alert(result.error || 'Xóa thất bại');
  };

  const handleAdd = async () => {
    if (!newKey.trim()) return alert('Vui lòng nhập ID');
    setSaving(true);
    try {
      let parsed: any = newValue;
      try { parsed = JSON.parse(newValue); } catch {}
      const res = await apiSend(`/api/settings/${newKey}`, { value: parsed, description: newDesc }, 'PUT');
      if (res.success !== false) {
        setShowAdd(false);
        setNewKey('');
        setNewValue('');
        setNewDesc('');
        await load();
      } else {
        alert(res.error || 'Tạo thất bại');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <SettingsIcon className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-bold text-foreground">Cài đặt hệ thống</h2>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="p-2 bg-muted rounded-lg hover:bg-gray-200">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button onClick={() => setShowAdd(true)} className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Thêm
          </button>
        </div>
      </div>

      {error && <ErrorBox message={error} onRetry={load} />}

      {loading ? (
        <Loading text="Đang tải cài đặt..." />
      ) : items.length === 0 ? (
        <Empty
          title="Chưa có cài đặt nào"
          description="Nhấn Thêm để tạo cài đặt mới (ID, value JSON, mô tả)."
        />
      ) : (
        <div className="bg-card rounded-xl shadow-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-background text-left">
              <tr>
                <th className="px-4 py-3 font-medium text-foreground">ID</th>
                <th className="px-4 py-3 font-medium text-foreground">Giá trị</th>
                <th className="px-4 py-3 font-medium text-foreground">Mô tả</th>
                <th className="px-4 py-3 font-medium text-foreground text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-t hover:bg-background">
                  <td className="px-4 py-3 font-mono text-xs">{item.id}</td>
                  <td className="px-4 py-3">
                    {editing === item.id ? (
                      <textarea
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-full px-2 py-1 border rounded font-mono text-xs"
                        rows={3}
                      />
                    ) : (
                      <pre className="text-xs bg-background px-2 py-1 rounded max-w-xs overflow-auto">
                        {typeof item.value === 'string' ? item.value : JSON.stringify(item.value)}
                      </pre>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {editing === item.id ? (
                      <input
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                        className="w-full px-2 py-1 border rounded text-sm"
                      />
                    ) : (
                      <span className="text-muted-foreground">{item.description || '—'}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {editing === item.id ? (
                      <div className="flex justify-end gap-1">
                        <button onClick={saveEdit} disabled={saving} className="p-1 text-primary hover:bg-success-subtle rounded">
                          <Save className="w-4 h-4" />
                        </button>
                        <button onClick={() => setEditing(null)} className="p-1 text-muted-foreground hover:bg-muted rounded">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-end gap-1">
                        <button onClick={() => startEdit(item)} className="p-1 text-info hover:bg-info-subtle rounded">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="p-1 text-danger hover:bg-danger-subtle rounded">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">Thêm cài đặt</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">ID (khóa)</label>
                <input
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  placeholder="vd: min_deposit"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Giá trị (JSON hoặc chuỗi)</label>
                <textarea
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  placeholder='{"min": 100000}'
                  rows={4}
                  className="w-full px-3 py-2 border rounded-lg font-mono text-xs"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Mô tả</label>
                <input
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Mô tả cài đặt"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={handleAdd} disabled={saving} className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-primary disabled:opacity-50">
                {saving ? 'Đang lưu...' : 'Lưu'}
              </button>
              <button onClick={() => setShowAdd(false)} className="flex-1 border py-2 rounded-lg hover:bg-background">Hủy</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSettings;
