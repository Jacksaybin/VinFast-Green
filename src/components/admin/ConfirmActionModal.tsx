/**
 * ConfirmActionModal — Modal bắt buộc nhập lý do trước khi thực hiện hành động admin
 * Dùng cho: duyệt nạp, từ chối nạp, duyệt rút, từ chối rút, điều chỉnh số dư, ...
 */

import React, { useEffect, useState } from 'react';
import { X, AlertTriangle, Check, Ban } from 'lucide-react';

export type ConfirmActionVariant = 'approve' | 'reject';

export interface ConfirmActionModalProps {
  open: boolean;
  variant: ConfirmActionVariant;
  title?: string;
  description?: string;
  txReference?: string;
  txAmount?: string;
  userName?: string;
  userPhone?: string;
  requirePhrase?: string;
  minLength?: number;
  onConfirm: (reason: string) => Promise<boolean> | boolean;
  onClose: () => void;
  loading?: boolean;
}

const VARIANT_CONFIG: Record<
  ConfirmActionVariant,
  {
    label: string;
    defaultTitle: string;
    actionLabel: string;
    icon: typeof Check;
    color: string;
    btnColor: string;
    btnHover: string;
    accentBg: string;
  }
> = {
  approve: {
    label: 'duyệt',
    defaultTitle: 'Xác nhận duyệt giao dịch',
    actionLabel: 'Xác nhận duyệt',
    icon: Check,
    color: 'text-green-600',
    btnColor: 'bg-green-600',
    btnHover: 'hover:bg-green-700',
    accentBg: 'bg-green-50',
  },
  reject: {
    label: 'từ chối',
    defaultTitle: 'Xác nhận từ chối giao dịch',
    actionLabel: 'Xác nhận từ chối',
    icon: Ban,
    color: 'text-red-600',
    btnColor: 'bg-red-600',
    btnHover: 'hover:bg-red-700',
    accentBg: 'bg-red-50',
  },
};

const SUGGESTIONS: Record<ConfirmActionVariant, string[]> = {
  approve: [
    'Đã nhận được chuyển khoản đúng số tiền',
    'Đối soát ngân hàng khớp lệnh',
    'Xác minh OTP/Mã giao dịch thành công',
  ],
  reject: [
    'Chưa nhận được chuyển khoản từ khách hàng',
    'Số tiền chuyển khoản không khớp yêu cầu',
    'Thông tin tài khoản không trùng khớp KYC',
    'Giao dịch trùng lặp / nghi ngờ gian lận',
    'Số dư không đủ hoặc tài khoản bị hạn chế',
  ],
};

export const ConfirmActionModal: React.FC<ConfirmActionModalProps> = ({
  open,
  variant,
  title,
  description,
  txReference,
  txAmount,
  userName,
  userPhone,
  requirePhrase,
  minLength = 5,
  onConfirm,
  onClose,
  loading = false,
}) => {
  const [reason, setReason] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const config = VARIANT_CONFIG[variant];
  const Icon = config.icon;

  useEffect(() => {
    if (!open) {
      setReason('');
      setConfirmText('');
      setError('');
      setSubmitting(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !submitting && !loading) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, submitting, loading, onClose]);

  if (!open) return null;

  const trimmed = reason.trim();
  const isLongEnough = trimmed.length >= minLength;
  const phraseOk = requirePhrase ? confirmText.trim() === requirePhrase : true;
  const canSubmit = isLongEnough && phraseOk && !submitting && !loading;

  const handleSubmit = async () => {
    if (!canSubmit) {
      if (!isLongEnough) setError(`Lý do phải có ít nhất ${minLength} ký tự`);
      else if (!phraseOk) setError(`Vui lòng nhập "${requirePhrase}" để xác nhận`);
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const ok = await onConfirm(trimmed);
      if (ok) {
        onClose();
      } else {
        setError('Thao tác thất bại, vui lòng thử lại');
      }
    } catch (e: any) {
      setError(e?.message || 'Có lỗi xảy ra');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget && !submitting && !loading) onClose();
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className={`flex items-center justify-between px-5 py-4 ${config.accentBg} border-b`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full bg-white flex items-center justify-center ${config.color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">{title || config.defaultTitle}</h3>
          </div>
          <button
            onClick={onClose}
            disabled={submitting || loading}
            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
          {description && (
            <p className="text-sm text-gray-600">{description}</p>
          )}

          {/* Tx summary */}
          {(txReference || txAmount || userName) && (
            <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-1.5">
              {userName && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Người dùng</span>
                  <span className="font-medium text-gray-900">
                    {userName}
                    {userPhone && <span className="text-gray-500"> · {userPhone}</span>}
                  </span>
                </div>
              )}
              {txAmount && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Số tiền</span>
                  <span className="font-bold text-gray-900">{txAmount}</span>
                </div>
              )}
              {txReference && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Mã giao dịch</span>
                  <span className="font-mono text-xs text-gray-700">{txReference}</span>
                </div>
              )}
            </div>
          )}

          {variant === 'reject' && (
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800">
                Hành động từ chối sẽ được thông báo cho người dùng kèm lý do bạn nhập bên dưới.
              </p>
            </div>
          )}

          {/* Reason input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Lý do {config.label} <span className="text-red-500">*</span>
              <span className="text-gray-400 font-normal ml-2">(tối thiểu {minLength} ký tự)</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError('');
              }}
              placeholder={`Nhập lý do ${config.label} giao dịch này...`}
              rows={4}
              maxLength={500}
              disabled={submitting || loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 resize-none"
            />
            <div className="flex justify-between items-center mt-1">
              <span className={`text-xs ${trimmed.length >= minLength ? 'text-green-600' : 'text-gray-400'}`}>
                {trimmed.length}/{minLength} ký tự tối thiểu
              </span>
              <span className="text-xs text-gray-400">{trimmed.length}/500</span>
            </div>
          </div>

          {/* Suggestions */}
          <div>
            <p className="text-xs text-gray-500 mb-1.5">Gợi ý nhanh:</p>
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTIONS[variant].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setReason(s)}
                  disabled={submitting || loading}
                  className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full disabled:opacity-50"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Double confirm for high-risk action */}
          {requirePhrase && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 space-y-2">
              <p className="text-xs text-red-700 font-medium">
                Hành động quan trọng — vui lòng xác nhận
              </p>
              <p className="text-xs text-red-600">
                Nhập chính xác cụm từ <span className="font-mono font-bold">{requirePhrase}</span> để tiếp tục:
              </p>
              <input
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={requirePhrase}
                disabled={submitting || loading}
                className="w-full px-3 py-2 border border-red-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-gray-50 border-t flex gap-2">
          <button
            onClick={onClose}
            disabled={submitting || loading}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 text-sm font-medium disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            data-testid={`confirm-${variant}`}
            className={`flex-1 px-4 py-2 text-white rounded-lg text-sm font-medium ${config.btnColor} ${config.btnHover} disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {submitting || loading ? 'Đang xử lý...' : config.actionLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmActionModal;
