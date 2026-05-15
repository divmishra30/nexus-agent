'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
    <main className="flex min-h-screen flex-col items-center py-16 px-4 sm:px-8 bg-gradient-to-br from-white via-slate-50 to-slate-100">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-2xl"
      >
        <h1 className="text-4xl md:text-5xl font-black mb-3 text-slate-900 text-center tracking-tight">
          Smart{' '}
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Search
          </span>
        </h1>
        <p className="text-slate-500 text-center mb-10 font-medium">
          Powered by Google Custom Search API
        </p>

        <form onSubmit={handleSearch} className="w-full mb-8">
          <div className="flex gap-3 bg-white border-2 border-slate-200 rounded-2xl p-2 shadow-lg focus-within:border-blue-400 focus-within:shadow-blue-100 transition-all duration-300">
            <div className="flex items-center pl-3 text-slate-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search anything..."
              className="flex-grow py-3 px-2 text-base bg-transparent text-slate-900 placeholder-slate-400 focus:outline-none font-medium"
              aria-label="Search query input"
            />
            <button
              type="submit"
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl text-sm font-bold hover:opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 shadow-md"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Searching
                </span>
              ) : 'Search'}
            </button>
          </div>
        </form>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-red-50 border-2 border-red-200 text-red-700 px-5 py-4 rounded-2xl mb-6 text-sm font-medium"
              role="alert"
            >
              <strong className="font-bold">Error: </strong>{error}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {results && results.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <h2 className="text-lg font-bold text-slate-700 mb-4">
                {results.length} result{results.length !== 1 ? 's' : ''} found
              </h2>
              {results.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white p-6 rounded-2xl shadow-sm border-2 border-slate-100 hover:border-slate-200 hover:shadow-md transition-all duration-200"
                >
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-lg text-blue-700 hover:text-blue-900 hover:underline font-bold block mb-1 transition-colors"
                  >
                    {item.title}
                  </a>
                  <p className="text-emerald-700 text-xs font-medium mb-2 truncate">{item.link}</p>
                  <p className="text-slate-600 text-sm leading-relaxed">{item.snippet}</p>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {results && results.length === 0 && !loading && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 text-slate-400"
          >
            <svg className="w-16 h-16 mx-auto mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-lg font-medium">No results found for &ldquo;{query}&rdquo;</p>
            <p className="text-sm mt-1">Try different keywords or check your spelling</p>
          </motion.div>
        )}
      </motion.div>
    </main>
  );
}
