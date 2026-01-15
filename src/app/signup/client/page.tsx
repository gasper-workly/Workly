'use client';

import SignupForm from '@/app/components/SignupForm';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { signup, AuthError } from '@/app/lib/auth';
import { useTranslation } from '@/app/hooks/useTranslation';

export default function ClientSignup() {
  const router = useRouter();
  const { t } = useTranslation();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: {
    fullName: string;
    email: string;
    password: string;
    dateOfBirth: string;
    phone?: string;
    role: 'client' | 'provider';
  }) => {
    setError('');
    setLoading(true);
    
    try {
      await signup({
        email: data.email,
        password: data.password,
        name: data.fullName,
        role: 'client',
        phone: data.phone,
      });
      
      // Success! Go to onboarding
      router.replace('/onboarding/client/1');
    } catch (err) {
      if (err instanceof AuthError) {
        setError(err.message);
      } else {
        setError(t('auth.common.genericError'));
      }
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-violet-50">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link href="/" className="text-violet-600 hover:text-violet-700 text-sm">
            {t('auth.common.backToHome')}
          </Link>
          <h1 className="mt-6 text-3xl font-bold tracking-tight text-black">
            {t('auth.signup.client.title')}
          </h1>
          <p className="mt-2 text-black">
            {t('auth.signup.client.subtitle')}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <SignupForm defaultRole="client" onSubmit={handleSubmit} />

        {loading && (
          <p className="text-center text-sm text-violet-600">{t('auth.signup.creatingAccount')}</p>
        )}

        <p className="text-center text-sm text-black">
          {t('auth.common.alreadyHaveAccount')}{' '}
          <Link href="/login?role=client" className="text-violet-600 hover:text-violet-700">
            {t('auth.common.login')}
          </Link>
        </p>
      </div>
    </main>
  );
}
