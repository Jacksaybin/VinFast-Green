/**
 * Personal Information page component - User profile management
 * Dữ liệu thật từ authStore/backend, kèm đổi mật khẩu
 */

import React, { useEffect, useState } from 'react';
import { ArrowLeft, User, Phone, Mail, Camera, Edit, Save, X, CheckCircle, Eye, EyeOff, Lock, KeyRound } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../stores/authStore';

const PersonalInfo: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, updateProfile } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [showSensitive, setShowSensitive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    bankAccount: '',
    bankName: '',
    bankBranch: '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        fullName: user.fullName || '',
        email: user.email || '',
        bankAccount: (user as any).bankAccount || '',
        bankName: (user as any).bankName || '',
        bankBranch: (user as any).bankBranch || '',
      });
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">{t('personalInfo.loginRequired')}</p>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev: any) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors: any = {};
    if (!form.fullName.trim()) newErrors.fullName = t('personalInfo.errors.fullNameRequired');
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = t('personalInfo.errors.emailInvalid');
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setIsLoading(true);
    setErrors({});

    updateProfile({
      fullName: form.fullName,
      email: form.email,
      bankAccount: form.bankAccount,
      bankName: form.bankName,
      bankBranch: form.bankBranch,
    });

    setIsLoading(false);
    setIsEditing(false);
    alert(t('personalInfo.updateSuccess'));
  };

  const handleCancel = () => {
    if (user) {
      setForm({
        fullName: user.fullName || '',
        email: user.email || '',
        bankAccount: (user as any).bankAccount || '',
        bankName: (user as any).bankName || '',
        bankBranch: (user as any).bankBranch || '',
      });
    }
    setErrors({});
    setIsEditing(false);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (passwordForm.newPassword.length < 6) {
      setPasswordError(t('personalInfo.passwordMin'));
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError(t('personalInfo.passwordMismatch'));
      return;
    }

    setIsChangingPassword(true);
    try {
      const { authApi } = await import('../lib/api');
      const result = await authApi.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      if (result.success) {
        setPasswordSuccess(t('personalInfo.passwordSuccess'));
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setPasswordError(result.error || t('personalInfo.passwordFail'));
      }
    } catch {
      setPasswordError(t('personalInfo.passwordConnectionError'));
    }
    setIsChangingPassword(false);
  };

  const formatCurrency = (amount: string) => {
    if (!amount) return '';
    return `${parseInt(amount).toLocaleString()} VND`;
  };

  const getMaskedInfo = (info: string, showCount = 4) => {
    if (!info) return '';
    if (showSensitive) return info;
    return '*'.repeat(Math.max(0, info.length - showCount)) + info.slice(-showCount);
  };

  const inputClass = (hasError = false) =>
    `w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
      hasError ? 'border-danger' : 'border-input'
    }`;

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-card shadow-card sticky top-0 z-10">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => navigate('/my-account')}
            className="p-2 hover:bg-muted rounded-full transition-colors"
            aria-label={t('common.back')}
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-lg font-semibold text-foreground">{t('personalInfo.title')}</h1>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`p-2 rounded-full transition-colors ${
              isEditing ? 'bg-danger-subtle text-danger' : 'bg-info-subtle text-info'
            }`}
            aria-label={isEditing ? t('common.cancel') : t('personalInfo.edit')}
          >
            {isEditing ? <X className="w-5 h-5" /> : <Edit className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <div className="relative flex h-32 items-center justify-center bg-gradient-hero">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 px-4 text-center">
          <h2 className="text-xl font-bold text-white">{t('personalInfo.accountTitle')}</h2>
          <p className="text-primary-foreground/90 text-sm">{t('personalInfo.accountDesc')}</p>
        </div>
      </div>

      <div className="px-4 pb-6">
        <div className="bg-card rounded-xl shadow-card p-6 -mt-6 relative z-10 mb-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-brand-primary-500 to-brand-accent-500">
                <span className="text-white font-bold text-2xl">
                  {form.fullName.charAt(0) || 'U'}
                </span>
              </div>
              {isEditing && (
                <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-info rounded-full flex items-center justify-center text-white hover:bg-info-strong transition-colors">
                  <Camera className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-foreground">{form.fullName}</h3>
              <p className="text-muted-foreground">{user.phone}</p>
              <div className="flex items-center space-x-2 mt-1">
                {user.kycStatus === 'approved' ? (
                  <span className="px-2 py-1 bg-success-subtle text-primary text-xs rounded-full font-medium">
                    {t('personalInfo.statusVerified')}
                  </span>
                ) : (
                  <span className="px-2 py-1 bg-warning-subtle text-warning-strong text-xs rounded-full font-medium">
                    {user.kycStatus === 'pending' ? t('personalInfo.statusPending') : t('personalInfo.statusUnverified')}
                  </span>
                )}
                <span className="px-2 py-1 bg-info-subtle text-info-strong text-xs rounded-full font-medium">
                  {t('personalInfo.referralCodeLabel')}: {user.referralCode}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl shadow-card p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">{t('personalInfo.sectionTitle')}</h3>
            <button
              onClick={() => setShowSensitive(!showSensitive)}
              className="p-2 bg-muted rounded-full hover:bg-muted/70 transition-colors"
              aria-label={t('personalInfo.toggleSensitive')}
            >
              {showSensitive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                {t('personalInfo.fullName')} <span className="text-danger">*</span>
              </label>
              {isEditing ? (
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    name="fullName"
                    value={form.fullName}
                    onChange={handleInputChange}
                    className={`${inputClass(!!errors.fullName)} pl-10`}
                  />
                  {errors.fullName && (
                    <p className="text-sm text-danger mt-1">{errors.fullName}</p>
                  )}
                </div>
              ) : (
                <p className="text-foreground">{form.fullName}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">{t('personalInfo.phone')}</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="tel"
                  value={user.phone}
                  disabled
                  className={`${inputClass()} pl-10 bg-background text-muted-foreground`}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">{t('personalInfo.email')}</label>
              {isEditing ? (
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleInputChange}
                    className={`${inputClass(!!errors.email)} pl-10`}
                  />
                  {errors.email && (
                    <p className="text-sm text-danger mt-1">{errors.email}</p>
                  )}
                </div>
              ) : (
                <p className="text-foreground">{form.email || t('personalInfo.notUpdated')}</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl shadow-card p-6 mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">{t('personalInfo.bankInfo')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">{t('personalInfo.bankName')}</label>
              {isEditing ? (
                <input
                  type="text"
                  name="bankName"
                  value={form.bankName}
                  onChange={handleInputChange}
                  className={inputClass()}
                  placeholder={t('personalInfo.bankNamePlaceholder')}
                />
              ) : (
                <p className="text-foreground">{form.bankName || t('personalInfo.notUpdated')}</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">{t('personalInfo.bankBranch')}</label>
              {isEditing ? (
                <input
                  type="text"
                  name="bankBranch"
                  value={form.bankBranch}
                  onChange={handleInputChange}
                  className={inputClass()}
                  placeholder={t('personalInfo.bankBranchPlaceholder')}
                />
              ) : (
                <p className="text-foreground">{form.bankBranch || t('personalInfo.notUpdated')}</p>
              )}
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm font-medium text-foreground">{t('personalInfo.bankAccount')}</label>
              {isEditing ? (
                <input
                  type="text"
                  name="bankAccount"
                  value={form.bankAccount}
                  onChange={handleInputChange}
                  className={inputClass()}
                  placeholder={t('personalInfo.bankAccountPlaceholder')}
                />
              ) : (
                <p className="text-foreground">{getMaskedInfo(form.bankAccount, 4) || t('personalInfo.notUpdated')}</p>
              )}
            </div>
          </div>
        </div>

        {isEditing && (
          <div className="flex space-x-3">
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="bg-gradient-primary text-primary-foreground rounded-lg py-3 font-semibold transition-all hover:shadow-glow disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Save className="w-5 h-5" />
              )}
              <span>{isLoading ? t('common.processing') : t('personalInfo.saveChanges')}</span>
            </button>
            <button
              onClick={handleCancel}
              className="px-6 py-3 border border-input text-foreground rounded-lg font-semibold hover:bg-background transition-colors flex items-center space-x-2"
            >
              <X className="w-5 h-5" />
              <span>{t('common.cancel')}</span>
            </button>
          </div>
        )}

        <div className="bg-card rounded-xl shadow-card p-6 mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center">
              <Lock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">{t('personalInfo.changePasswordTitle')}</h3>
              <p className="text-sm text-muted-foreground">{t('personalInfo.changePasswordDesc')}</p>
            </div>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">{t('personalInfo.currentPassword')}</label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
                  className={`${inputClass()} pl-10`}
                  placeholder={t('personalInfo.currentPasswordPlaceholder')}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">{t('personalInfo.newPassword')}</label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="password"
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                  className={`${inputClass()} pl-10`}
                  placeholder={t('personalInfo.newPasswordPlaceholder')}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">{t('personalInfo.confirmPassword')}</label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                  className={`${inputClass()} pl-10`}
                  placeholder={t('personalInfo.confirmPasswordPlaceholder')}
                  required
                />
              </div>
            </div>

            {passwordError && (
              <p className="text-sm text-danger bg-danger-subtle p-3 rounded-lg">{passwordError}</p>
            )}
            {passwordSuccess && (
              <p className="text-sm text-primary bg-success-subtle p-3 rounded-lg flex items-center gap-2">
                <CheckCircle className="w-4 h-4" /> {passwordSuccess}
              </p>
            )}

            <button
              type="submit"
              disabled={isChangingPassword}
              className="w-full py-3 bg-brand-accent-600 text-white rounded-lg font-semibold hover:bg-brand-accent-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isChangingPassword ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{t('common.processing')}</span>
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  <span>{t('personalInfo.changePasswordCta')}</span>
                </>
              )}
            </button>
          </form>
        </div>

        <div className="mt-6 rounded-xl bg-success-subtle border border-success/20 p-4">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-success/30 rounded-full flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-success-strong mb-1">{t('personalInfo.statusKycDesc')}</h4>
              {user.kycStatus === 'approved' ? (
                <p className="text-sm text-primary">{t('personalInfo.kycApproved')}</p>
              ) : user.kycStatus === 'pending' ? (
                <p className="text-sm text-primary">{t('personalInfo.kycPending')}</p>
              ) : (
                <p className="text-sm text-primary">{t('personalInfo.kycUnverified')}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalInfo;
