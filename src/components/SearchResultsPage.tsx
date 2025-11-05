import { useState, useMemo } from "react";
import { EventCard, Event } from "./EventCard";
import { SearchFilters } from "./SearchFilters";
import { EventDetails } from "./EventDetails";
import { ArrowLeft, MapPin, Zap } from "lucide-react";
import { Button } from "./ui/button";

interface SearchResultsPageProps {
  searchQuery: string;
  events: Event[];
  onBack: () => void;
  onNewSearch: (city: string) => void;
}

export function SearchResultsPage({ 
  searchQuery, 
  events, 
  onBack, 
  onNewSearch 
}: SearchResultsPageProps) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDateFilter, setSelectedDateFilter] = useState("all");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isEventDetailsOpen, setIsEventDetailsOpen] = useState(false);

  const filteredEvents = useMemo(() => {
    let filtered = events;

    // Filter by city search
    if (searchQuery.trim()) {
      filtered = filtered.filter(event =>
        event.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(event => event.category === selectedCategory);
    }

    // Filter by date
    if (selectedDateFilter !== "all") {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.date);
        
        switch (selectedDateFilter) {
          case "today":
            return eventDate.toDateString() === today.toDateString();
          case "tomorrow":
            return eventDate.toDateString() === tomorrow.toDateString();
          case "this-week":
            const weekFromNow = new Date(today);
            weekFromNow.setDate(today.getDate() + 7);
            return eventDate >= today && eventDate <= weekFromNow;
          case "this-month":
            return eventDate.getMonth() === today.getMonth() && 
                   eventDate.getFullYear() === today.getFullYear();
          default:
            return true;
        }
      });
    }

    return filtered;
  }, [searchQuery, events, selectedCategory, selectedDateFilter]);

  const handleClearFilters = () => {
    setSelectedCategory("all");
    setSelectedDateFilter("all");
  };

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setIsEventDetailsOpen(true);
  };

  const handleCloseEventDetails = () => {
    setIsEventDetailsOpen(false);
    setSelectedEvent(null);
  };

  const handleSearchSubmit = (newQuery: string) => {
    if (newQuery.trim() && newQuery !== searchQuery) {
      onNewSearch(newQuery);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-slate-900">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">Motion</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="max-w-2xl mx-auto mb-8">
          <SearchFilters
            searchQuery={searchQuery}
            onSearchSubmit={handleSearchSubmit}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            selectedDateFilter={selectedDateFilter}
            setSelectedDateFilter={setSelectedDateFilter}
            onClearFilters={handleClearFilters}
          />
        </div>

        {/* Results */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <h2>Events in "{searchQuery}"</h2>
            <span className="text-muted-foreground">
              ({filteredEvents.length} found)
            </span>
          </div>

          {filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <EventCard 
                  key={event.id} 
                  event={event} 
                  onClick={handleEventClick}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="space-y-3">
                <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
                  <MapPin className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3>No events found</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  We couldn't find any events matching your search criteria in "{searchQuery}". 
                  Try adjusting your filters or search for a different city.
                </p>
                <Button 
                  variant="outline" 
                  onClick={onBack}
                  className="mt-4"
                >
                  Try Another City
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Event Details Modal */}
      <EventDetails
        event={selectedEvent}
        isOpen={isEventDetailsOpen}
        onClose={handleCloseEventDetails}
      />
    </div>
  );
}