'use client';

import Link from 'next/link';
import { useTranslation } from '@/app/hooks/useTranslation';

export default function Home() {
  const { t } = useTranslation();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8">
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-bold leading-none mb-0">
          {t('home.welcomeTo')}
        </h1>
        <img src="/workly-logo.png" alt="WorklyNow" className="-mt-15 md:-mt-17 mx-auto h-40 md:h-56 w-auto" />
        <p className="text-xl md:text-2xl text-black max-w-2xl mx-auto">
          {t('home.subtitle')}
        </p>
      </div>

      <div className="-mt-23 md:-mt-16 grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        {/* Provider Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-violet-100 hover:border-violet-300 transition-colors">
          <h2 className="text-2xl font-semibold text-black mb-4">
            {t('home.providerCard.title')}
          </h2>
          <p className="text-black mb-6">
            {t('home.providerCard.subtitle')}
          </p>
          <div className="space-y-4">
            <Link
              href="/signup/provider"
              className="flex items-center justify-center w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
            >
              {t('home.providerCard.signup')}
            </Link>
            <Link
              href="/login?role=provider"
              className="flex items-center justify-center w-full px-4 py-2 border border-violet-300 rounded-md shadow-sm text-base font-medium text-violet-600 bg-white hover:bg-violet-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
            >
              {t('home.providerCard.login')}
            </Link>
          </div>
        </div>

        {/* Client Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-violet-100 hover:border-violet-300 transition-colors">
          <h2 className="text-2xl font-semibold text-black mb-4">
            {t('home.clientCard.title')}
          </h2>
          <p className="text-black mb-6">
            {t('home.clientCard.subtitle')}
          </p>
          <div className="space-y-4">
            <Link
              href="/signup/client"
              className="flex items-center justify-center w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
            >
              {t('home.clientCard.signup')}
            </Link>
            <Link
              href="/login?role=client"
              className="flex items-center justify-center w-full px-4 py-2 border border-violet-300 rounded-md shadow-sm text-base font-medium text-violet-600 bg-white hover:bg-violet-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
            >
              {t('home.clientCard.login')}
            </Link>
          </div>
        </div>
    </div>
    </main>
  );
}
