'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import DashboardLayout from '@/app/components/DashboardLayout';
import UserAvatar from '@/app/components/UserAvatar';
import { 
  ChatBubbleLeftIcon, 
  CheckCircleIcon,
  ClockIcon,
  StarIcon,
  XMarkIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { useAuth } from '@/app/hooks/useAuth';
import { updateProfile } from '@/app/lib/auth';
import { uploadAvatarAndGetPublicUrl } from '@/app/lib/avatars';
import { getClientJobs } from '@/app/lib/jobs';
import { getClientReviews } from '@/app/lib/reviews';

// Activity item type
interface ActivityItem {
  id: string;
  type: 'request_created' | 'request_assigned' | 'service_completed' | 'review_given' | 'request_cancelled';
  title: string;
  date: string;
  price?: number;
  providerName?: string;
  rating?: number;
  comment?: string;
}

function ActivityItemComponent({ activity }: { activity: ActivityItem }) {
  const getActivityIcon = () => {
    switch (activity.type) {
      case 'request_created':
        return <ClockIcon className="h-6 w-6 text-blue-500" />;
      case 'request_assigned':
        return <ChatBubbleLeftIcon className="h-6 w-6 text-violet-500" />;
      case 'service_completed':
        return <CheckCircleIcon className="h-6 w-6 text-green-500" />;
      case 'review_given':
        return <StarIcon className="h-8 w-8 text-yellow-500" />;
      case 'request_cancelled':
        return <XMarkIcon className="h-6 w-6 text-red-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  return (
    <div className="flex items-start gap-4 p-4 hover:bg-gray-50 transition-colors">
      <div className="shrink-0">{getActivityIcon()}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-medium text-black">{activity.title}</p>
            <p className="text-sm text-black">
              {activity.type === 'request_created' && 'Created new service request'}
              {activity.type === 'request_assigned' && `Assigned to ${activity.providerName}`}
              {activity.type === 'service_completed' && `Service completed by ${activity.providerName}`}
              {activity.type === 'request_cancelled' && 'Request cancelled'}
              {activity.type === 'review_given' && `Reviewed ${activity.providerName}`}
            </p>
            {activity.rating != null && activity.rating > 0 && (
              <div className="flex items-center mt-1">
                {[...Array(5)].map((_, i) => (
                  <StarIconSolid
                    key={i}
                    className={`h-6 w-6 ${
                      i < activity.rating! ? 'text-yellow-400' : 'text-gray-200'
                    }`}
                  />
                ))}
                {activity.comment && (
                  <p className="ml-2 text-sm text-gray-600 italic">&quot;{activity.comment}&quot;</p>
                )}
              </div>
            )}
          </div>
          <div className="text-right shrink-0">
            <p className="text-sm text-gray-500">{formatDate(activity.date)}</p>
            {typeof activity.price === 'number' && !isNaN(activity.price) && activity.price > 0 && (
              <p className="text-sm font-medium text-violet-600">{activity.price} €</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfilePageContent() {
  const searchParams = useSearchParams();
  const startEditing = searchParams.get('edit') === '1';
  const { user, loading: authLoading, refresh: refreshAuth } = useAuth();
  const [isEditing, setIsEditing] = useState(startEditing);
  const [newImage, setNewImage] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [editableData, setEditableData] = useState({
    name: '',
    bio: '',
    phone: '',
    imageUrl: '',
  });
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [showAllActivities, setShowAllActivities] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login?role=client');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user) return;
    setEditableData({
      name: user.name,
      bio: user.bio || '',
      phone: user.phone || '',
      imageUrl: user.avatar_url || '',
    });
  }, [user]);

  // Fetch real activity data from jobs and reviews
  useEffect(() => {
    const loadActivities = async () => {
      if (!user) return;
      
      try {
        const [jobs, reviews] = await Promise.all([
          getClientJobs(user.id),
          getClientReviews(user.id),
        ]);

        const activityItems: ActivityItem[] = [];

        // Transform jobs into activity items
        for (const job of jobs) {
          // Job created
          activityItems.push({
            id: `job-created-${job.id}`,
            type: 'request_created',
            title: job.title,
            date: job.created_at,
            price: job.budget_max || job.budget_min || undefined,
          });

          // Job assigned (has provider)
          if (job.provider_id && job.provider) {
            activityItems.push({
              id: `job-assigned-${job.id}`,
              type: 'request_assigned',
              title: job.title,
              date: job.updated_at,
              price: job.budget_max || job.budget_min || undefined,
              providerName: job.provider.name,
            });
          }

          // Job completed
          if (job.status === 'completed') {
            activityItems.push({
              id: `job-completed-${job.id}`,
              type: 'service_completed',
              title: job.title,
              date: job.updated_at,
              price: job.budget_max || job.budget_min || undefined,
              providerName: job.provider?.name,
            });
          }

          // Job cancelled
          if (job.status === 'cancelled') {
            activityItems.push({
              id: `job-cancelled-${job.id}`,
              type: 'request_cancelled',
              title: job.title,
              date: job.updated_at,
              price: job.budget_max || job.budget_min || undefined,
            });
          }
        }

        // Transform reviews into activity items
        for (const review of reviews) {
          activityItems.push({
            id: `review-${review.id}`,
            type: 'review_given',
            title: review.job?.title || 'Job',
            date: review.created_at,
            providerName: review.provider?.name,
            rating: review.rating,
            comment: review.comment || undefined,
          });
        }

        // Sort by date (newest first)
        activityItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        // Filter out activities older than 2 weeks
        const twoWeeksAgo = new Date();
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
        const recentActivities = activityItems.filter(
          (activity) => new Date(activity.date) >= twoWeeksAgo
        );

        setActivities(recentActivities);
      } catch (error) {
        console.error('Error loading activities:', error);
      } finally {
        setActivitiesLoading(false);
      }
    };

    if (user) {
      loadActivities();
    }
  }, [user]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewImage(file);
      const previewUrl = URL.createObjectURL(file);
      setEditableData(prev => ({ ...prev, imageUrl: previewUrl }));
    }
  };

  const handleSave = async () => {
    try {
      if (!user) return;

      // Build updates object - only include avatar_url if we have a new image
      const updates: { name: string; phone?: string; bio?: string; avatar_url?: string } = {
        name: editableData.name,
      };
      
      if (editableData.phone) updates.phone = editableData.phone;
      if (editableData.bio) updates.bio = editableData.bio;

      // Upload new avatar if selected
      if (newImage) {
        try {
          const avatarUrl = await uploadAvatarAndGetPublicUrl({ userId: user.id, file: newImage });
          updates.avatar_url = avatarUrl;
        } catch (uploadError: unknown) {
          const message = uploadError instanceof Error ? uploadError.message : 'Unknown error';
          console.error('Avatar upload failed:', uploadError);
          alert(`Failed to upload profile picture: ${message}`);
          return;
        }
      }

      await updateProfile(updates);
      await refreshAuth();

      setNewImage(null);
      setIsEditing(false);
      // Remove edit flag from URL
      router.replace('/dashboard/client/profile');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile. Please try again.');
    }
  };

  // Show loading state
  if (authLoading) {
    return (
      <DashboardLayout userRole="client" userName="Loading...">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  // Redirect if not logged in
  if (!user) return null;

  return (
    <DashboardLayout userRole="client" userName={user.name}>
      <div 
        className="max-w-3xl mx-auto space-y-6 -mx-3 sm:-mx-4 lg:-mx-6 -my-4 -mb-28 px-3 sm:px-4 lg:px-6 pt-4 pb-32 relative min-h-screen bg-gray-50"
      >
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-black">My Profile</h1>
          <div className="flex items-center gap-2">
            {isEditing && (
              <button
                onClick={handleSave}
                className="inline-flex items-center px-3 py-1.5 rounded-md bg-violet-600 text-white text-xs font-semibold hover:bg-violet-700"
              >
                Done
              </button>
            )}
            <button
              onClick={() => router.push('/dashboard/client/settings')}
              className="inline-flex items-center justify-center p-2 border border-gray-200 rounded-full shadow-sm text-violet-600 bg-white hover:bg-violet-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
              aria-label="Open settings"
            >
              <Cog6ToothIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Profile Content */}
        <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] overflow-hidden">
          {/* Top strip with avatar and quick info */}
          <div className="bg-violet-50/80 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-300">
            <div className="flex items-center gap-4">
              <div className="group relative">
                <UserAvatar
                  imageUrl={editableData.imageUrl || user.avatar_url}
                  name={user.name}
                  role="client"
                  completedRequests={user.completed_requests}
                  size="lg"
                  showInfo
                />
                {isEditing && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Change Photo
                  </button>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>
              <div>
                <p className="text-base font-semibold text-black">{user.name}</p>
                <p className="text-xs text-gray-600 mt-0.5">
                  Regular client • {user.completed_requests} requests completed
                </p>
              </div>
            </div>
            <div className="text-sm text-right text-gray-600">
              <p className="font-medium text-black">Profile</p>
              <p className="mt-0.5">Member since {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</p>
            </div>
          </div>

          {/* Details grid */}
          <div className="px-6 py-5 grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold text-violet-700 bg-violet-50">
                  Details
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-black">Full Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editableData.name}
                    onChange={(e) => setEditableData(prev => ({ ...prev, name: e.target.value }))}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-black shadow-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                ) : (
                  <p className="mt-1 text-black">{user.name}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-black">Email</label>
                <p className="mt-1 text-black">{user.email}</p>
              </div>
              {(isEditing || editableData.phone) && (
                <div>
                  <label className="block text-sm font-medium text-black">Telephone (optional)</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editableData.phone}
                      onChange={(e) => setEditableData((prev) => ({ ...prev, phone: e.target.value }))}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-black shadow-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                      placeholder="Add your phone number for easier contact"
                    />
                  ) : (
                    <p className="mt-1 text-black">{editableData.phone || 'Not provided'}</p>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold text-violet-700 bg-violet-50">
                  About
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-black">Bio</label>
                {isEditing ? (
                  <textarea
                    value={editableData.bio}
                    onChange={(e) => setEditableData(prev => ({ ...prev, bio: e.target.value }))}
                    maxLength={200}
                    rows={4}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-black shadow-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                    placeholder="Tell others a bit about yourself..."
                  />
                ) : (
                  <p className="mt-1 text-black">{editableData.bio || user.bio || ''}</p>
                )}
                {isEditing && (
                  <p className="mt-1 text-sm text-black">
                    {200 - editableData.bio.length} characters remaining
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-300">
            <h2 className="text-lg font-semibold text-black">Recent Activity</h2>
          </div>
          <div className="divide-y divide-gray-300">
            {activitiesLoading ? (
              <div className="p-6 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-violet-600 mx-auto mb-2"></div>
                <p className="text-sm text-gray-500">Loading activity...</p>
              </div>
            ) : activities.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <p>No activity yet.</p>
                <p className="text-sm mt-1">Your job requests and reviews will appear here.</p>
              </div>
            ) : (
              <>
                {(showAllActivities ? activities : activities.slice(0, 5)).map((activity) => (
                  <ActivityItemComponent key={activity.id} activity={activity} />
                ))}
                {activities.length > 5 && (
                  <div className="p-4 text-center border-t border-gray-100">
                    <button
                      onClick={() => setShowAllActivities(!showAllActivities)}
                      className="text-violet-600 hover:text-violet-700 font-medium text-sm"
                    >
                      {showAllActivities ? 'Show less' : `See all (${activities.length} activities)`}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div></div>}>
      <ProfilePageContent />
    </Suspense>
  );
}