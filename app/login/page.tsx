'use client';

import { useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Reusing design tokens from app/page.tsx for consistency
  const btnPrimaryClasses = "bg-[var(--color-primary-600)] text-white font-[var(--font-weight-semibold)] py-3 px-6 rounded-[var(--radius-lg)] shadow-md transition-all duration-300 ease-in-out hover:bg-[var(--color-primary-700)] hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-[var(--color-primary-300)] active:scale-95 text-center";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!email || !password) {
      setError('Please enter both email and password.');
      setLoading(false);
      return;
    }

    // Simulate an API call
    try {
      // In a real application, you would send these credentials to a backend API
      console.log('Attempting to log in with:', { email, password });
      
      // Simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Simulate success or failure
      if (email === 'user@example.com' && password === 'password123') {
        alert('Login successful!');
        // Redirect to a dashboard or home page
        // router.push('/dashboard');
      } else {
        setError('Invalid email or password.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-8 bg-[var(--color-background-default)] text-[var(--color-text-default)]">
      <div className={`w-full max-w-md bg-[var(--color-background-card)] p-10 rounded-[var(--radius-2xl)] shadow-2xl border-2 border-slate-200 transition-all duration-300 ease-in-out hover:shadow-xl`}>
        <h1 className="text-[var(--font-size-4xl)] font-[var(--font-weight-extrabold)] text-center text-[var(--color-text-default)] mb-10 tracking-tight">Login</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[var(--color-text-default)] mb-2">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full px-4 py-2.5 border border-[var(--color-border-default)] rounded-[var(--radius-lg)] shadow-sm focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)] bg-[var(--color-background-light)] text-[var(--color-text-default)] text-base transition-all duration-200"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[var(--color-text-default)] mb-2">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full px-4 py-2.5 border border-[var(--color-border-default)] rounded-[var(--radius-lg)] shadow-sm focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)] bg-[var(--color-background-light)] text-[var(--color-text-default)] text-base transition-all duration-200"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="bg-[var(--color-error-50)] border border-[var(--color-error-200)] text-[var(--color-error-700)] px-4 py-3 rounded-[var(--radius-lg)] relative text-sm" role="alert">
              <strong className="font-bold">Error:</strong>
              <span className="block sm:inline"> {error}</span>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center ${btnPrimaryClasses} text-[var(--font-size-lg)] disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
