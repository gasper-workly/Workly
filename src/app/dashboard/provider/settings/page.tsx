'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/app/components/DashboardLayout';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/hooks/useAuth';
import { useTranslation } from '@/app/hooks/useTranslation';
import { updateProfile } from '@/app/lib/auth';

export default function ProviderSettingsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { language, setLanguage, t } = useTranslation();
  const [emailJobAlerts, setEmailJobAlerts] = useState(true);
  const [ratingUpdates, setRatingUpdates] = useState(true);

  const handleLanguageChange = async (lang: 'en' | 'sl') => {
    // Update UI immediately
    setLanguage(lang);
    // Persist to account (best-effort)
    try {
      await updateProfile({ language: lang });
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    try {
      const jobs = localStorage.getItem('provider_settings_emailJobAlerts');
      const ratings = localStorage.getItem('provider_settings_ratingUpdates');
      if (jobs !== null) setEmailJobAlerts(jobs === 'true');
      if (ratings !== null) setRatingUpdates(ratings === 'true');
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('provider_settings_emailJobAlerts', String(emailJobAlerts));
      localStorage.setItem('provider_settings_ratingUpdates', String(ratingUpdates));
    } catch {
      // ignore
    }
  }, [emailJobAlerts, ratingUpdates]);

  const renderToggle = (on: boolean, onToggle: () => void) => (
    <button
      type="button"
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors 
        ${on ? 'bg-violet-600' : 'bg-gray-300'}`}
      aria-pressed={on}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform
          ${on ? 'translate-x-5' : 'translate-x-1'}`}
      />
    </button>
  );

  // Show loading state
  if (authLoading) {
    return (
      <DashboardLayout userRole="provider" userName="Loading...">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  // Redirect if not logged in
  if (!user) {
    router.push('/login?role=provider');
    return null;
  }

  return (
    <DashboardLayout userRole="provider" userName={user.name}>
      <div 
        className="max-w-3xl mx-auto space-y-6 -mx-3 sm:-mx-4 lg:-mx-6 -my-4 -mb-28 px-3 sm:px-4 lg:px-6 pt-4 pb-32 relative min-h-screen bg-gray-50"
      >
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-black">{t('settings.title')}</h1>
        </div>

        {/* Account */}
        <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] p-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold text-violet-700 bg-violet-100">
              {t('settings.account')}
            </span>
            <button
              onClick={() => router.push('/dashboard/provider/profile?edit=1')}
              className="inline-flex items-center px-3 py-1.5 rounded-md bg-violet-600 text-white text-xs font-semibold hover:bg-violet-700"
            >
              {t('settings.account.editProfile')}
            </button>
          </div>
          <p className="text-sm text-black">
            {t('settings.account.providerDesc')}
          </p>
        </div>

        {/* Language */}
        <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] p-5">
          <div className="mb-3">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold text-violet-700 bg-violet-100">
              {t('settings.language')}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleLanguageChange('en')}
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                language === 'en'
                  ? 'bg-violet-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t('settings.language.english')}
            </button>
            <button
              type="button"
              onClick={() => handleLanguageChange('sl')}
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                language === 'sl'
                  ? 'bg-violet-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t('settings.language.slovenian')}
            </button>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] p-5 space-y-4">
          <div className="mb-1">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold text-violet-700 bg-violet-100">
              {t('settings.notifications')}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-black">{t('settings.notifications.emailJobAlerts')}</p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-600">
                {emailJobAlerts ? t('settings.toggle.on') : t('settings.toggle.off')}
              </span>
              {renderToggle(emailJobAlerts, () => setEmailJobAlerts(v => !v))}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-black">{t('settings.notifications.ratingUpdates')}</p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-600">
                {ratingUpdates ? t('settings.toggle.on') : t('settings.toggle.off')}
              </span>
              {renderToggle(ratingUpdates, () => setRatingUpdates(v => !v))}
            </div>
          </div>
        </div>

        {/* Legal */}
        <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] p-5">
          <div className="mb-2">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold text-violet-700 bg-violet-100">
              {t('settings.legal')}
            </span>
          </div>
          <div className="space-y-2">
            <Link
              href="/terms"
              className="block text-sm text-violet-700 hover:text-violet-900 underline"
            >
              {t('settings.legal.terms')}
            </Link>
            <Link
              href="/privacy"
              className="block text-sm text-violet-700 hover:text-violet-900 underline"
            >
              {t('settings.legal.privacy')}
            </Link>
          </div>
        </div>

        {/* Support */}
        <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] p-5">
          <div className="mb-2">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold text-violet-700 bg-violet-100">
              {t('settings.support')}
            </span>
          </div>
          <p className="text-sm text-black mb-2">
            {t('settings.support.ctaProvider')}
          </p>
          <a
            href="mailto:official.workly@gmail.com"
            className="text-sm text-violet-700 hover:text-violet-900 underline"
          >
            {t('settings.support.email')}
          </a>
        </div>
      </div>
    </DashboardLayout>
  );
}

