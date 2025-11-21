import { CalendarDays, Clock, MapPin, BookmarkCheck, BookmarkPlus, ExternalLink } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import type { MotionEvent } from "../../api/events";

interface MotionEventCardProps {
  event: MotionEvent;
  isSaved?: boolean;
  isSaving?: boolean;
  onSave?: (event: MotionEvent) => void;
  onRemove?: (event: MotionEvent) => void;
  onViewDetails?: (event: MotionEvent) => void;
}

function toDate(value?: string | number | null) {
  if (value === undefined || value === null) return null;
  if (typeof value === "number") {
    const isMilliseconds = value > 1e12;
    return new Date(isMilliseconds ? value : value * 1000);
  }
  return new Date(value);
}

function formatDate(dateTime: string | number) {
  const date = toDate(dateTime);
  if (!date || Number.isNaN(date.getTime())) return "";
  return Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(date);
}

function formatTime(dateTime: string | number) {
  const date = toDate(dateTime);
  if (!date || Number.isNaN(date.getTime())) return "";
  return Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function MotionEventCard({
  event,
  isSaved,
  isSaving,
  onSave,
  onRemove,
  onViewDetails,
}: MotionEventCardProps) {
  const primaryPhoto = event.photoUrls?.[0];
  return (
    <Card className="overflow-hidden border border-border/60 bg-card/80 backdrop-blur">
      {primaryPhoto ? (
        <div className="h-40 w-full overflow-hidden">
          <img
            src={primaryPhoto}
            alt={event.name}
            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
            loading="lazy"
          />
        </div>
      ) : (
        <div className="h-40 w-full bg-gradient-to-br from-primary/20 via-purple-500/10 to-blue-500/20" />
      )}
      <CardHeader className="space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="secondary" className="uppercase tracking-wide text-xs">
            Community
          </Badge>
          {event.tags?.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>
        <div>
          <h3 className="text-lg font-semibold line-clamp-2">{event.name}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {event.dateTime && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-primary" />
              <span>{formatDate(event.dateTime)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              <span>{formatTime(event.dateTime)}</span>
            </div>
          </div>
        )}
        <div className="flex items-start gap-2">
          <MapPin className="w-4 h-4 text-primary shrink-0 mt-1" />
          <div>
            <p>
              {event.location.venue
                ? `${event.location.venue}${event.location.address ? ` · ${event.location.address}` : ""}`
                : event.location.address}
            </p>
            <p className="text-muted-foreground">
              {event.location.city}
              {event.location.state ? `, ${event.location.state}` : ""}
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2">
        {onViewDetails && (
          <Button variant="ghost" size="sm" onClick={() => onViewDetails(event)}>
            <ExternalLink className="w-4 h-4 mr-2" />
            Details
          </Button>
        )}
        {isSaved ? (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onRemove?.(event)}
            disabled={isSaving || !onRemove}
          >
            <BookmarkCheck className="w-4 h-4 mr-2" />
            {isSaving ? "Updating..." : "Saved"}
          </Button>
        ) : (
          onSave && (
            <Button size="sm" onClick={() => onSave(event)} disabled={isSaving}>
              <BookmarkPlus className="w-4 h-4 mr-2" />
              {isSaving ? "Saving..." : "Save"}
            </Button>
          )
        )}
      </CardFooter>
    </Card>
  );
}
