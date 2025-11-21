import { apiConfig, apiFetch } from "./client";

export interface MotionEventLocation {
  venue?: string;
  address?: string;
  city: string;
  state?: string;
  zip?: string;
  country?: string;
}

export interface MotionEvent {
  eventId: string;
  name: string;
  description: string;
  dateTime: string | number;
  endDateTime?: string | number | null;
  createdByEmail: string;
  location: MotionEventLocation;
  coordinates?: { lat: number; lng: number };
  photoUrls?: string[];
  tags?: string[];
}

export interface AiEventLocation {
  venue?: string;
  city?: string;
  state?: string;
  country?: string;
  address?: string;
}

export interface AiEvent {
  eventId?: string;
  title: string;
  description?: string;
  start_date: string;
  end_date?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  timezone: string;
  location?: AiEventLocation;
  source_url?: string;
  tags?: string[];
}

export interface SearchEventsParams {
  lat?: number;
  lng?: number;
  address?: string;
  zip?: string;
  city?: string;
  state?: string;
  country?: string;
  radiusMiles?: number;
  startTime?: string;
  endTime?: string;
  windowMinutes?: number;
  tags?: string[];
}

export interface SearchEventsResponse {
  center: { lat: number; lng: number };
  radiusMiles: number;
  count: number;
  items: MotionEvent[];
}

export interface SearchAiEventsParams {
  lat?: number;
  lng?: number;
  city?: string;
  state?: string;
  country?: string;
  start_date: string;
  end_date: string;
  timezone: string;
  radius_miles?: number;
  preferLocal?: 0 | 1;
  debug?: 0 | 1;
}

export interface SearchAiEventsResponse {
  count: number;
  items: AiEvent[];
}

export interface CreateEventPayload {
  name: string;
  description: string;
  dateTime: string;
  endDateTime?: string | null;
  createdByEmail: string;
  location: {
    venue?: string;
    address: string;
    city: string;
    state: string;
    zip: string;
  };
  coordinates?: { lat: number; lng: number };
  photoUrls?: string[];
  tags?: string[];
}

export interface CreateEventResponse {
  message: string;
  eventId: string;
}

export function searchEvents(params: SearchEventsParams, token?: string) {
  return apiFetch<SearchEventsResponse>("/events/search", {
    method: "GET",
    token,
    query: {
      lat: params.lat,
      lng: params.lng,
      address: params.address,
      zip: params.zip,
      city: params.city,
      state: params.state,
      country: params.country,
      radiusMiles: params.radiusMiles,
      startTime: params.startTime,
      endTime: params.endTime,
      windowMinutes: params.windowMinutes,
      tags: params.tags?.join(","),
    },
  });
}

export function searchAiEvents(params: SearchAiEventsParams) {
  return apiFetch<SearchAiEventsResponse>("/search-ai", {
    method: "GET",
    baseUrl: apiConfig.searchAiBaseUrl,
    query: {
      lat: params.lat,
      lng: params.lng,
      city: params.city,
      state: params.state,
      country: params.country,
      start_date: params.start_date,
      end_date: params.end_date,
      timezone: params.timezone,
      radius_miles: params.radius_miles,
      preferLocal: params.preferLocal,
      debug: params.debug,
    },
  });
}

export function createEvent(payload: CreateEventPayload, token: string) {
  return apiFetch<CreateEventResponse>("/events", {
    method: "POST",
    body: payload,
    token,
  });
}

export function getEventById(eventId: string, token?: string) {
  return apiFetch<{ event: MotionEvent }>(`/events/${eventId}`, {
    method: "GET",
    token,
  });
}

export function getAiEventById(eventId: string, token?: string) {
  return apiFetch<{ event: AiEvent }>(`/ai-events/${eventId}`, {
    method: "GET",
    token,
  });
}

export function getEventsByUser(email: string, token?: string) {
  return apiFetch<{ count: number; items: MotionEvent[] }>("/events/by-user", {
    method: "GET",
    token,
    query: {
      email,
    },
  });
}
