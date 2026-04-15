'use client';

import { useState } from 'react';

export default function UrlDetailsPage() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<{ title: string; imageUrl: string | null } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Reusing design tokens from app/page.tsx for consistency
  const btnPrimaryClasses = "bg-[var(--color-primary-600)] text-white font-[var(--font-weight-semibold)] py-3 px-6 rounded-[var(--radius-lg)] shadow-md transition-all duration-300 ease-in-out hover:bg-[var(--color-primary-700)] hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-[var(--color-primary-300)] active:scale-95 text-center";
  const glassCardClasses = "bg-white border-2 border-slate-200 rounded-[var(--radius-2xl)] shadow-lg transition-all duration-300 ease-in-out hover:shadow-xl hover:bg-slate-50";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setData(null);
    setLoading(true);

    if (!url.trim()) {
      setError('Please enter a URL.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/url-details', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(`Failed to fetch URL details: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-8 bg-[var(--color-background-default)] text-[var(--color-text-default)]">
      <div className={`${glassCardClasses} w-full max-w-2xl p-8 sm:p-10 text-center`}>
        <h1 className="text-[var(--font-size-4xl)] font-[var(--font-weight-extrabold)] mb-8 text-[var(--color-text-default)] tracking-tight">
          Fetch URL Details
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6 mb-8">
          <div>
            <label htmlFor="url-input" className="block text-lg font-medium text-[var(--color-text-default)] mb-3">
              Enter URL here:
            </label>
            <input
              id="url-input"
              type="url"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.example.com"
              className="block w-full px-5 py-3 border border-[var(--color-border-default)] rounded-[var(--radius-lg)] shadow-sm focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)] bg-[var(--color-background-light)] text-[var(--color-text-default)] text-base transition-all duration-200"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full ${btnPrimaryClasses} text-[var(--font-size-lg)] disabled:opacity-50 disabled:cursor-not-allowed border-2 border-[var(--color-primary-700)]`}
          >
            {loading ? 'Fetching Details...' : 'Fetch Details'}
          </button>
        </form>

        {error && (
          <div className="bg-[var(--color-error-50)] border border-[var(--color-error-200)] text-[var(--color-error-700)] px-6 py-4 rounded-[var(--radius-lg)] relative text-lg font-medium" role="alert">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}

        {data && (
          <div className="mt-10 pt-8 border-t border-[var(--color-border-default)] text-left">
            <h2 className="text-[var(--font-size-2xl)] font-[var(--font-weight-bold)] mb-4 text-[var(--color-text-default)]">
              Page Details:
            </h2>
            <p className="text-lg mb-3">
              <strong className="text-[var(--color-primary-600)]">Title:</strong> {data.title || 'N/A'}
            </p>
            {data.imageUrl ? (
              <div className="mt-6">
                <strong className="text-[var(--color-primary-600)]">Image:</strong>
                <img src={data.imageUrl} alt="Page preview" className="mt-4 max-w-full h-auto rounded-[var(--radius-xl)] shadow-md border border-[var(--color-border-default)] mx-auto" />
              </div>
            ) : (
              <p className="text-lg text-[var(--color-text-muted)] mt-6">No representative image found.</p>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
