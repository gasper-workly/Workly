'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/app/components/DashboardLayout';
import ServiceRequestForm, { ServiceRequestData } from '@/app/components/ServiceRequestForm';
import { useAuth } from '@/app/hooks/useAuth';
import { useTranslation } from '@/app/hooks/useTranslation';
import { createJob } from '@/app/lib/jobs';
import { uploadImageAndGetPublicUrl } from '@/app/lib/uploads';

export default function NewRequestPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (data: ServiceRequestData) => {
    if (!user) {
      setError(t('newRequest.error.loginRequired'));
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Upload images (if any) and store public URLs on the job
      const imageUrls: string[] = [];
      if (data.images && data.images.length > 0) {
        for (const file of data.images) {
          const url = await uploadImageAndGetPublicUrl({ file, folder: 'jobs' });
          imageUrls.push(url);
        }
      }

      // Create the job in Supabase
      await createJob({
        client_id: user.id,
        title: data.title,
        description: data.description,
        category: data.category,
        location: data.location, // Approximate area name
        latitude: data.latitude, // Fuzzy latitude
        longitude: data.longitude, // Fuzzy longitude
        budget_min: data.isNegotiable ? undefined : (data.price || undefined),
        budget_max: data.isNegotiable ? undefined : (data.price || undefined),
        is_negotiable: data.isNegotiable,
        images: imageUrls,
      });

      // TODO: Store exact location separately for privacy
      // For now, only fuzzy location is stored in jobs table
      // Exact location will be shared via chat when client chooses

      // Redirect back to dashboard
      router.push('/dashboard/client');
    } catch (err) {
      console.error('Error creating request:', err);
      setError(t('newRequest.error.submitFailed'));
      setIsSubmitting(false);
    }
  };

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <DashboardLayout userRole="client" userName={t('common.loadingUser')}>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  // Redirect if not logged in (middleware should handle this, but just in case)
  if (!user) {
    router.push('/login?role=client');
    return null;
  }

  return (
    <DashboardLayout userRole="client" userName={user.name}>
      <div 
        className="max-w-2xl mx-auto -mx-3 sm:-mx-4 lg:-mx-6 -my-4 -mb-28 px-3 sm:px-4 lg:px-6 pt-4 pb-32 relative min-h-screen bg-gray-50"
      >
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-black mb-2">{t('newRequest.title')}</h1>
          <p className="text-black">
            {t('newRequest.subtitle')}
          </p>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] p-6">
          <ServiceRequestForm
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
