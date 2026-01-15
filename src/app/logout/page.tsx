'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { logout } from '@/app/lib/auth';

export default function LogoutPage() {
  const router = useRouter();
  const [status, setStatus] = useState('Logging out...');

  useEffect(() => {
    const doLogout = async () => {
      try {
        await logout();
        setStatus('Logged out! Redirecting...');
        // Small delay so user sees the message
        setTimeout(() => {
          router.push('/');
        }, 1000);
      } catch (error) {
        setStatus('Error logging out. Redirecting anyway...');
        setTimeout(() => {
          router.push('/');
        }, 1500);
      }
    };

    doLogout();
  }, [router]);

  return (
    <div className="min-h-screen bg-violet-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600 mx-auto mb-4"></div>
        <p className="text-gray-700">{status}</p>
      </div>
    </div>
  );
}

