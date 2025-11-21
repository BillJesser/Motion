import { useState } from "react";
import { useForm } from "react-hook-form";
import { AlertTriangle, CheckCircle } from "lucide-react";
import { createEvent } from "../../api/events";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

interface CreateEventFormValues {
  name: string;
  description: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  venue: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  lat?: string;
  lng?: string;
  photoUrl?: string;
  tags?: string;
}

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

export function CreateEventPage() {
  const { user, tokens } = useAuth();
  const accessToken = tokens?.accessToken;
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [createdEventId, setCreatedEventId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<CreateEventFormValues>({
    defaultValues: {
      name: "",
      description: "",
      startDate: "",
      startTime: "",
      endDate: "",
      endTime: "",
      venue: "",
      address: "",
      city: "",
      state: "",
      zip: "",
      photoUrl: "",
      tags: "",
    },
  });

  if (!user) {
    return null;
  }

  const onSubmit = async (values: CreateEventFormValues) => {
    console.log("[CreateEvent] submit payload", values);
    setError(null);
    setSuccessMessage(null);
    setCreatedEventId(null);

    if (!values.startDate || !values.startTime) {
      setError("Start date and time are required.");
      return;
    }

    const start = new Date(`${values.startDate}T${values.startTime}`);
    if (Number.isNaN(start.getTime())) {
      setError("Invalid start date or time.");
      return;
    }

    let endDateTime: string | undefined;
    if (values.endDate || values.endTime) {
      const endDate = values.endDate || values.startDate;
      const endTime = values.endTime || values.startTime;
      const end = new Date(`${endDate}T${endTime}`);
      if (Number.isNaN(end.getTime())) {
        setError("Invalid end date or time.");
        return;
      }
      if (end < start) {
        setError("End time must be after start time.");
        return;
      }
      endDateTime = formatDateTimeWithOffset(end);
    }

    const lat = values.lat ? parseFloat(values.lat) : undefined;
    const lng = values.lng ? parseFloat(values.lng) : undefined;
    if ((values.lat && Number.isNaN(lat)) || (values.lng && Number.isNaN(lng))) {
      setError("Latitude and longitude must be valid numbers.");
      return;
    }

    const tags = values.tags
      ? values.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean)
      : undefined;

    const photoUrls = values.photoUrl
      ? values.photoUrl
          .split("\n")
          .map((url) => url.trim())
          .filter(Boolean)
      : undefined;

    try {
      const response = await createEvent(
        {
          name: values.name,
          description: values.description,
          dateTime: formatDateTimeWithOffset(start),
          endDateTime,
          createdByEmail: user.email,
          location: {
            venue: values.venue,
            address: values.address,
            city: values.city,
            state: values.state,
            zip: values.zip,
          },
          coordinates: lat !== undefined && lng !== undefined ? { lat, lng } : undefined,
          photoUrls,
          tags,
        },
        accessToken ?? "",
      );

      setSuccessMessage("Event created successfully!");
      setCreatedEventId(response.eventId);
      reset();
    } catch (err) {
      if (isApiError(err)) {
        const apiMessage =
          typeof err.payload?.message === "string" ? err.payload.message : "Unable to create the event.";
        const apiReason = typeof err.payload?.reason === "string" ? err.payload.reason : null;
        setError(apiReason ? `${apiMessage}: ${apiReason}` : apiMessage);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unable to create the event. Please try again.");
      }
    }
  };

  const onSubmitError = () => {
    setSuccessMessage(null);
    setCreatedEventId(null);
    setError("Please complete all required fields before publishing.");
  };

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Create a Motion event</h1>
        <p className="text-muted-foreground">
          Share your event with the Motion community. We&apos;ll geocode the address for discovery.
        </p>
      </header>

      <form
        onSubmit={handleSubmit(onSubmit, onSubmitError)}
        className="space-y-6 rounded-2xl border border-border/60 bg-card/70 backdrop-blur p-6"
      >
        <section className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2 space-y-2">
            <Label htmlFor="name">Event name</Label>
            <Input id="name" placeholder="Community Market" {...register("name", { required: true })} />
          </div>
          <div className="sm:col-span-2 space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe what makes this event special, who should attend, and any important details."
              rows={4}
              {...register("description", { required: true })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="startDate">Start date</Label>
            <Input id="startDate" type="date" {...register("startDate", { required: true })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="startTime">Start time</Label>
            <Input id="startTime" type="time" {...register("startTime", { required: true })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="endDate">End date</Label>
            <Input id="endDate" type="date" {...register("endDate")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="endTime">End time</Label>
            <Input id="endTime" type="time" {...register("endTime")} />
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2 space-y-2">
            <Label htmlFor="venue">Venue</Label>
            <Input id="venue" placeholder="Town Square" {...register("venue")} />
          </div>
          <div className="sm:col-span-2 space-y-2">
            <Label htmlFor="address">Street address</Label>
            <Input id="address" placeholder="123 Main St" {...register("address", { required: true })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input id="city" placeholder="Atlanta" {...register("city", { required: true })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="state">State</Label>
            <Input id="state" placeholder="GA" {...register("state", { required: true })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="zip">ZIP / Postal code</Label>
            <Input id="zip" placeholder="30303" {...register("zip", { required: true })} />
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="lat">Latitude (optional)</Label>
            <Input id="lat" placeholder="34.0522" {...register("lat")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lng">Longitude (optional)</Label>
            <Input id="lng" placeholder="-84.1234" {...register("lng")} />
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2 space-y-2">
            <Label htmlFor="photoUrl">Photo URLs (optional)</Label>
            <Textarea
              id="photoUrl"
              placeholder="https://example.com/photo.jpg"
              rows={2}
              {...register("photoUrl")}
            />
            <p className="text-xs text-muted-foreground">Enter one URL per line.</p>
          </div>
          <div className="sm:col-span-2 space-y-2">
            <Label htmlFor="tags">Tags (optional)</Label>
            <Input id="tags" placeholder="community, outdoor" {...register("tags")} />
            <p className="text-xs text-muted-foreground">Separate tags with commas.</p>
          </div>
        </section>

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            <AlertTriangle className="w-4 h-4 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="flex items-start gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm text-emerald-500">
            <CheckCircle className="w-4 h-4 mt-0.5" />
            <div className="space-y-1">
              <p>{successMessage}</p>
              {createdEventId && (
                <button
                  type="button"
                  onClick={() => navigate("/my-events")}
                  className="text-emerald-500 underline-offset-4 hover:underline"
                >
                  View my events
                </button>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating event..." : "Publish event"}
          </Button>
        </div>
      </form>
    </div>
  );
}

function isApiError(
  error: unknown,
): error is Error & { status?: number; payload?: { message?: string; reason?: string } } {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    "payload" in error &&
    typeof (error as { payload?: unknown }).payload === "object"
  );
}
