"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, RefreshCw } from "lucide-react";
import { useState } from "react";
import { Progress } from "@/components/ui/progress";

interface SearchBarProps {
  searchQuery: string;
  onSearch: (query: string) => void;
  onRefresh: () => void;
  isLoading: boolean;
  loadingProgress: number;
}

export function SearchBar({ 
  searchQuery, 
  onSearch, 
  onRefresh, 
  isLoading,
  loadingProgress
}: SearchBarProps) {
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(null);

  // Debounce search to prevent excessive filtering
  const handleSearchInput = (value: string) => {
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }
    
    setDebounceTimeout(
      setTimeout(() => {
        onSearch(value);
      }, 300)
    );
  };

  return (
    <div className="flex flex-col gap-2 mb-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search cryptocurrencies..."
            className="pl-8"
            defaultValue={searchQuery}
            onChange={(e) => handleSearchInput(e.target.value)}
          />
        </div>
        <Button 
          onClick={onRefresh} 
          disabled={isLoading}
          variant="outline"
          className="whitespace-nowrap relative"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? `Refreshing (${loadingProgress}%)` : 'Refresh Data'}
        </Button>
      </div>
      
      {/* Show progress bar when loading */}
      {isLoading && (
        <div className="w-full mt-2">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-muted-foreground">Refreshing data</span>
            <span className="text-xs font-medium">{loadingProgress}%</span>
          </div>
          <Progress value={loadingProgress} className="h-2" />
        </div>
      )}
    </div>
  );
}