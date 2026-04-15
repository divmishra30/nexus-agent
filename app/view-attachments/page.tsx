'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Attachment {
  name: string;
  url: string; // Relative URL from public folder
}

export default function ViewAttachmentsPage() {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAttachments() {
      try {
        const response = await fetch('/api/attachments');
        if (response.ok) {
          const data = await response.json();
          setAttachments(data.files.map((fileName: string) => ({
            name: fileName,
            url: `/uploads/${fileName}` // Assuming files are served from /public/uploads
          })));
        } else {
          const errorData = await response.json();
          setError(`Failed to fetch attachments: ${errorData.error || response.statusText}`);
        }
      } catch (err) {
        setError(`An error occurred: ${(err as Error).message}`);
      } finally {
        setLoading(false);
      }
    }
    fetchAttachments();
  }, []);

  const btnPrimaryClasses = "bg-[var(--color-primary-600)] text-white font-[var(--font-weight-semibold)] py-3.5 px-7 rounded-[var(--radius-lg)] shadow-md transition-all duration-300 ease-in-out hover:bg-[var(--color-primary-700)] hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-[var(--color-primary-300)] active:scale-95 text-center";
  const btnSecondaryClasses = "bg-[var(--color-text-muted)] hover:bg-[var(--color-text-default)] text-white font-[var(--font-weight-semibold)] py-3.5 px-7 rounded-[var(--radius-lg)] shadow-md transition-colors duration-200 text-center";

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-8 bg-[var(--color-background-default)]">
        <p className="text-lg text-[var(--color-text-default)]">Loading attachments...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-8 bg-[var(--color-background-default)]">
        <p className="text-[var(--color-error-600)] text-lg mb-4">{error}</p>
        <Link href="/" className="text-[var(--color-primary-600)] hover:underline text-lg transition-colors duration-200">
          Back to Home
        </Link>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center py-12 px-4 sm:px-8 bg-[var(--color-background-default)]">
      <div className="w-full max-w-4xl bg-[var(--color-background-card)] p-8 sm:p-10 rounded-[var(--radius-2xl)] shadow-2xl border-2 border-slate-200">
        <h1 className="text-[var(--font-size-4xl)] font-[var(--font-weight-extrabold)] mb-10 text-[var(--color-text-default)] text-center tracking-tight">View Attachments</h1>

        {attachments.length === 0 ? (
          <div className="text-center text-[var(--color-text-muted)] p-8 bg-slate-50 rounded-[var(--radius-lg)] border-2 border-slate-100">
            <p className="mb-2">No attachments uploaded yet.</p>
            <p>Use the "Upload New File" button below to add some.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 justify-items-center">
            {attachments.map((attachment) => (
              <div
                key={attachment.name}
                className="bg-slate-50 p-5 rounded-[var(--radius-lg)] flex flex-col items-center gap-4 hover:bg-slate-100 transition-colors duration-200 shadow-sm border-2 border-slate-100"
              >
                {/* Simple file icon using text for now */}
                <span className="text-[var(--font-size-3xl)] text-[var(--color-text-muted)]">📁</span>
                <a
                  href={attachment.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-[var(--color-primary-600)] hover:text-[var(--color-primary-800)] break-all text-base text-center transition-colors duration-200"
                >
                  {attachment.name}
                </a>
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 pt-8 border-t border-[var(--color-border-default)] flex flex-col sm:flex-row justify-center gap-4">
          <Link href="/upload" className={btnPrimaryClasses}>
            Upload New File
          </Link>
          <Link href="/" className={btnSecondaryClasses}>
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
