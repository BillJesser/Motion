import { Calendar, MapPin, Users, Clock, Share2, Heart, ExternalLink, Ticket } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Event } from "./EventCard";

interface EventDetailsProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EventDetails({ event, isOpen, onClose }: EventDetailsProps) {
  if (!event) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
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

  const handleGetTickets = () => {
    // In a real app, this would navigate to a ticketing system
    alert(`Redirecting to ticket purchase for: ${event.title}`);
  };

  const handleSaveEvent = () => {
    // In a real app, this would save to user's favorites
    alert("Event saved to your favorites!");
  };

  const handleShare = () => {
    // In a real app, this would open share options
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: event.description,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  const handleGetDirections = () => {
    // In a real app, this would open maps with directions
    const query = encodeURIComponent(`${event.location}, ${event.city}`);
    window.open(`https://maps.google.com/maps?q=${query}`, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-4">
          <div className="relative">
            <ImageWithFallback
              src={event.imageUrl}
              alt={event.title}
              className="w-full h-64 object-cover rounded-lg"
            />
            <Badge 
              className={`absolute top-3 left-3 ${getCategoryColor(event.category)}`}
              variant="secondary"
            >
              {event.category}
            </Badge>
          </div>
          
          <div className="text-left space-y-2">
            <DialogTitle className="text-left">{event.title}</DialogTitle>
            <p className="text-muted-foreground">{event.description}</p>
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Event Details */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">{formatDate(event.date)}</p>
                    <p className="text-muted-foreground">{event.time}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">{event.location}</p>
                    <p className="text-muted-foreground">{event.city}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">{event.attendees} people attending</p>
                    <p className="text-muted-foreground">Join the community</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Ticket className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">
                      {event.price === "0" ? "Free Entry" : `$${event.price}`}
                    </p>
                    <p className="text-muted-foreground">
                      {event.price === "0" ? "No ticket required" : "Per person"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <Separator />
          
          {/* About this event */}
          <div className="space-y-3">
            <h3>About this event</h3>
            <p className="text-muted-foreground leading-relaxed">
              {event.description} This is a fantastic opportunity to connect with like-minded people 
              and experience something truly special in {event.city}. Whether you're a local or 
              visiting, this event promises to be memorable and engaging for all attendees.
            </p>
          </div>
          
          <Separator />
          
          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={handleGetTickets} className="flex-1">
              <Ticket className="w-4 h-4 mr-2" />
              {event.price === "0" ? "Register Free" : "Get Tickets"}
            </Button>
            
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={handleSaveEvent}>
                <Heart className="w-4 h-4" />
              </Button>
              
              <Button variant="outline" size="icon" onClick={handleShare}>
                <Share2 className="w-4 h-4" />
              </Button>
              
              <Button variant="outline" onClick={handleGetDirections}>
                <ExternalLink className="w-4 h-4 mr-2" />
                Directions
              </Button>
            </div>
          </div>
          
          {/* Additional info */}
          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <h4>Important Information</h4>
            <ul className="text-muted-foreground space-y-1">
              <li>• Please arrive 15 minutes before the event starts</li>
              <li>• Contact organizers for accessibility requirements</li>
              <li>• Refund policy: Full refund available up to 24 hours before event</li>
              {event.category === "food" && <li>• Dietary restrictions can be accommodated</li>}
              {event.category === "music" && <li>• Age restriction: All ages welcome</li>}
              {event.category === "art" && <li>• Photography allowed without flash</li>}
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}