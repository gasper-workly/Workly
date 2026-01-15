'use client';

import { useState } from 'react';
import Image from 'next/image';
import { StarIcon } from '@heroicons/react/24/solid';

interface UserAvatarProps {
  imageUrl?: string;
  name: string;
  role: 'client' | 'provider';
  completedRequests: number;
  size?: 'sm' | 'md' | 'lg';
  showInfo?: boolean;
  onClick?: () => void;
}

export default function UserAvatar({
  imageUrl,
  name,
  role,
  completedRequests,
  size = 'md',
  showInfo = false,
  onClick,
}: UserAvatarProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  // Size mappings
  const sizeClasses = {
    sm: 'h-8 w-8 text-sm',
    md: 'h-12 w-12 text-base',
    lg: 'h-16 w-16 text-lg',
  };

  // Get provider ranking details
  const getProviderRanking = () => {
    if (completedRequests >= 30) {
      return {
        stars: 3,
        border: 'border-2 border-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)]',
        tooltip: 'Expert',
      };
    } else if (completedRequests >= 15) {
      return {
        stars: 2,
        border: 'border-2 border-yellow-400',
        tooltip: 'Trusted',
      };
    } else if (completedRequests >= 5) {
      return {
        stars: 1,
        border: 'border-2 border-violet-500',
        tooltip: 'Verified',
      };
    }
    return {
      stars: 0,
      border: 'border-2 border-gray-300',
      tooltip: 'New',
    };
  };

  // Get client badge details
  const getClientBadge = () => {
    if (completedRequests >= 11) {
      return {
        text: 'Trusted',
        color: 'bg-violet-600',
        textColor: 'text-white',
      };
    } else if (completedRequests >= 6) {
      return {
        text: 'Regular',
        color: 'bg-violet-100',
        textColor: 'text-violet-700',
      };
    } else if (completedRequests >= 3) {
      return {
        text: 'Verified',
        color: 'bg-gray-100',
        textColor: 'text-gray-700',
      };
    }
    return null;
  };

  const providerRanking = role === 'provider' ? getProviderRanking() : null;
  const clientBadge = role === 'client' ? getClientBadge() : null;

  // Generate initials from name
  const initials = name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase();

  return (
    <div className="relative inline-flex flex-col items-center group">
      {/* Avatar Container */}
      <div
        className={`relative rounded-full flex items-center justify-center overflow-hidden bg-violet-100 text-violet-600 font-medium
          ${sizeClasses[size]}
          ${role === 'provider' ? (providerRanking?.border ?? 'border border-gray-200') : 'border border-gray-200'}
          ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}
        `}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={onClick}
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover"
          />
        ) : (
          <span>{initials}</span>
        )}
      </div>

      {/* Provider Stars */}
      {role === 'provider' && providerRanking && providerRanking.stars > 0 && (
        <div className={`flex mt-1 ${size === 'sm' ? 'scale-75 -mt-1' : ''}`}>
          {[...Array(providerRanking.stars)].map((_, i) => (
            <StarIcon key={i} className="h-4 w-4 text-yellow-400" />
          ))}
        </div>
      )}

      {/* Client Badge */}
      {role === 'client' && clientBadge && (
        <div
          className={`
            absolute -bottom-1 left-1/2 transform -translate-x-1/2 whitespace-nowrap
            ${size === 'sm' ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-1'}
            ${clientBadge.color} ${clientBadge.textColor}
            rounded-full font-medium shadow-sm
          `}
        >
          {clientBadge.text}
        </div>
      )}
    </div>
  );
}