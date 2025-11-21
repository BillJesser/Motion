import { useEffect, useMemo, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { getSavedEvents, removeSavedEvent, type SavedEventItem } from "../../api/users";
import { MotionEventCard } from "../../components/events/MotionEventCard";
import { AiEventCard } from "../../components/events/AiEventCard";
import { Button } from "../../components/ui/button";
import { useAuth } from "../../context/AuthContext";

export function SavedEventsPage() {
  const { user, tokens, updateUser } = useAuth();
  const accessToken = tokens?.accessToken;
  const [savedEvents, setSavedEvents] = useState<SavedEventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const fetchSavedEvents = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const response = await getSavedEvents(user.email, accessToken);
      setSavedEvents(response.items ?? []);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unable to load saved events.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.email]);

  const handleRemove = async (eventId: string, source: "motion" | "ai") => {
    if (!user || !accessToken) return;
    setRemovingId(eventId);
    try {
      const response = await removeSavedEvent({ email: user.email, eventId, source }, accessToken);
      updateUser({
        ...user,
        savedEvents: response.savedEvents,
      });
      await fetchSavedEvents();
    } catch (error) {
      console.error("Failed to remove saved event", error);
    } finally {
      setRemovingId(null);
    }
  };

  const { motionEvents, aiEvents } = useMemo(() => {
    const motion = savedEvents.filter((item) => item.source === "motion");
    const ai = savedEvents.filter((item) => item.source === "ai");
    return { motionEvents: motion, aiEvents: ai };
  }, [savedEvents]);

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Saved events</h1>
        <p className="text-muted-foreground">
          Your bookmarked community and AI discovered events live here for quick access.
        </p>
        <Button variant="secondary" size="sm" onClick={fetchSavedEvents} disabled={loading}>
          Refresh saved events
        </Button>
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
      ) : savedEvents.length === 0 ? (
        <div className="rounded-xl border border-border/60 bg-card/60 p-6 text-center text-muted-foreground">
          You haven&apos;t saved any events yet. Discover events and tap save to pin them here.
        </div>
      ) : (
        <div className="space-y-10">
          {motionEvents.length > 0 && (
            <section className="space-y-4">
              <div>
                <h2 className="text-2xl font-semibold">Community events</h2>
                <p className="text-sm text-muted-foreground">
                  Events hosted on Motion that you&apos;ve bookmarked.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {motionEvents.map((item) => (
                  <MotionEventCard
                    key={item.eventId}
                    event={item.event}
                    isSaved
                    isSaving={removingId === item.eventId}
                    onRemove={() => handleRemove(item.eventId, "motion")}
                  />
                ))}
              </div>
            </section>
          )}

          {aiEvents.length > 0 && (
            <section className="space-y-4">
              <div>
                <h2 className="text-2xl font-semibold">AI discovered events</h2>
                <p className="text-sm text-muted-foreground">
                  Events Motion preserved from the open web via AI discovery.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {aiEvents.map((item) => (
                  <AiEventCard
                    key={item.eventId}
                    event={item.event}
                    isSaved
                    isSaving={removingId === item.eventId}
                    onRemove={() => handleRemove(item.eventId, "ai")}
                  />
                ))}
              </div>
            </section>
          )}

          {motionEvents.length === 0 && aiEvents.length === 0 && (
            <div className="rounded-xl border border-border/60 bg-card/60 p-6 text-center text-muted-foreground">
              You haven&apos;t saved any events yet.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
