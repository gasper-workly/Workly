'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import LoginForm from '@/app/components/LoginForm';
import { login, AuthError } from '@/app/lib/auth';
import { useTranslation } from '@/app/hooks/useTranslation';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Get the role from URL parameters, default to 'client'
  const roleParam = searchParams.get('role') || 'client';

  const handleSubmit = async (email: string, password: string) => {
    setIsLoading(true);
    setError('');

    try {
      const user = await login({ email, password });
      // Redirect to the user's actual role dashboard
      router.push(`/dashboard/${user.role}`);
    } catch (err) {
      if (err instanceof AuthError) {
        setError(err.message);
      } else {
        setError(t('auth.login.invalidCredentials'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="mt-6 text-3xl font-bold tracking-tight text-black text-center">
          {t('auth.login.title')}
        </h1>
        <p className="mt-2 text-black text-center">
          {roleParam === 'provider' ? t('auth.login.subtitleProvider') : t('auth.login.subtitleClient')}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm rounded-lg sm:px-10 border border-violet-100">
          <LoginForm onSubmit={handleSubmit} isLoading={isLoading} error={error} />
          
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-black">{t('auth.common.or')}</span>
              </div>
            </div>

            <div className="mt-6 flex flex-col space-y-4">
              <p className="text-center text-sm text-black">
                {t('auth.login.noAccount')}{' '}
                <Link
                  href={`/signup/${roleParam}`}
                  className="font-medium text-violet-600 hover:text-violet-500"
                >
                  {t('auth.login.signUpNow')}
                </Link>
              </p>

              <div className="text-center">
                <Link
                  href={`/login?role=${roleParam === 'client' ? 'provider' : 'client'}`}
                  className="text-sm font-medium text-violet-600 hover:text-violet-500"
                >
                  {roleParam === 'client' 
                    ? t('auth.login.switchToProvider')
                    : t('auth.login.switchToClient')
                  }
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const { t } = useTranslation();
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">{t('common.loading')}</p>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
