import { apiFetch } from "./client";

export interface SignUpPayload {
  email: string;
  password: string;
}

export interface SignInPayload {
  email: string;
  password: string;
}

export interface ConfirmSignUpPayload {
  email: string;
  code: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ConfirmForgotPasswordPayload {
  email: string;
  code: string;
  newPassword: string;
}

export interface AuthUser {
  email: string;
  userId: string;
  savedEvents: Array<{ eventId: string; source: "motion" | "ai" }>;
  isVerified?: boolean;
}

export interface SignInResponse {
  accessToken: string;
  idToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
  user: AuthUser;
}

export function signUp(payload: SignUpPayload) {
  return apiFetch<{ message: string; userId: string; email: string }>("/auth/signup", {
    method: "POST",
    body: payload,
  });
}

export function confirmSignUp(payload: ConfirmSignUpPayload) {
  return apiFetch<{ message: string }>("/auth/confirm-signup", {
    method: "POST",
    body: payload,
  });
}

export function signIn(payload: SignInPayload) {
  return apiFetch<SignInResponse>("/auth/signin", {
    method: "POST",
    body: payload,
  });
}

export function forgotPassword(payload: ForgotPasswordPayload) {
  return apiFetch<{ message: string }>("/auth/forgot-password", {
    method: "POST",
    body: payload,
  });
}

export function confirmForgotPassword(payload: ConfirmForgotPasswordPayload) {
  return apiFetch<{ message: string }>("/auth/confirm-forgot-password", {
    method: "POST",
    body: payload,
  });
}
