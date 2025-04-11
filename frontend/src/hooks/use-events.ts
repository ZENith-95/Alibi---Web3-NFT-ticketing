// import { useState, useEffect, useCallback } from 'react';
// import { icApi } from '@/lib/ic-api';
// import type { Event, CreateEventRequest, EventResponse } from '@/lib/ic-api';
// import { AuthClient } from '@dfinity/auth-client';

// export function useEvents() {
//   const [events, setEvents] = useState<Event[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<Error | null>(null);

//   const fetchEvents = async () => {
//     try {
//       setIsLoading(true);
//       setError(null);

//       // Get the current user's principal
//       const identity = await AuthClient.create();
//       if (!identity) {
//         throw new Error('Failed to initialize identity');
//       }
//       const principal = identity.getIdentity().getPrincipal();
//       if (!principal) {
//         throw new Error('Failed to get principal');
//       }

//       // Fetch all events
//       const events = await icApi.getAllEvents();

//       // Fetch organizer events for the current user
//       const organizerEvents = await icApi.getOrganizerEvents(principal);

//       // Combine and deduplicate events
//       const allEvents = [...events];
//       organizerEvents.forEach((event) => {
//         if (!allEvents.some((e) => e.id === event.id)) {
//           allEvents.push(event);
//         }
//       });

//       setEvents(allEvents);
//     } catch (error) {
//       console.error("Error loading events:", error);
//       setError(error instanceof Error ? error.message : "Failed to load events");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const createEvent = async (eventData: CreateEventRequest): Promise<EventResponse> => {
//     try {
//       // Validate required fields
//       if (!eventData.name || !eventData.description || !eventData.date || !eventData.time || !eventData.location) {
//         return { err: { InvalidEventData: null } };
//       }

//       // Validate ticket types
//       if (!eventData.ticketTypes || eventData.ticketTypes.length === 0) {
//         return { err: { InvalidEventData: null } };
//       }

//       for (const ticketType of eventData.ticketTypes) {
//         if (!ticketType.name || ticketType.price <= BigInt(0) || ticketType.capacity <= BigInt(0)) {
//           return { err: { InvalidEventData: null } };
//         }
//       }

//       console.log('Creating event with data:', eventData);
//       const result = await icApi.createEvent(eventData);
//       console.log('Event creation result:', result);

//       if ('ok' in result) {
//         // Refresh events list
//         await fetchEvents();
//         return result;
//       }

//       return result;
//     } catch (error) {
//       console.error('Error creating event:', error);
//       return { err: { SystemError: null } };
//     }
//   };

//   useEffect(() => {
//     fetchEvents();
//   }, []);

//   const getEvent = async (eventId: bigint) => {
//     try {
//       const response = await icApi.getEvent(eventId);
//       if (response && 'ok' in response) {
//         return response.ok;
//       }
//       throw new Error('Event not found');
//     } catch (err) {
//       console.error('Error fetching event:', err);
//       throw err instanceof Error ? err : new Error('Failed to fetch event');
//     }
//   };

//   const getOrganizerEvents = async (organizer: Principal) => {
//     try {
//       const response = await icApi.getOrganizerEvents(organizer);
//       return response;
//     } catch (err) {
//       console.error('Error fetching organizer events:', err);
//       throw err instanceof Error ? err : new Error('Failed to fetch organizer events');
//     }
//   };

//   const attendEvent = async (eventId: string) => {
//     try {
//       const response = await icApi.attendEvent(eventId);
//       if (response && 'ok' in response) {
//         await fetchEvents();
//         return response.ok;
//       }
//       throw new Error('Failed to attend event');
//     } catch (err) {
//       throw err instanceof Error ? err : new Error('Failed to attend event');
//     }
//   };

//   const leaveEvent = async (eventId: string) => {
//     try {
//       const response = await icApi.leaveEvent(eventId);
//       if (response && 'ok' in response) {
//         await fetchEvents();
//         return response.ok;
//       }
//       throw new Error('Failed to leave event');
//     } catch (err) {
//       throw err instanceof Error ? err : new Error('Failed to leave event');
//     }
//   };

//   const deleteEvent = async (eventId: string) => {
//     try {
//       const response = await icApi.deleteEvent(eventId);
//       if (response && 'ok' in response) {
//         await fetchEvents();
//         return response.ok;
//       }
//       throw new Error('Failed to delete event');
//     } catch (err) {
//       throw err instanceof Error ? err : new Error('Failed to delete event');
//     }
//   };

//   return {
//     events,
//     isLoading,
//     error,
//     createEvent,
//     getEvent,
//     getOrganizerEvents,
//     attendEvent,
//     leaveEvent,
//     deleteEvent,
//     refreshEvents: fetchEvents,
//   };
// } 