'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';

// Helper function to format datetime for input
const formatDateTimeLocal = (date: Date) => {
  return date.toISOString().slice(0, 16);
};

// Validation schema for creating a show
const createShowSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  startTime: z.string(),
  endTime: z.string(),
  venue: z.string().min(1, 'Venue is required'),
  maxSlots: z.number().min(1, 'At least one slot is required'),
});

type Show = {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  venue: string;
  maxSlots: number;
  createdBy: {
    name: string;
    email: string;
  };
  bookings: any[];
};

export default function ShowsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [shows, setShows] = useState<Show[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: formatDateTimeLocal(new Date()),
    endTime: formatDateTimeLocal(new Date(Date.now() + 3600000)), // Default to 1 hour later
    venue: '',
    maxSlots: 1,
  });

  const fetchShows = async () => {
    try {
      const res = await fetch('/api/shows');
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to fetch shows');
      }
      const data = await res.json();
      setShows(data);
      setError('');
    } catch (error) {
      console.error('Error fetching shows:', error);
      setError(error instanceof Error ? error.message : 'Failed to load shows');
    } finally {
      setIsLoading(false);
    }
  };

  // Use useEffect for fetching shows on component mount
  useEffect(() => {
    fetchShows();
  }, []); // Empty dependency array means this runs once on mount

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const validatedData = createShowSchema.parse(formData);
      const res = await fetch('/api/shows', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validatedData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create show');
      }

      // Reset form and refresh shows
      setFormData({
        title: '',
        description: '',
        startTime: formatDateTimeLocal(new Date()),
        endTime: formatDateTimeLocal(new Date(Date.now() + 3600000)), // Default to 1 hour later
        venue: '',
        maxSlots: 1,
      });
      setShowForm(false);
      fetchShows();
    } catch (error) {
      if (error instanceof z.ZodError) {
        setError(error.errors[0].message);
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unexpected error occurred');
      }
    }
  };

  const handleBooking = async (showId: string) => {
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ showId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to book show');
      }

      // Refresh shows to update availability
      fetchShows();
      alert('Booking submitted successfully!');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to book show');
    }
  };

  if (isLoading) return <div className="p-4">Loading...</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Comedy Shows</h1>
        {session?.user.role === 'PROMOTER' && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            {showForm ? 'Cancel' : 'Create Show'}
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {showForm && session?.user.role === 'PROMOTER' && (
        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
              Title
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="startTime">
              Start Time
            </label>
            <input
              type="datetime-local"
              id="startTime"
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="endTime">
              End Time
            </label>
            <input
              type="datetime-local"
              id="endTime"
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="venue">
              Venue
            </label>
            <input
              type="text"
              id="venue"
              value={formData.venue}
              onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="maxSlots">
              Maximum Slots
            </label>
            <input
              type="number"
              id="maxSlots"
              value={formData.maxSlots}
              onChange={(e) => setFormData({ ...formData, maxSlots: parseInt(e.target.value) })}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              min="1"
              required
            />
          </div>

          <div className="flex items-center justify-end">
            <button
              type="submit"
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
            >
              Create Show
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {shows.map((show) => (
          <div key={show.id} className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-bold mb-2">{show.title}</h2>
            {show.description && <p className="text-gray-600 mb-4">{show.description}</p>}
            <div className="text-sm text-gray-500">
              <p>Venue: {show.venue}</p>
              <p>Start: {new Date(show.startTime).toLocaleString()}</p>
              <p>End: {new Date(show.endTime).toLocaleString()}</p>
              <p>Available Slots: {show.maxSlots - show.bookings.length}</p>
              <p>Created by: {show.createdBy.name}</p>
            </div>
            {session?.user.role === 'COMEDIAN' && show.maxSlots > show.bookings.length && (
              <button
                onClick={() => handleBooking(show.id)}
                className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 w-full"
              >
                Book Slot
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 