'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Order } from '@/app/lib/orders';
import { uploadImageAndGetPublicUrl } from '@/app/lib/uploads';
import { useTranslation } from '@/app/hooks/useTranslation';
import {
  CalendarIcon,
  MapPinIcon,
  BanknotesIcon,
  CreditCardIcon,
  CheckCircleIcon,
  XMarkIcon,
  PaperClipIcon,
  PhoneIcon,
  PaperAirplaneIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import UserAvatar from './UserAvatar';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  imageUrl?: string;
  timestamp: string;
}

interface ChatInterfaceProps {
  taskId: string;
  taskTitle: string;
  taskDescription?: string;
  taskStatus: 'open' | 'completed';
  currentUserId: string;
  currentUserName: string;
  currentUserRole: 'client' | 'provider';
  currentUserCompletedRequests: number;
  // Other user (person you are chatting with)
  otherUserId?: string;
  otherUserName: string;
  otherUserRole: 'client' | 'provider';
  otherUserCompletedRequests: number;
  otherUserImageUrl?: string;
  otherUserPhone?: string;
  messages: Message[];
  onSendMessage: (content: string, imageUrl?: string) => void;
  onBack?: () => void;
  onMarkTaskCompleted?: () => void;
  onTaskClick?: () => void;
  orders?: Order[];
  onAcceptOrder?: (orderId: string) => void;
  onDeclineOrder?: (orderId: string) => void;
  onPayOrder?: (orderId: string) => void;
  onCompleteOrder?: (orderId: string) => void;
}

export default function ChatInterface({
  taskId: _taskId,
  taskTitle,
  taskDescription,
  taskStatus,
  currentUserId,
  currentUserName,
  currentUserRole,
  currentUserCompletedRequests,
  otherUserId,
  otherUserName,
  otherUserRole,
  otherUserCompletedRequests,
  otherUserImageUrl,
  otherUserPhone,
  messages,
  onSendMessage,
  onBack,
  onMarkTaskCompleted,
  onTaskClick,
  orders = [],
  onAcceptOrder,
  onDeclineOrder,
  onPayOrder,
  onCompleteOrder,
}: ChatInterfaceProps) {
  const { t } = useTranslation();
  const [newMessage, setNewMessage] = useState('');
  const [attachedImage, setAttachedImage] = useState<File | null>(null);
  const [attachedPreviewUrl, setAttachedPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSharingLocation, setIsSharingLocation] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    return () => {
      if (attachedPreviewUrl && attachedPreviewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(attachedPreviewUrl);
      }
    };
  }, [attachedPreviewUrl]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const content = newMessage.trim();
    if (!content && !attachedImage) return;

    const send = async () => {
      try {
        let imageUrl: string | undefined = undefined;
        if (attachedImage) {
          setIsUploading(true);
          imageUrl = await uploadImageAndGetPublicUrl({ file: attachedImage, folder: 'chat' });
        }

        onSendMessage(content, imageUrl);
        setNewMessage('');
        setAttachedImage(null);
        if (attachedPreviewUrl && attachedPreviewUrl.startsWith('blob:')) URL.revokeObjectURL(attachedPreviewUrl);
        setAttachedPreviewUrl(null);
      } finally {
        setIsUploading(false);
      }
    };

    // Fire and forget; we still guard UI with isUploading
    void send();
  };

  const handleShareLocation = async () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setIsSharingLocation(true);

    try {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          // Try to get address using reverse geocoding
          try {
            // Using OpenStreetMap Nominatim as a free alternative (no API key needed)
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
              { headers: { 'User-Agent': 'Workly-App' } }
            );
            const data = await response.json();
            
            let addressText = '';
            if (data.address) {
              const addr = data.address;
              addressText = [
                addr.road,
                addr.house_number,
                addr.city || addr.town || addr.village,
                addr.postcode,
                addr.country
              ].filter(Boolean).join(', ');
            }
            
            const googleMapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
            const message = addressText 
              ? `📍 My location: ${addressText}\n${googleMapsLink}`
              : `📍 My location: ${googleMapsLink}`;
            
            onSendMessage(message);
          } catch (error) {
            // Fallback: just send coordinates and map link
            const googleMapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
            onSendMessage(`📍 My location: ${googleMapsLink}`);
          } finally {
            setIsSharingLocation(false);
          }
        },
        (error) => {
          setIsSharingLocation(false);
          alert('Unable to get your location. Please make sure location services are enabled.');
          console.error('Geolocation error:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } catch (error) {
      setIsSharingLocation(false);
      alert('Error accessing location. Please try again.');
      console.error('Location sharing error:', error);
    }
  };

  const canOpenOtherProfile =
    currentUserRole === 'client' &&
    otherUserRole === 'provider' &&
    otherUserId;

  return (
    <div className="w-full">
      <div className="w-full rounded-none md:rounded-[32px] bg-gradient-to-b from-violet-600 via-violet-700 to-indigo-800 text-white flex flex-col min-h-[calc(100svh-4rem)] overflow-hidden">
        {/* iOS notch/status-bar area background (prevents gray strip at top) */}
        <div
          className="fixed top-0 left-0 right-0 z-[10000] pointer-events-none bg-gradient-to-b from-violet-600 via-violet-700 to-indigo-800"
          style={{ height: 'env(safe-area-inset-top)' }}
        />
        {/* Header */}
        <div className="p-6 pb-4 border-b border-white/25">
          <div className="flex items-start gap-3">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="mt-1 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur hover:bg-white/20 transition-colors"
                aria-label="Go back"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
            )}
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <div
                  className={canOpenOtherProfile ? 'cursor-pointer' : undefined}
                  onClick={
                    canOpenOtherProfile
                      ? () => router.push(`/providers/${otherUserId}`)
                      : undefined
                  }
                >
                  <UserAvatar
                    imageUrl={otherUserImageUrl}
                    name={otherUserName}
                    role={otherUserRole}
                    completedRequests={otherUserCompletedRequests}
                    size="md"
                  />
                </div>
                <div
                  className={canOpenOtherProfile ? 'cursor-pointer' : undefined}
                  onClick={
                    canOpenOtherProfile
                      ? () => router.push(`/providers/${otherUserId}`)
                      : undefined
                  }
                >
                  <p className={`text-base font-semibold ${canOpenOtherProfile ? 'hover:underline' : ''}`}>{otherUserName}</p>
                  <p className="text-xs text-white/70">
                    {otherUserRole === 'provider' ? 'Trusted provider' : 'Client'}
                  </p>
                </div>
              </div>
            </div>
            {currentUserRole === 'client' && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleShareLocation}
                  disabled={isSharingLocation}
                  className={`inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 backdrop-blur transition-colors ${
                    isSharingLocation 
                      ? 'bg-white/5 opacity-70 cursor-wait' 
                      : 'bg-white/10 hover:bg-white/20'
                  }`}
                  aria-label="Share my location"
                >
                  {isSharingLocation ? (
                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <MapPinIcon className="h-5 w-5" />
                  )}
                </button>
                {otherUserRole === 'provider' ? (
                  otherUserPhone ? (
                    <a
                      href={`tel:${otherUserPhone}`}
                      className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur hover:bg-white/20 transition-colors"
                      aria-label="Call provider"
                    >
                      <PhoneIcon className="h-5 w-5" />
                    </a>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 backdrop-blur opacity-50 cursor-not-allowed"
                      aria-label="Provider phone number not available"
                    >
                      <PhoneIcon className="h-5 w-5" />
                    </button>
                  )
                ) : (
                  <button
                    type="button"
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur hover:bg-white/20 transition-colors"
                    aria-label="Start audio call"
                  >
                    <PhoneIcon className="h-5 w-5" />
                  </button>
                )}
              </div>
            )}
          </div>
          <div className="mt-4 rounded-3xl bg-white/10 border border-white/10 p-4">
            <p className="text-sm font-semibold">{taskTitle}</p>
            {taskDescription && (
              <p className="text-xs text-white/80 mt-1">{taskDescription}</p>
            )}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {onTaskClick ? (
                <button
                  type="button"
                  onClick={onTaskClick}
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border border-white/30 hover:bg-white/10 transition-colors cursor-pointer"
                >
                  {taskStatus === 'open' ? t('chat.openTask') : t('chat.completedTask')}
                </button>
              ) : (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border border-white/30">
                  {taskStatus === 'open' ? t('chat.openTask') : t('chat.completedTask')}
                </span>
              )}
              {taskStatus === 'open' && onMarkTaskCompleted && (
                <button
                  type="button"
                  onClick={onMarkTaskCompleted}
                  className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-white text-violet-600 shadow-sm"
                >
                  {t('chat.markAsCompleted')}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-6 space-y-4 pb-32">
          {messages.map((message) => {
            const isCurrentUser = message.senderId === currentUserId;
            return (
              <div
                key={message.id}
                className={`flex w-full ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-3xl px-4 py-3 text-sm leading-relaxed shadow-lg ${
                    isCurrentUser
                      ? 'bg-white text-violet-700 rounded-br-sm'
                      : 'bg-white/15 text-white rounded-bl-sm backdrop-blur'
                  }`}
                >
                  {message.imageUrl && (
                    <div className={`mb-2 overflow-hidden rounded-2xl ${isCurrentUser ? 'bg-white' : 'bg-white/10'}`}>
                      <img src={message.imageUrl} alt="Attachment" className="w-full h-auto object-cover" />
                    </div>
                  )}
                  <p>{message.content}</p>
                  <span
                    className={`mt-2 block text-[10px] uppercase tracking-wide ${
                      isCurrentUser ? 'text-violet-500' : 'text-white/70'
                    }`}
                  >
                    {new Date(message.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false,
                    })}
                  </span>
                </div>
              </div>
            );
          })}

          {orders.map((order) => (
            <div
              key={order.id}
              className="rounded-3xl border border-white/20 bg-white/10 p-4 text-sm text-white space-y-2 shadow-lg"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-base font-semibold">
                  <CreditCardIcon className="h-5 w-5" />
                  <span>{order.title}</span>
                </div>
                <span className="text-[11px] px-3 py-1 rounded-full border border-white/30">
                  {order.status.replace('_', ' ')}
                </span>
              </div>
              <div className="grid gap-1.5 text-xs text-white/80">
                <div className="inline-flex items-center gap-2">
                  <MapPinIcon className="h-4 w-4" />
                  <span className="truncate">{order.location}</span>
                </div>
                <div className="inline-flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  <span>
                    {new Date(order.date_time || '').toLocaleString([], {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false,
                    })}
                  </span>
                </div>
                <div className="inline-flex items-center gap-2">
                  <BanknotesIcon className="h-4 w-4 text-green-300" />
                  <span className="font-semibold text-white">€{order.price_eur}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {currentUserRole === 'provider' && order.status === 'pending' && (
                  <>
                    {onAcceptOrder && (
                      <button
                        onClick={() => onAcceptOrder(order.id)}
                        className="text-xs inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white text-violet-600 font-semibold shadow"
                      >
                        <CheckCircleIcon className="h-4 w-4" />
                        Accept
                      </button>
                    )}
                    {onDeclineOrder && (
                      <button
                        onClick={() => onDeclineOrder(order.id)}
                        className="text-xs inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/20 text-white border border-white/30"
                      >
                        <XMarkIcon className="h-4 w-4" />
                        Decline
                      </button>
                    )}
                  </>
                )}
                {currentUserRole === 'client' && order.status === 'accepted' && onPayOrder && (
                  <button
                    onClick={() => onPayOrder(order.id)}
                    className="text-xs inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white text-violet-600 font-semibold shadow"
                  >
                    Pay & Start
                  </button>
                )}
                {currentUserRole === 'client' &&
                  (order.status === 'in_progress' || order.status === 'paid') &&
                  onCompleteOrder && (
                    <button
                      onClick={() => onCompleteOrder(order.id)}
                      className="text-xs inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white text-violet-600 font-semibold shadow"
                    >
                      Mark as Completed
                    </button>
                  )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <form onSubmit={handleSubmit} className="mt-auto px-4 pb-5 pt-0 bg-transparent md:static md:p-5 safe-area-bottom safe-area-x">
          <div className="flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-4 py-2 backdrop-blur-md w-full shadow-[0_10px_25px_rgba(15,23,42,0.2)]">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="cursor-pointer text-white/80 disabled:opacity-50"
              aria-label="Attach image"
              disabled={isUploading}
            >
              <span className="sr-only">Attach file</span>
              <PaperClipIcon className="h-5 w-5" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                if (!file) return;

                setAttachedImage(file);
                if (attachedPreviewUrl && attachedPreviewUrl.startsWith('blob:')) URL.revokeObjectURL(attachedPreviewUrl);
                setAttachedPreviewUrl(URL.createObjectURL(file));

                // Allow re-selecting the same file
                e.target.value = '';
              }}
            />
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message…"
              className="flex-1 bg-transparent text-sm text-white placeholder:text-white/60 focus:outline-none"
            />
            {attachedPreviewUrl && (
              <button
                type="button"
                onClick={() => {
                  setAttachedImage(null);
                  if (attachedPreviewUrl.startsWith('blob:')) URL.revokeObjectURL(attachedPreviewUrl);
                  setAttachedPreviewUrl(null);
                }}
                className="inline-flex items-center gap-2 rounded-full bg-white/10 px-2 py-1 text-xs text-white/90 border border-white/20"
                aria-label="Remove attached image"
                disabled={isUploading}
              >
                <span className="h-6 w-6 overflow-hidden rounded-full bg-white/10">
                  <img src={attachedPreviewUrl} alt="Attachment preview" className="h-6 w-6 object-cover" />
                </span>
                Remove
              </button>
            )}
            <button
              type="submit"
              disabled={isUploading || (!newMessage.trim() && !attachedImage)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-violet-600 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Send message"
            >
              <PaperAirplaneIcon className="h-5 w-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 