'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useTranslation } from '@/app/hooks/useTranslation';

export default function ProviderOnboardingStep3() {
  const router = useRouter();
  const { t } = useTranslation();
  const [accepted, setAccepted] = useState(false);
  const [showError, setShowError] = useState(false);

  const handleFinish = async () => {
    if (!accepted) {
      setShowError(true);
      return;
    }
    try {
      await fetch('/api/users/me/onboarded', { method: 'POST' });
    } catch {}
    router.replace('/dashboard/provider');
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-between bg-white">
      <div className="w-full max-w-md mx-auto px-6 pt-16 pb-6">
        <h1 className="text-3xl font-bold text-black leading-tight whitespace-pre-line">
          {t('onboarding.common.step3.title')}
        </h1>
        <p className="mt-3 text-black">{t('onboarding.common.step3.subtitle')}</p>

        <label className="mt-6 flex items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-black">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
            checked={accepted}
            onChange={(e) => {
              setAccepted(e.target.checked);
              if (e.target.checked) setShowError(false);
            }}
          />
          <span className="leading-5">
            {t('onboarding.common.agree.prefix')}{' '}
            <Link
              href="/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="text-violet-700 hover:text-violet-900 underline"
            >
              {t('onboarding.common.agree.terms')}
            </Link>{' '}
            {t('onboarding.common.agree.and')}{' '}
            <Link
              href="/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-violet-700 hover:text-violet-900 underline"
            >
              {t('onboarding.common.agree.privacy')}
            </Link>
            .
          </span>
        </label>

        {showError && (
          <p className="mt-2 text-sm text-red-600">{t('onboarding.common.agree.required')}</p>
        )}
      </div>

      <div
        className="w-full max-w-md mx-auto px-6"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 3rem)' }}
      >
        <button
          onClick={handleFinish}
          disabled={!accepted}
          className="w-full inline-flex items-center justify-center px-5 py-3 rounded-xl bg-violet-600 text-white text-base font-semibold hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t('onboarding.common.getStarted')}
        </button>
      </div>
    </main>
  );
}


