import { Calendar, MapPin, Users, Clock } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { ImageWithFallback } from "./figma/ImageWithFallback";

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  city: string;
  category: string;
  price: string;
  attendees: number;
  imageUrl: string;
}

interface EventCardProps {
  event: Event;
  onClick?: (event: Event) => void;
}

export function EventCard({ event, onClick }: EventCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      music: "bg-purple-100 text-purple-800",
      food: "bg-orange-100 text-orange-800",
      art: "bg-blue-100 text-blue-800",
      sports: "bg-green-100 text-green-800",
      tech: "bg-gray-100 text-gray-800",
      business: "bg-red-100 text-red-800"
    };
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  return (
    <Card 
      className="overflow-hidden hover:shadow-lg transition-shadow duration-200 cursor-pointer"
      onClick={() => onClick?.(event)}
    >
      <div className="relative">
        <ImageWithFallback
          src={event.imageUrl}
          alt={event.title}
          className="w-full h-48 object-cover"
        />
        <Badge 
          className={`absolute top-3 left-3 ${getCategoryColor(event.category)}`}
          variant="secondary"
        >
          {event.category}
        </Badge>
      </div>
      
      <CardContent className="p-4">
        <div className="space-y-3">
          <div>
            <h3 className="line-clamp-2">{event.title}</h3>
            <p className="text-muted-foreground mt-1 line-clamp-2">
              {event.description}
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(event.date)}</span>
              <Clock className="w-4 h-4 ml-2" />
              <span>{event.time}</span>
            </div>
            
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span className="line-clamp-1">{event.location}, {event.city}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>{event.attendees} attending</span>
              </div>
              <div className="font-medium text-primary">
                {event.price === "0" ? "Free" : `$${event.price}`}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}