import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { AlertTriangle, LocateFixed, MapPin, Search } from "lucide-react";
import { searchAiEvents, searchEvents, type AiEvent, type MotionEvent } from "../../api/events";
import { removeSavedEvent, saveEvent } from "../../api/users";
import { MotionEventCard } from "../../components/events/MotionEventCard";
import { AiEventCard } from "../../components/events/AiEventCard";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Separator } from "../../components/ui/separator";
import { Progress } from "../../components/ui/progress";
import { useAuth } from "../../context/AuthContext";

interface DiscoverFormValues {
  city: string;
  state: string;
  country: string;
  zip?: string;
  startDate: string;
  startTimeOfDay?: string;
  endDate: string;
  endTimeOfDay?: string;
  windowMinutes?: number;
  radiusMiles: number;
}

interface PersistedDiscoverState {
  userEmail: string | null;
  formValues: DiscoverFormValues;
  coordinates: { lat: number; lng: number } | null;
  motionEvents: MotionEvent[];
  aiEvents: AiEvent[];
  hasSearched: boolean;
  searchSummary: string | null;
  savedAiSignatures: string[];
}

const today = new Date();
const defaultStartDate = today.toISOString().split("T")[0];
const defaultEndDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

const DISCOVER_STATE_KEY = "motion.discoverState";

function formatDateTimeWithOffset(date: Date) {
  const pad = (value: number) => value.toString().padStart(2, "0");
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());

  const offsetMinutes = -date.getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? "+" : "-";
  const offsetHours = pad(Math.floor(Math.abs(offsetMinutes) / 60));
  const offsetMins = pad(Math.abs(offsetMinutes) % 60);

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${sign}${offsetHours}:${offsetMins}`;
}

function buildAddress(values: DiscoverFormValues) {
  return [values.city, values.state, values.zip, values.country]
    .map((value) => value?.trim())
    .filter(Boolean)
    .join(", ");
}

function buildSignature(event: AiEvent) {
  return `${event.source_url ?? ""}::${event.title}::${event.start_date}`;
}

export function DiscoverPage() {
  const { user, tokens, updateUser } = useAuth();
  const accessToken = tokens?.accessToken;

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    setValue,
    watch,
    formState: { isSubmitting },
  } = useForm<DiscoverFormValues>({
    defaultValues: {
      city: "",
      state: "",
      country: "USA",
      zip: "",
      startDate: defaultStartDate,
      startTimeOfDay: "",
      endDate: defaultEndDate,
      endTimeOfDay: "",
      windowMinutes: undefined,
      radiusMiles: 15,
    },
  });

  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [geolocationError, setGeolocationError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [locationMode, setLocationMode] = useState<"auto" | "manual">("auto");
  const [locationStatus, setLocationStatus] = useState<string | null>(null);

  const [motionEvents, setMotionEvents] = useState<MotionEvent[]>([]);
  const [aiEvents, setAiEvents] = useState<AiEvent[]>([]);
  const [loadingMotion, setLoadingMotion] = useState(false);
  const [loadingAi, setLoadingAi] = useState(false);
  const [motionError, setMotionError] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [searchSummary, setSearchSummary] = useState<string | null>(null);
  const [aiProgress, setAiProgress] = useState(0);
  const [hasSearched, setHasSearched] = useState(false);
  const [hasRestoredState, setHasRestoredState] = useState(false);
  const previousUserEmailRef = useRef<string | null>(null);

  const savedMotionIds = useMemo(() => {
    const ids = new Set<string>();
    user?.savedEvents
      ?.filter((item) => item.source === "motion")
      .forEach((item) => ids.add(item.eventId));
    return ids;
  }, [user?.savedEvents]);

  const [savedAiSignatures, setSavedAiSignatures] = useState<Set<string>>(new Set());

  const [savingMotionId, setSavingMotionId] = useState<string | null>(null);
  const [savingAiSignature, setSavingAiSignature] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      setHasRestoredState(true);
      return;
    }
    const raw = window.sessionStorage.getItem(DISCOVER_STATE_KEY);
    if (!raw) {
      setHasRestoredState(true);
      return;
    }
    try {
      const parsed = JSON.parse(raw) as PersistedDiscoverState;
      if (parsed.userEmail && parsed.userEmail !== (user?.email ?? null)) {
        setHasRestoredState(true);
      } else {
        const formValues: DiscoverFormValues = {
          city: parsed.formValues?.city ?? "",
          state: parsed.formValues?.state ?? "",
          country: parsed.formValues?.country ?? "USA",
          zip: parsed.formValues?.zip ?? "",
          startDate: parsed.formValues?.startDate ?? defaultStartDate,
          startTimeOfDay: parsed.formValues?.startTimeOfDay ?? "",
          endDate: parsed.formValues?.endDate ?? defaultEndDate,
          endTimeOfDay: parsed.formValues?.endTimeOfDay ?? "",
          windowMinutes:
            typeof parsed.formValues?.windowMinutes === "number"
              ? parsed.formValues.windowMinutes
              : undefined,
          radiusMiles: Number(parsed.formValues?.radiusMiles) || 15,
        };
        reset(formValues);
        setCoordinates(parsed.coordinates ?? null);
        setMotionEvents(parsed.motionEvents ?? []);
        setAiEvents(parsed.aiEvents ?? []);
        setHasSearched(parsed.hasSearched ?? false);
        setSearchSummary(parsed.searchSummary ?? null);
        setSavedAiSignatures(new Set(parsed.savedAiSignatures ?? []));
      }
    } catch (error) {
      console.error("Failed to restore discover search state", error);
    } finally {
      setHasRestoredState(true);
    }
  }, [reset, user?.email]);

  useEffect(() => {
    if (!hasRestoredState) return;
    const previousEmail = previousUserEmailRef.current;
    const currentEmail = user?.email ?? null;
    if (previousEmail && currentEmail && previousEmail !== currentEmail) {
      setCoordinates(null);
      setMotionEvents([]);
      setAiEvents([]);
      setHasSearched(false);
      setSearchSummary(null);
      setSavedAiSignatures(new Set());
      if (typeof window !== "undefined") {
        window.sessionStorage.removeItem(DISCOVER_STATE_KEY);
      }
    }
    previousUserEmailRef.current = currentEmail;
  }, [user?.email, hasRestoredState]);

  useEffect(() => {
    if (!hasRestoredState || typeof window === "undefined") return;
    const currentValues = getValues();
    if (!hasSearched && motionEvents.length === 0 && aiEvents.length === 0) {
      window.sessionStorage.removeItem(DISCOVER_STATE_KEY);
      return;
    }
    const state: PersistedDiscoverState = {
      userEmail: user?.email ?? null,
      formValues: {
        city: currentValues.city ?? "",
        state: currentValues.state ?? "",
        country: currentValues.country ?? "USA",
        zip: currentValues.zip ?? "",
        startDate: currentValues.startDate ?? defaultStartDate,
        startTimeOfDay: currentValues.startTimeOfDay ?? "",
        endDate: currentValues.endDate ?? defaultEndDate,
        endTimeOfDay: currentValues.endTimeOfDay ?? "",
        windowMinutes:
          typeof currentValues.windowMinutes === "number" && !Number.isNaN(currentValues.windowMinutes)
            ? currentValues.windowMinutes
            : undefined,
        radiusMiles: Number(currentValues.radiusMiles) || 15,
      },
      coordinates,
      motionEvents,
      aiEvents,
      hasSearched,
      searchSummary,
      savedAiSignatures: Array.from(savedAiSignatures),
    };
    window.sessionStorage.setItem(DISCOVER_STATE_KEY, JSON.stringify(state));
  }, [
    aiEvents,
    coordinates,
    getValues,
    hasRestoredState,
    hasSearched,
    motionEvents,
    savedAiSignatures,
    searchSummary,
    user?.email,
  ]);

  useEffect(() => {
    if (!loadingAi) {
      setAiProgress(0);
      return;
    }
    setAiProgress(15);
    const interval = window.setInterval(() => {
      setAiProgress((prev) => {
        if (prev >= 90) return prev;
        const increment = Math.random() * 12 + 3;
        return Math.min(prev + increment, 90);
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [loadingAi]);

  type ReverseGeocodeResponse = {
    address?: {
      house_number?: string;
      road?: string;
      neighbourhood?: string;
      city?: string;
      town?: string;
      village?: string;
      hamlet?: string;
      state?: string;
      region?: string;
      county?: string;
      postcode?: string;
      country?: string;
    };
    display_name?: string;
  };

  const requestGeolocation = useCallback(() => {
    if (typeof window === "undefined") return;
    if (!navigator.geolocation) {
      setGeolocationError("Geolocation is not supported in this browser.");
      setLocationStatus(null);
      setLocationMode("manual");
      return;
    }
    setGeolocationError(null);
    setLocationStatus("Requesting permission to use your location...");
    setIsGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCoordinates({ lat: latitude, lng: longitude });
        const coordLabel = `(${latitude.toFixed(3)}, ${longitude.toFixed(3)})`;

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
            {
              headers: { "Accept-Language": "en" },
            },
          );
          if (!response.ok) {
            throw new Error("Reverse geocoding failed");
          }
          const data = (await response.json()) as ReverseGeocodeResponse;
          const addr = data.address ?? {};
          const city = addr.city ?? addr.town ?? addr.village ?? addr.hamlet ?? "";
          const state = addr.state ?? addr.region ?? addr.county ?? "";
          const zip = addr.postcode ?? "";
          const country = addr.country ?? "";

          const currentValues = getValues();
          if (!currentValues.city && city) setValue("city", city);
          if (!currentValues.state && state) setValue("state", state);
          if (!currentValues.zip && zip) setValue("zip", zip);
          if (!currentValues.country && country) setValue("country", country);

          setLocationStatus(
            city || state || zip || country
              ? `Using your current location ${coordLabel}. Fields were auto-filled; adjust if needed.`
              : `Using your current location ${coordLabel}. Add any missing details.`,
          );
        } catch (err) {
          console.error("Reverse geocode failed", err);
          setLocationStatus(`Using your current location ${coordLabel}. Enter city/state if missing.`);
          setGeolocationError("We could not look up your address automatically.");
        } finally {
          setIsGettingLocation(false);
        }
      },
      (error) => {
        setIsGettingLocation(false);
        const message =
          error.message || "Unable to access your location. Enter a city/ZIP manually instead.";
        setGeolocationError(message);
        setLocationStatus(null);
        setLocationMode("manual");
        setCoordinates(null);
      },
      { enableHighAccuracy: true, timeout: 15000 },
    );
  }, [getValues, setValue]);

  useEffect(() => {
    if (locationMode === "auto") {
      requestGeolocation();
    } else {
      setLocationStatus(null);
      setCoordinates(null);
    }
  }, [locationMode, requestGeolocation]);

  const onSubmit = async (values: DiscoverFormValues) => {
    setFormError(null);
    setMotionError(null);
    setAiError(null);

    const { startDate, endDate } = values;
    if (!startDate) {
      setFormError("Please provide at least a start date.");
      return;
    }

    if (endDate && new Date(startDate) > new Date(endDate)) {
      setFormError("Start date must be before end date.");
      return;
    }

    const hasStartTime = Boolean(values.startTimeOfDay?.trim());
    const hasEndTime = Boolean(values.endTimeOfDay?.trim());
    const effectiveEndDate = endDate || startDate;

    if (
      !coordinates &&
      !((values.city?.trim() && values.state?.trim()) || values.zip?.trim())
    ) {
      setFormError("Enter a city & state, a ZIP code, or switch to current location.");
      return;
    }

    const startBaseTime = hasStartTime ? values.startTimeOfDay : "00:00";
    const endBaseTime = hasEndTime ? values.endTimeOfDay : "23:59";

    const startDateTime = new Date(`${startDate}T${startBaseTime}`);
    const endDateTime = effectiveEndDate ? new Date(`${effectiveEndDate}T${endBaseTime}`) : null;

    const startIso = formatDateTimeWithOffset(startDateTime);
    const endIso = endDateTime ? formatDateTimeWithOffset(endDateTime) : undefined;
    const windowMinutes =
      typeof values.windowMinutes === "number" && values.windowMinutes > 0
        ? values.windowMinutes
        : hasStartTime
          ? 180
          : undefined;

    const radius = values.radiusMiles || 10;

    const motionLocationParams = coordinates
      ? { lat: coordinates.lat, lng: coordinates.lng }
      : {
          address: buildAddress(values),
          city: values.city || undefined,
          state: values.state || undefined,
          country: values.country || undefined,
          zip: values.zip || undefined,
        };
    const motionParams = {
      ...motionLocationParams,
      windowMinutes,
    };

    const aiParams = coordinates
      ? { lat: coordinates.lat, lng: coordinates.lng }
      : {
          city: values.city,
          state: values.state,
          country: values.country,
        };

    setLoadingMotion(true);
    setLoadingAi(true);
    setHasSearched(true);

    const summaryLocation = coordinates
      ? "your current location"
      : buildAddress(values) || "your selected filters";

    const startLabel = hasStartTime ? `${startDate} ${values.startTimeOfDay}` : startDate;
    const hasExplicitRange = Boolean(endDate) || hasEndTime;
    const endLabel = hasExplicitRange
      ? `${effectiveEndDate}${hasEndTime ? ` ${values.endTimeOfDay}` : ""}`
      : undefined;

    setSearchSummary(
      hasExplicitRange && endLabel
        ? `Showing results near ${summaryLocation} between ${startLabel} and ${endLabel}`
        : `Showing results near ${summaryLocation} on ${startLabel}`,
    );

    try {
      const motionPromise = searchEvents(
        {
          ...motionParams,
          radiusMiles: radius,
          startTime: startIso,
          endTime: endIso,
        },
        accessToken,
      );

      const aiPromise = searchAiEvents({
        ...aiParams,
        start_date: startDate,
        end_date: effectiveEndDate,
        timezone,
        radius_miles: radius,
      });

      const [motionResult, aiResult] = await Promise.allSettled([motionPromise, aiPromise]);

      if (motionResult.status === "fulfilled") {
        setMotionEvents(motionResult.value.items ?? []);
      } else {
        const reason = motionResult.reason;
        setMotionError(
          reason instanceof Error ? reason.message : "Unable to load Motion community events.",
        );
      }

      if (aiResult.status === "fulfilled") {
        setAiEvents(aiResult.value.items ?? []);
        setAiProgress(100);
      } else {
        const reason = aiResult.reason;
        setAiError(
          reason instanceof Error ? reason.message : "Unable to load AI discovered events.",
        );
      }
    } finally {
      setTimeout(() => setAiProgress(0), 800);
      setLoadingMotion(false);
      setLoadingAi(false);
    }
  };

  const handleSaveMotionEvent = async (event: MotionEvent) => {
    if (!user || !accessToken) return;
    setSavingMotionId(event.eventId);
    try {
      const response = await saveEvent(
        { email: user.email, source: "motion", eventId: event.eventId },
        accessToken,
      );
      updateUser({
        ...user,
        savedEvents: response.savedEvents,
      });
    } catch (error) {
      console.error("Failed to save event", error);
    } finally {
      setSavingMotionId(null);
    }
  };

  const handleRemoveMotionEvent = async (event: MotionEvent) => {
    if (!user || !accessToken) return;
    setSavingMotionId(event.eventId);
    try {
      const response = await removeSavedEvent(
        { email: user.email, eventId: event.eventId, source: "motion" },
        accessToken,
      );
      updateUser({
        ...user,
        savedEvents: response.savedEvents,
      });
    } catch (error) {
      console.error("Failed to remove saved event", error);
    } finally {
      setSavingMotionId(null);
    }
  };

  const handleSaveAiEvent = async (event: AiEvent) => {
    if (!user || !accessToken) return;
    const signature = buildSignature(event);
    setSavingAiSignature(signature);
    try {
      const response = await saveEvent(
        { email: user.email, source: "ai", event },
        accessToken,
      );
      updateUser({
        ...user,
        savedEvents: response.savedEvents,
      });
      setSavedAiSignatures((prev) => {
        const next = new Set(prev);
        next.add(signature);
        return next;
      });
    } catch (error) {
      console.error("Failed to save AI event", error);
    } finally {
      setSavingAiSignature(null);
    }
  };

  const radiusValue = watch("radiusMiles");
  const startTimeValue = watch("startTimeOfDay");
  const hasStartTimeSelected = Boolean(startTimeValue?.trim());

  return (
    <div className="space-y-10">
      <section className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Discover events</h1>
          <p className="text-muted-foreground">
            Search community hosted events and AI-discovered happenings around your selected city or
            current location.
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid gap-6 rounded-2xl border border-border/60 bg-card/70 backdrop-blur p-6"
        >
          <div className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <Label htmlFor="locationMode" className="text-base">
                  Location
                </Label>
                <p className="text-sm text-muted-foreground">
                  Use your current location or enter a city/ZIP manually.
                </p>
              </div>
              <div className="w-full sm:w-[260px]">
                <div className="flex flex-col gap-2">
                  <select
                    id="locationMode"
                    className="h-10 w-full rounded-md border border-input bg-input-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    value={locationMode}
                    onChange={(e) => setLocationMode(e.target.value as "auto" | "manual")}
                  >
                    <option value="auto">Use my current location</option>
                    <option value="manual">Enter location manually</option>
                  </select>
                  {locationMode === "auto" && (
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={requestGeolocation}
                        disabled={isGettingLocation}
                        className="flex items-center gap-2"
                      >
                        <LocateFixed className="w-4 h-4" />
                        {isGettingLocation ? "Locating..." : "Refresh location"}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setLocationMode("manual")}
                      >
                        Switch to manual
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {locationMode === "auto" && (
              <div className="flex items-start gap-2 rounded-lg border border-border/60 bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 mt-0.5" />
                <div className="space-y-1">
                  <p>
                    {isGettingLocation
                      ? "Requesting permission to use your location..."
                      : locationStatus ||
                        "Auto-filling from your device location. You can still adjust the fields below."}
                  </p>
                </div>
              </div>
            )}

            {geolocationError && (
              <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                <AlertTriangle className="w-4 h-4 mt-0.5" />
                <span>{geolocationError}</span>
              </div>
            )}

            {locationMode === "manual" && (
              <div className="grid gap-4 sm:grid-cols-4">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" placeholder="Atlanta" {...register("city")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State / Region</Label>
                  <Input id="state" placeholder="GA" {...register("state")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zip">ZIP code</Label>
                  <Input id="zip" placeholder="30009" {...register("zip")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input id="country" placeholder="USA" {...register("country")} />
                </div>
              </div>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-5">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start date</Label>
              <Input id="startDate" type="date" {...register("startDate")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="startTimeOfDay">Start time (optional)</Label>
              <Input id="startTimeOfDay" type="time" {...register("startTimeOfDay")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End date</Label>
              <Input id="endDate" type="date" {...register("endDate")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTimeOfDay">End time (optional)</Label>
              <Input id="endTimeOfDay" type="time" {...register("endTimeOfDay")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="radiusMiles">Radius (miles)</Label>
              <Input
                id="radiusMiles"
                type="number"
                min={1}
                max={100}
                step={1}
                {...register("radiusMiles", { valueAsNumber: true })}
              />
              <p className="text-xs text-muted-foreground">
                Searching within {radiusValue || 0} miles.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="windowMinutes">Time window (minutes)</Label>
              <Input
                id="windowMinutes"
                type="number"
                min={15}
                step={15}
                placeholder={hasStartTimeSelected ? "180" : ""}
                {...register("windowMinutes", { valueAsNumber: true })}
              />
              <p className="text-xs text-muted-foreground">
                Optional. Defaults to 3 hours when a start time is provided.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <Button type="submit" disabled={isSubmitting} className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              {isSubmitting ? "Searching..." : "Search events"}
            </Button>

            {coordinates && (
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Using precise location ({coordinates.lat.toFixed(3)}, {coordinates.lng.toFixed(3)})
              </div>
            )}
          </div>

          {formError && (
            <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertTriangle className="w-4 h-4 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

        </form>
      </section>

      {searchSummary && (
        <div className="rounded-xl border border-border/60 bg-card/60 backdrop-blur px-4 py-3 text-sm text-muted-foreground">
          {searchSummary}
        </div>
      )}

      <section className="space-y-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-semibold">Community events</h2>
          <p className="text-muted-foreground text-sm">
            Events created by Motion organizers near your search area.
          </p>
        </div>

        {loadingMotion ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-64 rounded-xl border border-border/60 bg-card/60 animate-pulse"
              />
            ))}
          </div>
        ) : motionError ? (
          <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 mt-0.5" />
            <span>{motionError}</span>
          </div>
        ) : motionEvents.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {motionEvents.map((event) => (
              <MotionEventCard
                key={event.eventId}
                event={event}
                isSaved={savedMotionIds.has(event.eventId)}
                isSaving={savingMotionId === event.eventId}
                onSave={savedMotionIds.has(event.eventId) ? undefined : handleSaveMotionEvent}
                onRemove={savedMotionIds.has(event.eventId) ? handleRemoveMotionEvent : undefined}
              />
            ))}
          </div>
        ) : hasSearched ? (
          <div className="rounded-xl border border-border/60 bg-card/60 p-6 text-center text-muted-foreground">
            No community events found for your filters.
          </div>
        ) : (
          <div className="rounded-xl border border-border/60 bg-card/60 p-6 text-center text-muted-foreground">
            Start by searching for a city and date range to see community events.
          </div>
        )}
      </section>

      <Separator />

      <section className="space-y-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-semibold">AI discovered events</h2>
          <p className="text-muted-foreground text-sm">
            Gemini-powered discovery of events published across the web. Saving an event stores a
            complete copy in Motion.
          </p>
        </div>

        {loadingAi && (
          <div className="space-y-3 rounded-xl border border-border/60 bg-card/60 p-6">
            <p className="text-sm text-muted-foreground">
              Gathering events with AI. This can take up to a couple of minutes—hang tight!
            </p>
            <Progress value={aiProgress} />
          </div>
        )}

        {aiError && !loadingAi && (
          <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 mt-0.5" />
            <span>{aiError}</span>
          </div>
        )}

        {!loadingAi && aiEvents.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {aiEvents.map((event, index) => {
              const signature = buildSignature(event);
              return (
                <AiEventCard
                  key={`${event.source_url ?? event.title}-${index}`}
                  event={event}
                  isSaved={savedAiSignatures.has(signature)}
                  isSaving={savingAiSignature === signature}
                  onSave={savedAiSignatures.has(signature) ? undefined : handleSaveAiEvent}
                />
              );
            })}
          </div>
        ) : !loadingAi && hasSearched ? (
          <div className="rounded-xl border border-border/60 bg-card/60 p-6 text-center text-muted-foreground">
            No AI discovered events matched your search window.
          </div>
        ) : null}
      </section>
    </div>
  );
}
