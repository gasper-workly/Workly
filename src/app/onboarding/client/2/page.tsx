'use client';

import { useRouter } from 'next/navigation';
import {
  CheckCircleIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import { useTranslation } from '@/app/hooks/useTranslation';

export default function ClientOnboardingStep2() {
  const router = useRouter();
  const { t } = useTranslation();

  const handleSkip = async () => {
    try {
      await fetch('/api/users/me/onboarded', { method: 'POST' });
    } catch {}
    router.replace('/dashboard/client');
  };

  const handleNext = () => {
    router.push('/onboarding/client/3');
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-between bg-white">
      <div className="w-full max-w-md mx-auto px-6 pt-16 pb-6">
        <h1 className="text-3xl font-bold text-black leading-tight whitespace-pre-line">
          {t('onboarding.client.step2.title')}
        </h1>

        <div className="mt-8 space-y-6">
          <div className="flex items-start gap-3">
            <CheckCircleIcon className="h-7 w-7 text-violet-600 shrink-0" />
            <p className="text-black text-lg">{t('onboarding.client.step2.bullet1')}</p>
          </div>

          <div className="flex items-start gap-3">
            <UserCircleIcon className="h-7 w-7 text-violet-600 shrink-0" />
            <p className="text-black text-lg">{t('onboarding.client.step2.bullet2')}</p>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircleIcon className="h-7 w-7 text-violet-600 shrink-0" />
            <p className="text-black text-lg">{t('onboarding.client.step2.bullet3')}</p>
          </div>
        </div>
      </div>

      <div className="w-full max-w-md mx-auto px-6 pb-8">
        <div className="flex items-center justify-between">
          <button
            onClick={handleSkip}
            className="text-sm font-medium text-violet-700 hover:text-violet-800"
          >
            {t('onboarding.common.skip')}
          </button>
          <button
            onClick={handleNext}
            className="inline-flex items-center px-5 py-2.5 rounded-md bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700"
          >
            {t('onboarding.common.next')}
          </button>
        </div>
      </div>
    </main>
  );
}


