'use client';

import { useState } from 'react';

type Show = {
  id: string;
  title: string;
  description: string | null;
  startTime: string;
  endTime: string;
  venue: string;
  maxSlots: number;
  bookings: Array<{
    id: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  }>;
};

type BookingModalProps = {
  show: Show;
  isOpen: boolean;
  onClose: () => void;
  onBookingComplete: () => void;
};

export default function BookingModal({ show, isOpen, onClose, onBookingComplete }: BookingModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleBooking = async () => {
    try {
      setIsSubmitting(true);
      setError('');

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ showId: show.id }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to book show');
      }

      onBookingComplete();
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to book show');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">{show.title}</h2>
        {show.description && <p className="text-gray-600 mb-4">{show.description}</p>}
        <div className="text-sm text-gray-500 mb-4">
          <p>Venue: {show.venue}</p>
          <p>Start: {new Date(show.startTime).toLocaleString()}</p>
          <p>End: {new Date(show.endTime).toLocaleString()}</p>
          <p>Available Slots: {show.maxSlots - show.bookings.length}</p>
        </div>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={handleBooking}
            disabled={isSubmitting}
            className={`px-4 py-2 rounded text-white ${
              isSubmitting ? 'bg-green-400' : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {isSubmitting ? 'Booking...' : 'Book Slot'}
          </button>
        </div>
      </div>
    </div>
  );
}
