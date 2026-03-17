'use client';

import { useState } from 'react';

interface SearchResultItem {
  title: string;
  link: string;
  snippet: string;
}

export default function GoogleSearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResultItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setResults(null);
    setError(null);

    try {
      const response = await fetch(`/api/google-search?q=${encodeURIComponent(query)}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setResults(data.items || []);
    } catch (err) {
      setError(`Failed to fetch search results: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-8 md:p-12 lg:p-24 bg-gray-50">
      <h1 className="text-4xl font-bold mb-8 text-gray-900">Google Search</h1>

      <form onSubmit={handleSearch} className="w-full max-w-lg mb-8 flex shadow-md rounded-lg overflow-hidden">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search Google..."
          className="flex-grow p-4 text-lg border-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Search query input"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-4 text-lg font-semibold hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative max-w-lg w-full mb-8" role="alert">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      {results && results.length > 0 && (
        <div className="w-full max-w-lg space-y-6">
          <h2 className="text-2xl font-bold text-gray-800">Search Results</h2>
          {results.map((item, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
              <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-xl text-blue-700 hover:underline font-semibold">
                {item.title}
              </a>
              <p className="text-green-700 text-sm mb-2">{item.link}</p>
              <p className="text-gray-700 text-base">{item.snippet}</p>
            </div>
          ))}
        </div>
      )}

      {results && results.length === 0 && !loading && !error && (
        <p className="text-gray-600 text-lg">No results found for "{query}".</p>
      )}
    </main>
  );
}
