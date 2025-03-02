export interface Cryptocurrency {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  price_change_percentage_24h: number;
  total_volume: number;
}

// Add caching to prevent excessive API calls
let cachedData: Cryptocurrency[] | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 60000; // 1 minute cache

// Track API health
let apiHealthStatus = {
  attempts: 0,
  lastSuccess: 0,
  failedApis: new Set<string>()
};

// API endpoints
const API_ENDPOINTS = {
  COINGECKO: 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=false&price_change_percentage=24h',
  COINPAPRIKA: 'https://api.coinpaprika.com/v1/tickers?limit=20',
  COINLORE: 'https://api.coinlore.net/api/tickers/?limit=20',
  COINRANKING: 'https://api.coinranking.com/v2/coins?limit=20'
};

// CORS proxies to try if direct API calls fail
const CORS_PROXIES = [
  '', // Direct call (no proxy)
  'https://api.allorigins.win/raw?url=',
  'https://corsproxy.io/?',
  'https://cors-anywhere.herokuapp.com/'
];

// Fallback mock data when all APIs fail
const STABLE_MOCK_DATA = [
  {
    id: "bitcoin",
    symbol: "btc",
    name: "Bitcoin",
    image: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
    basePrice: 65432.12,
    market_cap: 1278654321098,
    market_cap_rank: 1,
    baseChange: 2.35,
    total_volume: 32456789012
  },
  // ... other mock data entries (keeping them for fallback)
  {
    id: "ethereum",
    symbol: "eth",
    name: "Ethereum",
    image: "https://assets.coingecko.com/coins/images/279/large/ethereum.png",
    basePrice: 3456.78,
    market_cap: 415678901234,
    market_cap_rank: 2,
    baseChange: -1.23,
    total_volume: 18765432109
  },
  {
    id: "tether",
    symbol: "usdt",
    name: "Tether",
    image: "https://assets.coingecko.com/coins/images/325/large/Tether.png",
    basePrice: 1.0,
    market_cap: 98765432100,
    market_cap_rank: 3,
    baseChange: 0.01,
    total_volume: 65432109876
  },
  {
    id: "binancecoin",
    symbol: "bnb",
    name: "BNB",
    image: "https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png",
    basePrice: 567.89,
    market_cap: 87654321098,
    market_cap_rank: 4,
    baseChange: 1.45,
    total_volume: 2345678901
  },
  {
    id: "solana",
    symbol: "sol",
    name: "Solana",
    image: "https://assets.coingecko.com/coins/images/4128/large/solana.png",
    basePrice: 123.45,
    market_cap: 54321098765,
    market_cap_rank: 5,
    baseChange: 5.67,
    total_volume: 3456789012
  }
];

// Helper function to add timeout to fetch
const fetchWithTimeout = async (url: string, options = {}, timeout = 5000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
};

// Helper function to try different CORS proxies
const fetchWithProxies = async (apiUrl: string, timeout = 5000) => {
  // Try each proxy in sequence
  for (const proxy of CORS_PROXIES) {
    try {
      const url = proxy ? `${proxy}${encodeURIComponent(apiUrl)}` : apiUrl;
      console.log(`Trying with proxy: ${proxy ? proxy : 'direct'}`);
      const response = await fetchWithTimeout(url, {}, timeout);
      if (response.ok) {
        return response;
      }
    } catch (error) {
      console.log(`Proxy ${proxy ? proxy : 'direct'} failed, trying next...`);
    }
  }
  
  throw new Error('All proxies failed');
};

// Fetch from CoinGecko API
const fetchFromCoinGecko = async (): Promise<Cryptocurrency[]> => {
  try {
    console.log("Attempting to fetch from CoinGecko with proxies...");
    const response = await fetchWithProxies(API_ENDPOINTS.COINGECKO);
    
    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    return data.map((coin: any) => ({
      id: coin.id,
      symbol: coin.symbol,
      name: coin.name,
      image: coin.image,
      current_price: coin.current_price,
      market_cap: coin.market_cap,
      market_cap_rank: coin.market_cap_rank,
      price_change_percentage_24h: coin.price_change_percentage_24h,
      total_volume: coin.total_volume
    }));
  } catch (error) {
    console.error("Error fetching from CoinGecko:", error);
    apiHealthStatus.failedApis.add('coingecko');
    throw error;
  }
};

// Fetch from CoinPaprika API
const fetchFromCoinPaprika = async (): Promise<Cryptocurrency[]> => {
  try {
    console.log("Attempting to fetch from CoinPaprika with proxies...");
    const response = await fetchWithProxies(API_ENDPOINTS.COINPAPRIKA);
    
    if (!response.ok) {
      throw new Error(`CoinPaprika API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    return data.map((coin: any, index: number) => ({
      id: coin.id,
      symbol: coin.symbol.toLowerCase(),
      name: coin.name,
      image: `https://coinicons-api.vercel.app/api/icon/${coin.symbol.toLowerCase()}`,
      current_price: parseFloat(coin.price_usd),
      market_cap: parseFloat(coin.market_cap_usd),
      market_cap_rank: index + 1,
      price_change_percentage_24h: parseFloat(coin.percent_change_24h),
      total_volume: parseFloat(coin.volume_24h_usd)
    }));
  } catch (error) {
    console.error("Error fetching from CoinPaprika:", error);
    apiHealthStatus.failedApis.add('coinpaprika');
    throw error;
  }
};

// Fetch from CoinLore API
const fetchFromCoinLore = async (): Promise<Cryptocurrency[]> => {
  try {
    console.log("Attempting to fetch from CoinLore with proxies...");
    const response = await fetchWithProxies(API_ENDPOINTS.COINLORE);
    
    if (!response.ok) {
      throw new Error(`CoinLore API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    return data.data.map((coin: any) => ({
      id: coin.id,
      symbol: coin.symbol.toLowerCase(),
      name: coin.name,
      image: `https://coinicons-api.vercel.app/api/icon/${coin.symbol.toLowerCase()}`,
      current_price: parseFloat(coin.price_usd),
      market_cap: parseFloat(coin.market_cap_usd),
      market_cap_rank: parseInt(coin.rank),
      price_change_percentage_24h: parseFloat(coin.percent_change_24h),
      total_volume: parseFloat(coin.volume24)
    }));
  } catch (error) {
    console.error("Error fetching from CoinLore:", error);
    apiHealthStatus.failedApis.add('coinlore');
    throw error;
  }
};

// Fetch from Coinranking API
const fetchFromCoinranking = async (): Promise<Cryptocurrency[]> => {
  try {
    console.log("Attempting to fetch from Coinranking with proxies...");
    const response = await fetchWithProxies(API_ENDPOINTS.COINRANKING);
    
    if (!response.ok) {
      throw new Error(`Coinranking API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    return data.data.coins.map((coin: any) => ({
      id: coin.uuid,
      symbol: coin.symbol.toLowerCase(),
      name: coin.name,
      image: coin.iconUrl,
      current_price: parseFloat(coin.price),
      market_cap: parseFloat(coin.marketCap),
      market_cap_rank: parseInt(coin.rank),
      price_change_percentage_24h: parseFloat(coin.change),
      total_volume: parseFloat(coin["24hVolume"] || coin.volume || 0) // Fixed: Using bracket notation instead of dot notation
    }));
  } catch (error) {
    console.error("Error fetching from Coinranking:", error);
    apiHealthStatus.failedApis.add('coinranking');
    throw error;
  }
};

// Get mock data with realistic variations
function getMockData(): Cryptocurrency[] {
  const now = new Date();
  const seed = now.getHours() * 60 + now.getMinutes();
  const randomFactor = (seed % 60) / 60;
  
  return STABLE_MOCK_DATA.map(coin => {
    const variationPercent = coin.id === "tether" ? 0.001 : 0.01;
    const priceVariation = (randomFactor - 0.5) * 2 * variationPercent;
    const changeVariation = (randomFactor - 0.5) * 0.3;
    
    return {
      id: coin.id,
      symbol: coin.symbol,
      name: coin.name,
      image: coin.image,
      current_price: coin.basePrice * (1 + priceVariation),
      market_cap: coin.market_cap,
      market_cap_rank: coin.market_cap_rank,
      price_change_percentage_24h: coin.baseChange * (1 + changeVariation),
      total_volume: coin.total_volume
    };
  });
}

// Implement exponential backoff for retries
const withRetry = async <T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> => {
  let retries = 0;
  
  while (true) {
    try {
      return await fn();
    } catch (error) {
      retries++;
      if (retries >= maxRetries) {
        throw error;
      }
      
      // Exponential backoff with jitter
      const delay = Math.min(1000 * Math.pow(2, retries) + Math.random() * 1000, 10000);
      console.log(`Retry ${retries} after ${Math.round(delay)}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

// Main function to fetch cryptocurrency data
export async function fetchCryptocurrencies(forceRefresh = false): Promise<Cryptocurrency[]> {
  const now = Date.now();
  
  // Return cached data if it's still fresh and not forcing refresh
  if (!forceRefresh && cachedData && now - lastFetchTime < CACHE_DURATION) {
    console.log("Using cached data (age: " + Math.round((now - lastFetchTime)/1000) + "s)");
    return cachedData;
  }
  
  apiHealthStatus.attempts++;
  
  // Try each API in sequence until one succeeds
  try {
    // Try CoinGecko first (most reliable and comprehensive)
    if (!apiHealthStatus.failedApis.has('coingecko')) {
      console.log("Trying CoinGecko API...");
      try {
        const data = await withRetry(() => fetchFromCoinGecko(), 2);
        console.log("CoinGecko API successful");
        cachedData = data;
        lastFetchTime = now;
        apiHealthStatus.lastSuccess = now;
        apiHealthStatus.failedApis.clear(); // Reset failed APIs on success
        return data;
      } catch (error) {
        console.log("CoinGecko API failed after retries, trying alternatives...");
      }
    }
  } catch (error) {
    console.log("CoinGecko API failed, trying alternatives...");
  }
  
  try {
    // Try CoinPaprika as second option
    if (!apiHealthStatus.failedApis.has('coinpaprika')) {
      console.log("Trying CoinPaprika API...");
      try {
        const data = await withRetry(() => fetchFromCoinPaprika(), 2);
        console.log("CoinPaprika API successful");
        cachedData = data;
        lastFetchTime = now;
        apiHealthStatus.lastSuccess = now;
        return data;
      } catch (error) {
        console.log("CoinPaprika API failed after retries, trying next alternative...");
      }
    }
  } catch (error) {
    console.log("CoinPaprika API failed, trying next alternative...");
  }
  
  try {
    // Try CoinLore as third option
    if (!apiHealthStatus.failedApis.has('coinlore')) {
      console.log("Trying CoinLore API...");
      try {
        const data = await withRetry(() => fetchFromCoinLore(), 2);
        console.log("CoinLore API successful");
        cachedData = data;
        lastFetchTime = now;
        apiHealthStatus.lastSuccess = now;
        return data;
      } catch (error) {
        console.log("CoinLore API failed after retries, trying next alternative...");
      }
    }
  } catch (error) {
    console.log("CoinLore API failed, trying next alternative...");
  }
  
  try {
    // Try Coinranking as fourth option
    if (!apiHealthStatus.failedApis.has('coinranking')) {
      console.log("Trying Coinranking API...");
      try {
        const data = await withRetry(() => fetchFromCoinranking(), 2);
        console.log("Coinranking API successful");
        cachedData = data;
        lastFetchTime = now;
        apiHealthStatus.lastSuccess = now;
        return data;
      } catch (error) {
        console.log("Coinranking API failed after retries, falling back to mock data...");
      }
    }
  } catch (error) {
    console.log("Coinranking API failed, falling back to mock data...");
  }
  
  // If all APIs fail, use mock data as a last resort
  console.log("All APIs failed, using mock data");
  const mockData = getMockData();
  cachedData = mockData;
  lastFetchTime = now;
  
  // Reset failed APIs every 5 minutes to try again
  if (now - apiHealthStatus.lastSuccess > 300000) {
    console.log("Resetting failed APIs list to retry all endpoints");
    apiHealthStatus.failedApis.clear();
  }
  
  return mockData;
}