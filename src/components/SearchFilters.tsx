import { useState } from "react";
import { Search, Filter, Calendar } from "lucide-react";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

interface SearchFiltersProps {
  searchQuery: string;
  onSearchSubmit: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedDateFilter: string;
  setSelectedDateFilter: (filter: string) => void;
  onClearFilters: () => void;
}

export function SearchFilters({
  searchQuery,
  onSearchSubmit,
  selectedCategory,
  setSelectedCategory,
  selectedDateFilter,
  setSelectedDateFilter,
  onClearFilters
}: SearchFiltersProps) {
  const [inputValue, setInputValue] = useState(searchQuery);
  const categories = [
    { value: "all", label: "All Categories" },
    { value: "music", label: "Music" },
    { value: "food", label: "Food & Drink" },
    { value: "art", label: "Arts & Culture" },
    { value: "sports", label: "Sports" },
    { value: "tech", label: "Technology" },
    { value: "business", label: "Business" }
  ];

  const dateFilters = [
    { value: "all", label: "Any Date" },
    { value: "today", label: "Today" },
    { value: "tomorrow", label: "Tomorrow" },
    { value: "this-week", label: "This Week" },
    { value: "this-month", label: "This Month" }
  ];

  const hasActiveFilters = selectedCategory !== "all" || selectedDateFilter !== "all";

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSearchSubmit(inputValue.trim());
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search for a city..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="pl-10 h-12"
          />
        </div>
        <Button 
          type="submit" 
          className="h-12 px-6"
          disabled={!inputValue.trim()}
        >
          <Search className="w-4 h-4 mr-2" />
          Search
        </Button>
      </form>
      
      <div className="flex flex-wrap gap-3">
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-auto min-w-[140px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedDateFilter} onValueChange={setSelectedDateFilter}>
          <SelectTrigger className="w-auto min-w-[120px]">
            <Calendar className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {dateFilters.map((filter) => (
              <SelectItem key={filter.value} value={filter.value}>
                {filter.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button 
            variant="outline" 
            onClick={onClearFilters}
            className="h-10"
          >
            Clear Filters
          </Button>
        )}
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {selectedCategory !== "all" && (
            <Badge variant="secondary" className="px-3 py-1">
              {categories.find(c => c.value === selectedCategory)?.label}
            </Badge>
          )}
          {selectedDateFilter !== "all" && (
            <Badge variant="secondary" className="px-3 py-1">
              {dateFilters.find(d => d.value === selectedDateFilter)?.label}
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}