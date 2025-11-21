const defaultApiBaseUrl = "https://qekks9l4k1.execute-api.us-east-2.amazonaws.com";
const defaultSearchAiBaseUrl =
  "https://uq65bozd66oybogxlvir2icqea0bzwxz.lambda-url.us-east-2.on.aws";

function normalizeBaseUrl(url: string) {
  if (!url) return "";
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

const API_BASE_URL = normalizeBaseUrl(
  (import.meta.env?.VITE_API_BASE_URL as string | undefined) ?? defaultApiBaseUrl,
);
const SEARCH_AI_BASE_URL = normalizeBaseUrl(
  (import.meta.env?.VITE_API_SEARCH_AI_URL as string | undefined) ?? defaultSearchAiBaseUrl,
);

type QueryParams = Record<string, string | number | boolean | undefined | null>;

export interface RequestOptions extends RequestInit {
  query?: QueryParams;
  token?: string | null;
  baseUrl?: string;
}

function buildQueryString(params?: QueryParams) {
  if (!params) return "";
  const query = Object.entries(params).reduce((acc, [key, value]) => {
    if (value === undefined || value === null || value === "") return acc;
    acc.append(key, String(value));
    return acc;
  }, new URLSearchParams());

  const queryString = query.toString();
  return queryString ? `?${queryString}` : "";
}

export async function apiFetch<TResponse>(
  path: string,
  { query, token, baseUrl = API_BASE_URL, headers, body, ...init }: RequestOptions = {},
): Promise<TResponse> {
  const url = `${baseUrl}${path}${buildQueryString(query)}`;
  if (import.meta.env?.DEV) {
    console.log("[apiFetch] request", {
      url,
      method: init?.method ?? "GET",
      hasToken: Boolean(token),
      query,
    });
  }
  const resolvedHeaders = new Headers(headers);
  resolvedHeaders.set("Accept", "application/json");
  if (body && !resolvedHeaders.has("Content-Type")) {
    resolvedHeaders.set("Content-Type", "application/json");
  }
  if (token) {
    resolvedHeaders.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...init,
    headers: resolvedHeaders,
    body: typeof body === "string" ? body : body ? JSON.stringify(body) : undefined,
  });

  const contentType = response.headers.get("Content-Type") || "";
  const isJson = contentType.includes("application/json");
  const payload = isJson ? await response.json().catch(() => null) : await response.text();

  if (!response.ok) {
    const error = new Error(
      (payload && typeof payload === "object" && "message" in payload
        ? (payload as { message: string }).message
        : response.statusText) || "Request failed",
    );
    (error as Error & { status?: number; payload?: unknown }).status = response.status;
    (error as Error & { status?: number; payload?: unknown }).payload = payload;
    throw error;
  }

  return payload as TResponse;
}

export const apiConfig = {
  baseUrl: API_BASE_URL,
  searchAiBaseUrl: SEARCH_AI_BASE_URL,
};
