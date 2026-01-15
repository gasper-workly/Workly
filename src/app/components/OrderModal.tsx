'use client';

import { useState } from 'react';

interface OrderModalProps {
  defaultTitle: string;
  onSubmit: (values: { title: string; location: string; dateTimeISO: string; priceEur: number }) => void;
  onClose: () => void;
}

export default function OrderModal({ defaultTitle, onSubmit, onClose }: OrderModalProps) {
  const [title, setTitle] = useState(defaultTitle);
  const [location, setLocation] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [price, setPrice] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const priceEur = parseFloat(price);
    if (!title || !location || !dateTime || isNaN(priceEur)) return;
    onSubmit({ title, location, dateTimeISO: new Date(dateTime).toISOString(), priceEur });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-md p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-black">Create Order</h2>
          <button onClick={onClose} className="text-black">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-black mb-1">Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2 text-black focus:outline-none focus:ring-1 focus:ring-violet-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-black mb-1">Location</label>
            <input value={location} onChange={(e) => setLocation(e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2 text-black focus:outline-none focus:ring-1 focus:ring-violet-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-black mb-1">Date & time</label>
            <input type="datetime-local" value={dateTime} onChange={(e) => setDateTime(e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2 text-black focus:outline-none focus:ring-1 focus:ring-violet-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-black mb-1">Price (€)</label>
            <input inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2 text-black focus:outline-none focus:ring-1 focus:ring-violet-500" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-black rounded-md border">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm text-white bg-violet-600 rounded-md">Create</button>
          </div>
        </form>
      </div>
    </div>
  );
}

