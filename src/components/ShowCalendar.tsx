'use client';

import { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import {
  format,
  parse,
  startOfWeek,
  getDay,
} from 'date-fns';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import BookingModal from './BookingModal';

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

type CalendarEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: Show;
};

const locales = {
  'en-US': require('date-fns/locale/en-US'),
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export default function ShowCalendar() {
  const [shows, setShows] = useState<Show[]>([]);
  const [selectedShow, setSelectedShow] = useState<Show | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchShows();
  }, []);

  const fetchShows = async () => {
    try {
      const response = await fetch('/api/shows');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch shows');
      }
      const data = await response.json();
      setShows(data);
      setError('');
    } catch (error) {
      console.error('Error fetching shows:', error);
      setShows([]);
      setError(error instanceof Error ? error.message : 'Failed to load shows');
    }
  };

  const calendarEvents: CalendarEvent[] = shows.map((show) => ({
    id: show.id,
    title: show.title,
    start: new Date(show.startTime),
    end: new Date(show.endTime),
    resource: show,
  }));

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedShow(event.resource);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedShow(null);
  };

  const handleBookingComplete = () => {
    fetchShows();
  };

  return (
    <div className="h-screen p-4">
      <Calendar
        localizer={localizer}
        events={calendarEvents}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 'calc(100vh - 2rem)' }}
        onSelectEvent={handleSelectEvent}
      />
      {selectedShow && (
        <BookingModal
          show={selectedShow}
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onBookingComplete={handleBookingComplete}
        />
      )}
    </div>
  );
}