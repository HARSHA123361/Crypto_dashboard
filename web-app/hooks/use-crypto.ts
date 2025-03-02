"use client";

import { useState, useEffect } from 'react';
import { fetchCryptocurrencies, Cryptocurrency } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';

export function useCrypto() {
  const [cryptocurrencies, setCryptocurrencies] = useState<Cryptocurrency[]>([]);
  const [filteredCryptocurrencies, setFilteredCryptocurrencies] = useState<Cryptocurrency[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const data = await fetchCryptocurrencies();
      setCryptocurrencies(data);
      filterCryptocurrencies(data, searchQuery);
      toast({
        title: "Data refreshed",
        description: "Cryptocurrency prices have been updated",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch cryptocurrency data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterCryptocurrencies = (data: Cryptocurrency[], query: string) => {
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
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    filterCryptocurrencies(cryptocurrencies, query);
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    cryptocurrencies: filteredCryptocurrencies,
    isLoading,
    searchQuery,
    handleSearch,
    refreshData: fetchData,
  };
}