export default function DocsPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Crypto Price Tracker Documentation</h1>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Overview</h2>
        <p className="mb-4">
          The Crypto Price Tracker is a web application built with Next.js that displays real-time cryptocurrency prices.
          It fetches data from multiple cryptocurrency APIs and provides a user-friendly interface for tracking cryptocurrency market information.
        </p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Architecture</h2>
        <p className="mb-4">
          The application follows a component-based architecture using React and Next.js. Here's a breakdown of the main components:
        </p>
        <ul className="list-disc pl-6 space-y-2 mb-4">
          <li><strong>API Layer</strong>: Handles data fetching from multiple cryptocurrency APIs with fallback mechanisms</li>
          <li><strong>State Management</strong>: Uses React hooks for local state management</li>
          <li><strong>UI Components</strong>: Built with shadcn/ui for a consistent and accessible interface</li>
          <li><strong>Theme Support</strong>: Implements dark/light mode with next-themes</li>
        </ul>
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Key Features</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Live Cryptocurrency Data</strong>: Displays current prices, market cap, and 24h changes</li>
          <li><strong>Search Functionality</strong>: Filter cryptocurrencies by name or symbol</li>
          <li><strong>Manual Refresh</strong>: Update data on demand with the refresh button</li>
          <li><strong>Responsive Design</strong>: Works on desktop and mobile devices</li>
          <li><strong>Dark/Light Mode</strong>: Supports user preference for theme</li>
          <li><strong>Loading States</strong>: Visual feedback during data fetching</li>
          <li><strong>Fallback Mechanisms</strong>: Multiple API sources and offline support</li>
        </ul>
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Implementation Details</h2>
        
        <div className="mb-6">
          <h3 className="text-xl font-medium mb-2">Data Fetching</h3>
          <p>
            The application uses multiple cryptocurrency APIs to fetch data with a fallback mechanism. The API calls are encapsulated in dedicated functions in the api.ts file.
            We use several API endpoints to get a list of cryptocurrencies sorted by market cap.
          </p>
        </div>
        
        <div className="mb-6">
          <h3 className="text-xl font-medium mb-2">State Management</h3>
          <p>
            State management is handled using React hooks (useState, useEffect, useCallback, useRef) in a custom hook called useCryptoContext.
            This hook provides the following functionality:
          </p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li>Fetching and storing cryptocurrency data</li>
            <li>Filtering based on search query</li>
            <li>Loading state management</li>
            <li>Data refresh functionality</li>
            <li>Error handling and fallback mechanisms</li>
          </ul>
        </div>
        
        <div className="mb-6">
          <h3 className="text-xl font-medium mb-2">Component Structure</h3>
          <p>
            The application is structured into reusable components:
          </p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li><strong>CryptoProvider</strong>: Provides cryptocurrency data to child components</li>
            <li><strong>CryptoTable</strong>: Displays cryptocurrency data in a tabular format</li>
            <li><strong>SearchBar</strong>: Allows filtering cryptocurrencies and refreshing data</li>
            <li><strong>ModeToggle</strong>: Enables switching between light and dark themes</li>
          </ul>
        </div>
        
        <div className="mb-6">
          <h3 className="text-xl font-medium mb-2">Resilience Features</h3>
          <p>
            The application includes several features to ensure stability and reliability:
          </p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li><strong>Multiple API Sources</strong>: Uses CoinCap, Binance, CoinGecko, and CryptoCompare APIs with automatic failover</li>
            <li><strong>Caching</strong>: Local caching to reduce API calls and provide offline support</li>
            <li><strong>Retry Mechanism</strong>: Automatic retries with exponential backoff for failed API calls</li>
            <li><strong>CORS Proxies</strong>: Multiple proxy options to handle CORS restrictions</li>
            <li><strong>Request Timeouts</strong>: Prevents hanging requests with automatic timeouts</li>
            <li><strong>Mock Data</strong>: Sample data as a last resort when all API sources fail</li>
            <li><strong>Error Handling</strong>: Comprehensive error catching and user feedback</li>
            <li><strong>Dynamic Refresh Intervals</strong>: Adjusts refresh timing based on API availability</li>
            <li><strong>Component Lifecycle Management</strong>: Proper cleanup to prevent memory leaks</li>
          </ul>
        </div>
      </section>
      
      <section>
        <h2 className="text-2xl font-semibold mb-4">Future Improvements</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Add pagination for displaying more cryptocurrencies</li>
          <li>Implement price charts for historical data</li>
          <li>Add sorting functionality to the table columns</li>
          <li>Create a watchlist feature for tracking favorite cryptocurrencies</li>
          <li>Implement server-side rendering for better SEO</li>
          <li>Add more detailed views for individual cryptocurrencies</li>
          <li>Implement local storage for persistent user preferences</li>
        </ul>
      </section>
    </div>
  );
}