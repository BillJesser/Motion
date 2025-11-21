import { useEffect, useState } from "react";
import { AlertTriangle, CalendarPlus } from "lucide-react";
import { getEventsByUser, type MotionEvent } from "../../api/events";
import { MotionEventCard } from "../../components/events/MotionEventCard";
import { Button } from "../../components/ui/button";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export function MyEventsPage() {
  const { user, tokens } = useAuth();
  const accessToken = tokens?.accessToken;
  const [events, setEvents] = useState<MotionEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchEvents = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const response = await getEventsByUser(user.email, accessToken);
      setEvents(response.items ?? []);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unable to load your hosted events.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.email]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My hosted events</h1>
          <p className="text-muted-foreground">
            Manage events you&apos;ve brought to Motion. Create a new one to grow your community.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchEvents} disabled={loading}>
            Refresh
          </Button>
          <Button onClick={() => navigate("/create-event")} className="flex items-center gap-2">
            <CalendarPlus className="w-4 h-4" />
            Create event
          </Button>
        </div>
      </header>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-64 rounded-xl border border-border/60 bg-card/60 animate-pulse"
            />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 mt-0.5" />
          <span>{error}</span>
        </div>
      ) : events.length === 0 ? (
        <div className="rounded-xl border border-border/60 bg-card/60 p-6 text-center text-muted-foreground space-y-3">
          <p>You haven&apos;t created any events yet.</p>
          <Button onClick={() => navigate("/create-event")} className="flex items-center gap-2 mx-auto">
            <CalendarPlus className="w-4 h-4" />
            Create your first event
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <MotionEventCard key={event.eventId} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}

