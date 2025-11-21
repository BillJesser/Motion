import { CalendarDays, Clock, MapPin, Globe, BookmarkPlus, BookmarkCheck, ExternalLink } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import type { AiEvent } from "../../api/events";

interface AiEventCardProps {
  event: AiEvent;
  isSaved?: boolean;
  isSaving?: boolean;
  onSave?: (event: AiEvent) => void;
  onRemove?: (event: AiEvent) => void;
  onViewDetails?: (event: AiEvent) => void;
}

function formatDate(date: string) {
  return Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

export function AiEventCard({
  event,
  isSaved,
  isSaving,
  onSave,
  onRemove,
  onViewDetails,
}: AiEventCardProps) {
  return (
    <Card className="overflow-hidden border border-border/60 bg-card/80 backdrop-blur">
      <CardHeader className="space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="secondary" className="uppercase tracking-wide text-xs">
            AI Discovery
          </Badge>
          {event.tags?.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>
        <div>
          <h3 className="text-lg font-semibold line-clamp-2">{event.title}</h3>
          {event.description && (
            <p className="text-sm text-muted-foreground line-clamp-3">{event.description}</p>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-primary" />
          <span>
            {formatDate(event.start_date)}
            {event.end_date && event.end_date !== event.start_date ? ` - ${formatDate(event.end_date)}` : ""}
          </span>
        </div>
        {(event.start_time || event.end_time) && (
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            <span>
              {event.start_time}
              {event.end_time ? ` - ${event.end_time}` : ""} {event.timezone}
            </span>
          </div>
        )}
        {event.location && (
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-primary shrink-0 mt-1" />
            <div>
              <p>
                {event.location.venue ?? event.location.address ?? "Venue TBA"}
                {event.location.address && event.location.venue ? ` · ${event.location.address}` : ""}
              </p>
              <p className="text-muted-foreground">
                {[event.location.city, event.location.state, event.location.country].filter(Boolean).join(", ")}
              </p>
            </div>
          </div>
        )}
        {event.source_url && (
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-primary" />
            <a
              href={event.source_url}
              target="_blank"
              rel="noreferrer"
              className="text-primary text-sm underline-offset-4 hover:underline"
            >
              Source
            </a>
          </div>
        )}
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

