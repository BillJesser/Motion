import { apiFetch } from "./client";
import type { AiEvent, MotionEvent } from "./events";

export interface UserProfile {
  email: string;
  cognitoSub: string;
  isVerified: boolean;
  savedEvents: Array<{ eventId: string; source: "motion" | "ai" }>;
  createdAt: string;
  updatedAt: string;
}

export interface SavedMotionEventItem {
  eventId: string;
  source: "motion";
  event: MotionEvent;
}

export interface SavedAiEventItem {
  eventId: string;
  source: "ai";
  event: AiEvent;
}

export type SavedEventItem = SavedMotionEventItem | SavedAiEventItem;

export function getUserProfile(email: string, token?: string) {
  return apiFetch<{ profile: UserProfile }>("/users/profile", {
    method: "GET",
    token,
    query: { email },
  });
}

export function getSavedEvents(email: string, token?: string) {
  return apiFetch<{ count: number; items: SavedEventItem[] }>("/users/saved-events", {
    method: "GET",
    token,
    query: { email },
  });
}

export type SaveMotionEventPayload = {
  email: string;
  source: "motion";
  eventId: string;
};

export type SaveAiEventPayload = {
  email: string;
  source: "ai";
  event: AiEvent;
};

export type SaveEventPayload = SaveMotionEventPayload | SaveAiEventPayload;

export function saveEvent(payload: SaveEventPayload, token: string) {
  return apiFetch<{ message: string; savedEvents: Array<{ eventId: string; source: "motion" | "ai" }> }>(
    "/users/saved-events",
    {
      method: "POST",
      body: payload,
      token,
    },
  );
}

export function removeSavedEvent(
  payload: { email: string; eventId: string; source?: "motion" | "ai" },
  token: string,
) {
  return apiFetch<{ message: string; savedEvents: Array<{ eventId: string; source: "motion" | "ai" }> }>(
    "/users/saved-events",
    {
      method: "DELETE",
      body: payload,
      token,
    },
  );
}

