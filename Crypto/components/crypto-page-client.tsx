"use client";

import { CryptoTable } from "@/components/crypto-table";
import { SearchBar } from "@/components/search-bar";
import { useCryptoContext } from "@/components/crypto-provider";

export function CryptoPageClient() {
  const { 
    cryptocurrencies, 
    isLoading, 
    searchQuery, 
    handleSearch, 
    refreshData,
    lastUpdated,
    loadingProgress,
    isUsingMockData
  } = useCryptoContext();
  
  return (
    <>
      <SearchBar 
        searchQuery={searchQuery} 
        onSearch={handleSearch} 
        onRefresh={refreshData}
        isLoading={isLoading}
        loadingProgress={loadingProgress}
      />
      <CryptoTable 
        cryptocurrencies={cryptocurrencies} 
        isLoading={isLoading}
        lastUpdated={lastUpdated}
        loadingProgress={loadingProgress}
        isUsingMockData={isUsingMockData}
      />
    </>
  );
}