import { useState } from "react";
import { LandingPage } from "./components/LandingPage";
import { SearchResultsPage } from "./components/SearchResultsPage";
import { mockEvents } from "./components/data/mockEvents";

export default function App() {
  const [currentView, setCurrentView] = useState<"landing" | "results">("landing");
  const [searchQuery, setSearchQuery] = useState("");

  const uniqueCities = Array.from(new Set(mockEvents.map(event => event.city)));

  const handleSearch = (city: string) => {
    setSearchQuery(city);
    setCurrentView("results");
  };

  const handleBackToLanding = () => {
    setCurrentView("landing");
    setSearchQuery("");
  };

  const handleNewSearch = (city: string) => {
    setSearchQuery(city);
    // Stay on results page but update the search
  };

  if (currentView === "landing") {
    return (
      <LandingPage 
        onSearch={handleSearch}
        popularCities={uniqueCities}
      />
    );
  }

  return (
    <SearchResultsPage
      searchQuery={searchQuery}
      events={mockEvents}
      onBack={handleBackToLanding}
      onNewSearch={handleNewSearch}
    />
  );
}