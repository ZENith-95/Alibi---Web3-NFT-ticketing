import { create } from "zustand";
import { eventsCanister } from "../lib/utils";
import { CreateEventRequest, EventType } from "@/types/events";

export enum EventStatus { LOADING, IDLE, COMPLETED, FAILED }
export interface EventsState {
    status: EventStatus
    events: EventType[]
    errorMsg?: string | null
    fetchEvents: () => Promise<void>
    deleteEvent(id: bigint): Promise<void>
    createEvent: (event: CreateEventRequest) => Promise<void>
}
const initalState: EventsState = {
    status: EventStatus.IDLE,
    events: [],
    errorMsg: null,
    fetchEvents: async () => { },
    deleteEvent: async (_) => { },
    createEvent: async (_) => { },
}
export const useICPEvents = create<EventsState>((set) => ({
    ...initalState,
    fetchEvents: async () => {
        set({ status: EventStatus.LOADING });
        try {
            const response = await eventsCanister.getAllEvents();
            console.log('response', response);
            if (response.length > 0) {
                set({ events: response, status: EventStatus.COMPLETED });
            } else {
                set({ errorMsg: 'No events found', status: EventStatus.IDLE });
            }
        } catch (err) {
            console.error('Error fetching events:', err);
            set({
                errorMsg: err instanceof Error ? err.message : 'Failed to fetch events',
                status: EventStatus.FAILED
            });
        }
    },
    createEvent: async (event) => {
        set({ status: EventStatus.LOADING });
        try {
            const response = await eventsCanister.createEvent(event);
            if (response) {
                set({ status: EventStatus.COMPLETED });
                await eventsCanister.getAllEvents();
            } else {
                set({ errorMsg: 'Failed to create event', status: EventStatus.FAILED });
            }
        } catch (error) {
            console.error('Error creating event:', error);
            set({ errorMsg: 'Failed to create event', status: EventStatus.FAILED });
        }
    },
    deleteEvent: async (id) => {
        set({ status: EventStatus.LOADING });
        try {
            await eventsCanister.deleteEvent(id);
            const response = await eventsCanister.getAllEvents();
            set({ status: EventStatus.COMPLETED, events: response });

        } catch (error) {
            console.error('Error deleting event:', error);
            set({ errorMsg: 'Failed to delete event', status: EventStatus.FAILED });

        }

    },
}));