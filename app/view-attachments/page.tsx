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
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <p>Loading attachments...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <p className="text-red-500">{error}</p>
        <Link href="/" className="text-blue-500 hover:underline mt-4">
          Back to Home
        </Link>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <h1 className="text-4xl font-bold mb-8">All Attachments</h1>
      {attachments.length === 0 ? (
        <p>No attachments uploaded yet.</p>
      ) : (
        <ul className="list-disc pl-5">
          {attachments.map((attachment) => (
            <li key={attachment.name} className="mb-2">
              <a 
                href={attachment.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-500 hover:underline"
              >
                {attachment.name}
              </a>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-8 flex gap-4">
        <Link href="/upload" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Upload New File
        </Link>
        <Link href="/" className="bg-slate-500 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded">
          Back to Home
        </Link>
      </div>
    </main>
  );
}