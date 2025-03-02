"use client";

import { Cryptocurrency } from "@/lib/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import { Clock, Info, AlertTriangle } from "lucide-react";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CryptoTableProps {
  cryptocurrencies: Cryptocurrency[];
  isLoading: boolean;
  lastUpdated?: Date | null;
  loadingProgress?: number;
  isUsingMockData?: boolean;
}

export function CryptoTable({ 
  cryptocurrencies, 
  isLoading, 
  lastUpdated, 
  loadingProgress = 0,
  isUsingMockData = false
}: CryptoTableProps) {
  // Show loading progress bar
  if (isLoading && cryptocurrencies.length === 0) {
    return (
      <div className="w-full flex flex-col justify-center items-center py-16">
        <div className="w-full max-w-md mb-4">
          <Progress value={loadingProgress} className="h-2" />
        </div>
        <p className="text-muted-foreground">Loading cryptocurrency data... {loadingProgress}%</p>
      </div>
    );
  }

  // Show message when no results found
  if (cryptocurrencies.length === 0) {
    return (
      <div className="w-full text-center py-10">
        <p className="text-muted-foreground">No cryptocurrencies found</p>
      </div>
    );
  }

  // Format the last updated time
  const formattedTime = lastUpdated 
    ? new Intl.DateTimeFormat('en-US', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        hour12: true 
      }).format(lastUpdated)
    : null;

  return (
    <>
      {/* Mock data warning */}
      {isUsingMockData && (
        <Alert className="mb-4 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
          <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-500" />
          <AlertDescription className="text-yellow-800 dark:text-yellow-400">
            Using sample data. Live API data is currently unavailable.
          </AlertDescription>
        </Alert>
      )}
      
      {/* Status information */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
        <div className="text-sm text-muted-foreground flex items-center gap-2">
          <span>Showing cryptocurrency data</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button>
                  <Info className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">
                  Data is fetched from multiple cryptocurrency APIs with automatic failover.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        {/* Last updated timestamp */}
        {lastUpdated && (
          <div className="text-sm text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>Last updated: {formattedTime}</span>
          </div>
        )}
      </div>
      
      {/* Loading overlay when refreshing with existing data */}
      <div className="relative">
        {isLoading && cryptocurrencies.length > 0 && (
          <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center z-10 rounded-md backdrop-blur-sm">
            <div className="w-full max-w-md mb-4 px-8">
              <Progress value={loadingProgress} className="h-2" />
            </div>
            <p className="text-sm text-muted-foreground">Refreshing data... {loadingProgress}%</p>
          </div>
        )}
        
        {/* Cryptocurrency table */}
        <div className="rounded-md border overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">#</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">24h Change</TableHead>
                  <TableHead className="text-right">Market Cap</TableHead>
                  <TableHead className="text-right">Volume (24h)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cryptocurrencies.map((crypto) => (
                  <TableRow key={crypto.id}>
                    <TableCell className="font-medium">{crypto.market_cap_rank}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {/* Coin icon with fallback */}
                        <img 
                          src={crypto.image} 
                          alt={crypto.name} 
                          className="w-6 h-6"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://via.placeholder.com/24/2563eb/ffffff?text=${crypto.symbol.substring(0, 2).toUpperCase()}`;
                          }} 
                        />
                        <span className="font-medium">{crypto.name}</span>
                        <span className="text-muted-foreground uppercase">{crypto.symbol}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(crypto.current_price)}</TableCell>
                    <TableCell className={`text-right ${crypto.price_change_percentage_24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {crypto.price_change_percentage_24h >= 0 ? '+' : ''}
                      {crypto.price_change_percentage_24h.toFixed(2)}%
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(crypto.market_cap)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(crypto.total_volume)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </>
  );
}