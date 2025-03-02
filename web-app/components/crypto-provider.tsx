"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { fetchCryptocurrencies, Cryptocurrency } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';

export function useCryptoContext() {
  const [cryptocurrencies, setCryptocurrencies] = useState<Cryptocurrency[]>([]);
  const [filteredCryptocurrencies, setFilteredCryptocurrencies] = useState<Cryptocurrency[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  const [isUsingMockData, setIsUsingMockData] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [errorCount, setErrorCount] = useState(0);
  const [consecutiveErrors, setConsecutiveErrors] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);
  
  // Use refs to track fetch status and prevent duplicate toasts
  const isFetchingRef = useRef(false);
  const initialLoadDoneRef = useRef(false);
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Filter cryptocurrencies based on search query
  const filterCryptocurrencies = useCallback((data: Cryptocurrency[], query: string) => {
    if (!query) {
      setFilteredCryptocurrencies(data);
      return;
    }
    
    const filtered = data.filter(
      (crypto) =>
        crypto.name.toLowerCase().includes(query.toLowerCase()) ||
        crypto.symbol.toLowerCase().includes(query.toLowerCase())
    );
    
    setFilteredCryptocurrencies(filtered);
  }, []);

  // Start progress animation
  const startProgressAnimation = useCallback(() => {
    // Clear any existing interval
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    
    // Reset progress
    setLoadingProgress(0);
    
    // Set up progress interval
    progressIntervalRef.current = setInterval(() => {
      setLoadingProgress((prevProgress) => {
        // Increase progress gradually, but never reach 100% until loading is complete
        if (prevProgress >= 90) {
          return prevProgress;
        }
        return prevProgress + Math.floor(Math.random() * 10) + 5; // Random increment between 5-15%
      });
    }, 400);
    
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    };
  }, []);

  // Complete progress animation
  const completeProgressAnimation = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    
    // Set to 100% to complete the animation
    setLoadingProgress(100);
    
    // Reset after animation completes
    setTimeout(() => {
      setLoadingProgress(0);
    }, 500);
  }, []);

  // Mock data function for fallback
  const getMockData = useCallback(() => {
    const mockData = [
      {
        id: "bitcoin",
        symbol: "btc",
        name: "Bitcoin",
        image: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
        current_price: 65432.12,
        market_cap: 1278654321098,
        market_cap_rank: 1,
        price_change_percentage_24h: 2.35,
        total_volume: 32456789012
      },
      {
        id: "ethereum",
        symbol: "eth",
        name: "Ethereum",
        image: "https://assets.coingecko.com/coins/images/279/large/ethereum.png",
        current_price: 3456.78,
        market_cap: 415678901234,
        market_cap_rank: 2,
        price_change_percentage_24h: -1.23,
        total_volume: 18765432109
      },
      {
        id: "tether",
        symbol: "usdt",
        name: "Tether",
        image: "https://assets.coingecko.com/coins/images/325/large/Tether.png",
        current_price: 1.0,
        market_cap: 98765432100,
        market_cap_rank: 3,
        price_change_percentage_24h: 0.01,
        total_volume: 65432109876
      },
      {
        id: "binancecoin",
        symbol: "bnb",
        name: "BNB",
        image: "https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png",
        current_price: 567.89,
        market_cap: 87654321098,
        market_cap_rank: 4,
        price_change_percentage_24h: 1.45,
        total_volume: 2345678901
      },
      {
        id: "solana",
        symbol: "sol",
        name: "Solana",
        image: "https://assets.coingecko.com/coins/images/4128/large/solana.png",
        current_price: 123.45,
        market_cap: 54321098765,
        market_cap_rank: 5,
        price_change_percentage_24h: 5.67,
        total_volume: 3456789012
      }
    ];
    
    return mockData;
  }, []);

  // Fetch data from API with debounce to prevent excessive calls
  const fetchData = useCallback(async (showToast = true, forceRefresh = false) => {
    // Prevent concurrent fetches
    if (isFetchingRef.current) {
      console.log("Fetch already in progress, skipping");
      return;
    }
    
    isFetchingRef.current = true;
    setIsLoading(true);
    
    // Start progress animation
    startProgressAnimation();
    
    // Add a timeout to ensure loading state doesn't get stuck
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }
    
    fetchTimeoutRef.current = setTimeout(() => {
      if (isFetchingRef.current && mountedRef.current) {
        console.log("Fetch operation timed out, resetting loading state");
        setIsLoading(false);
        isFetchingRef.current = false;
        completeProgressAnimation();
        
        toast({
          title: "Loading timeout",
          description: "Data fetch took too long. Please try again.",
          variant: "destructive",
        });
      }
    }, 20000); // 20 second timeout (increased from 15s)
    
    try {
      console.log("Fetching cryptocurrency data...");
      const data = await fetchCryptocurrencies(forceRefresh);
      
      // Check if component is still mounted
      if (!mountedRef.current) {
        console.log("Component unmounted during fetch, aborting update");
        return;
      }
      
      // Check if we're using mock data (all APIs failed)
      setIsUsingMockData(data.length <= 5); // Mock data has 5 entries
      
      setCryptocurrencies(data);
      filterCryptocurrencies(data, searchQuery);
      setLastUpdated(new Date());
      
      // Only show toast after initial load and when explicitly requested
      if (initialLoadDoneRef.current && showToast) {
        toast({
          title: isUsingMockData ? "Using sample data" : "Data refreshed",
          description: isUsingMockData 
            ? "External APIs are unavailable. Showing sample data." 
            : "Cryptocurrency prices have been updated",
          variant: isUsingMockData ? "default" : "default",
        });
      }
      
      initialLoadDoneRef.current = true;
      setConsecutiveErrors(0);
    } catch (error) {
      // Check if component is still mounted
      if (!mountedRef.current) {
        console.log("Component unmounted during fetch error handling, aborting");
        return;
      }
      
      console.error("Error in crypto context:", error);
      setConsecutiveErrors(prev => prev + 1);
      setErrorCount(prev => prev + 1);
      
      // Try to use cached data if available
      if (cryptocurrencies.length > 0) {
        console.log("Using existing data due to fetch error");
        if (initialLoadDoneRef.current && showToast) {
          toast({
            title: "Update error",
            description: "There was an error refreshing the data. Using existing data.",
            variant: "destructive",
          });
        }
      } else {
        // No cached data, show error and use mock data
        console.log("No existing data, using mock data");
        const mockData = getMockData();
        setCryptocurrencies(mockData);
        filterCryptocurrencies(mockData, searchQuery);
        setIsUsingMockData(true);
        
        if (initialLoadDoneRef.current && showToast) {
          toast({
            title: "Data unavailable",
            description: "Unable to fetch live data. Showing sample data instead.",
            variant: "destructive",
          });
        }
      }
    } finally {
      // Check if component is still mounted
      if (mountedRef.current) {
        if (fetchTimeoutRef.current) {
          clearTimeout(fetchTimeoutRef.current);
          fetchTimeoutRef.current = null;
        }
        
        // Complete progress animation
        completeProgressAnimation();
        
        setIsLoading(false);
        isFetchingRef.current = false;
      }
    }
  }, [filterCryptocurrencies, searchQuery, toast, startProgressAnimation, completeProgressAnimation, cryptocurrencies.length, getMockData]);

  // Handle search input changes
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    filterCryptocurrencies(cryptocurrencies, query);
  }, [cryptocurrencies, filterCryptocurrencies]);

  // Manual refresh with user feedback
  const refreshData = useCallback(() => {
    console.log("Manual refresh triggered");
    fetchData(true, true); // Show toast and force refresh
  }, [fetchData]);

  // Set up auto-refresh interval
  const setupRefreshInterval = useCallback(() => {
    // Clear any existing interval
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }
    
    // Set up a new interval - use longer interval if we're using mock data
    const intervalTime = isUsingMockData ? 120000 : 60000; // 2 minutes for mock, 1 minute for real data
    console.log(`Setting refresh interval to ${Math.round(intervalTime/1000)}s`);
    
    refreshIntervalRef.current = setInterval(() => {
      console.log("Auto refresh triggered");
      fetchData(false);
    }, intervalTime);
    
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [fetchData, isUsingMockData]);

  // Update refresh interval when mock data status changes
  useEffect(() => {
    setupRefreshInterval();
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [isUsingMockData, setupRefreshInterval]);

  // Initial data fetch and auto-refresh setup
  useEffect(() => {
    // Set mounted ref
    mountedRef.current = true;
    
    // Initial fetch
    fetchData(false);
    
    // Clean up on component unmount
    return () => {
      console.log("Component unmounting, cleaning up resources");
      mountedRef.current = false;
      
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
      
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
      
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [fetchData]);

  return {
    cryptocurrencies: filteredCryptocurrencies,
    isLoading,
    searchQuery,
    handleSearch,
    refreshData,
    hasError: consecutiveErrors > 3,
    lastUpdated,
    loadingProgress,
    isUsingMockData
  };
}