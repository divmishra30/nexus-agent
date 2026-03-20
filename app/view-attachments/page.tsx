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

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-8 bg-background-default">
        <p className="text-lg text-text-default">Loading attachments...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-8 bg-background-default">
        <p className="text-error-600 text-lg mb-4">{error}</p>
        <Link href="/" className="text-primary-600 hover:underline text-lg transition-colors duration-200">
          Back to Home
        </Link>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center py-12 px-4 sm:px-8 bg-background-default">
      <div className="w-full max-w-4xl bg-background-card p-8 sm:p-10 rounded-xl shadow-2xl border border-border-default">
        <h1 className="text-4xl font-extrabold mb-10 text-text-default text-center tracking-tight">View Attachments</h1>

        {attachments.length === 0 ? (
          <div className="text-center text-lg text-text-muted p-8 bg-background-light rounded-lg border border-border-default">
            <p className="mb-2">No attachments uploaded yet.</p>
            <p>Use the "Upload New File" button below to add some.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 justify-items-center">
            {attachments.map((attachment) => (
              <div
                key={attachment.name}
                className="bg-background-light p-5 rounded-lg flex flex-col items-center gap-4 hover:bg-background-default transition-colors duration-200 shadow-sm border border-border-default"
              >
                {/* Simple file icon using text for now */}
                <span className="text-3xl text-text-muted">📁</span>
                <a
                  href={attachment.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-primary-600 hover:text-primary-800 break-all text-base text-center transition-colors duration-200"
                >
                  {attachment.name}
                </a>
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 pt-8 border-t border-border-default flex flex-col sm:flex-row justify-center gap-4">
          <Link href="/upload" className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-3.5 px-7 rounded-lg shadow-md transition-colors duration-200 text-center">
            Upload New File
          </Link>
          <Link href="/" className="bg-text-muted hover:bg-text-default text-white font-bold py-3.5 px-7 rounded-lg shadow-md transition-colors duration-200 text-center">
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}