import { useState } from "react";
import { Search, MapPin, Zap, Navigation } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

interface LandingPageProps {
  onSearch: (city: string) => void;
  popularCities: string[];
}

export function LandingPage({ onSearch, popularCities }: LandingPageProps) {
  const [searchInput, setSearchInput] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onSearch(searchInput.trim());
    }
  };

  const handleCityClick = (city: string) => {
    onSearch(city);
  };

  const handleLocateMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // In a real app, this would reverse geocode the coordinates to get city name
          // For now, we'll simulate with a popular city
          const simulatedCity = popularCities[Math.floor(Math.random() * popularCities.length)];
          onSearch(simulatedCity);
        },
        (error) => {
          alert("Unable to get your location. Please search for a city manually.");
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-slate-900 flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 p-6">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Zap className="w-6 h-6 text-primary" />
            <div className="absolute inset-0 w-6 h-6 text-primary animate-pulse opacity-50" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
            Motion
          </h1>
        </div>
      </div>

      {/* Main Content - Centered like Google */}
      <div className="flex-1 flex flex-col justify-center px-4 -mt-20">
        <div className="max-w-2xl mx-auto w-full space-y-8">
          {/* Logo and Title */}
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center gap-4">
              <div className="relative">
                <Zap className="w-16 h-16 text-primary drop-shadow-lg" />
                <div className="absolute inset-0 w-16 h-16 text-primary animate-pulse opacity-30" />
                <div className="absolute -inset-2 bg-primary/10 rounded-full blur-xl" />
              </div>
              <h1 className="text-6xl font-bold bg-gradient-to-r from-primary via-purple-400 to-primary bg-clip-text text-transparent tracking-tight">
                Motion
              </h1>
            </div>
            <p className="text-2xl text-muted-foreground leading-relaxed">
              Discover amazing events happening in cities around you
            </p>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="space-y-6">
            <div className="relative group">
              <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5 transition-colors group-focus-within:text-primary" />
              <Input
                placeholder="Search for a city..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-14 h-16 text-lg rounded-2xl border-2 border-border bg-card/50 backdrop-blur-sm focus:border-primary focus:bg-card shadow-2xl transition-all duration-300 hover:shadow-primary/10"
              />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/5 via-transparent to-purple-400/5 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </div>
            
            <div className="flex justify-center gap-4">
              <Button 
                type="submit" 
                size="lg" 
                className="px-10 py-3 rounded-2xl bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-lg hover:shadow-primary/25 transition-all duration-300"
                disabled={!searchInput.trim()}
              >
                <Search className="w-5 h-5 mr-2" />
                Find Events
              </Button>
              
              <Button 
                type="button" 
                variant="outline" 
                size="lg" 
                onClick={handleLocateMe}
                className="px-10 py-3 rounded-2xl border-2 border-border bg-card/50 backdrop-blur-sm hover:bg-accent/50 hover:border-primary/50 transition-all duration-300"
              >
                <Navigation className="w-5 h-5 mr-2" />
                Locate Me
              </Button>
            </div>
          </form>

          {/* Popular Cities */}
          <div className="space-y-6">
            <p className="text-center text-muted-foreground text-lg">
              Or explore events in popular cities:
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {popularCities.map((city, index) => (
                <button
                  key={city}
                  onClick={() => handleCityClick(city)}
                  className="group flex items-center gap-2 px-5 py-3 rounded-xl border border-border bg-card/30 backdrop-blur-sm hover:bg-accent/50 hover:border-primary/50 transition-all duration-300 text-muted-foreground hover:text-foreground hover:shadow-lg hover:shadow-primary/10"
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animation: 'fadeInUp 0.6s ease-out forwards'
                  }}
                >
                  <MapPin className="w-4 h-4 transition-colors group-hover:text-primary" />
                  {city}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 p-8 text-center">
        <p className="text-muted-foreground text-lg">
          Find concerts, festivals, workshops, and more in your city
        </p>
        <div className="mt-4 flex justify-center">
          <div className="h-px w-32 bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>
      </div>
    </div>
  );
}