import { Event, EventForm } from '../types';

const jsonHeaders = { 'Content-Type': 'application/json' } as const;

export async function fetchEventsApi(): Promise<Event[]> {
  const response = await fetch('/api/events');
  if (!response.ok) throw new Error('Failed to fetch events');
  const { events } = (await response.json()) as { events: Event[] };
  return events;
}

export async function createEventApi(eventData: EventForm): Promise<Event> {
  const response = await fetch('/api/events', {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify(eventData),
  });
  if (!response.ok) throw new Error('Failed to create event');
  return (await response.json()) as Event;
}

export async function updateEventApi(eventData: Event): Promise<Event> {
  const response = await fetch(`/api/events/${eventData.id}`, {
    method: 'PUT',
    headers: jsonHeaders,
    body: JSON.stringify(eventData),
  });
  if (!response.ok) throw new Error('Failed to update event');
  return (await response.json()) as Event;
}

export async function deleteEventApi(id: string): Promise<void> {
  const response = await fetch(`/api/events/${id}`, { method: 'DELETE' });
  if (!response.ok) throw new Error('Failed to delete event');
}
