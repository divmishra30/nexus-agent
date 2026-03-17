'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function UploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [message, setMessage] = useState('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    } else {
      setSelectedFile(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setMessage('Please select a file first.');
      return;
    }

    setMessage('Uploading...');
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setMessage('File uploaded successfully!');
        setSelectedFile(null); // Clear selected file after upload
      } else {
        const errorData = await response.json();
        setMessage(`Upload failed: ${errorData.error || response.statusText}`);
      }
    } catch (error) {
      setMessage(`An error occurred: ${(error as Error).message}`);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">Upload Files</h1>
      <div className="flex flex-col gap-4">
        <input type="file" onChange={handleFileChange} className="p-2 border rounded" />
        <button
          onClick={handleUpload}
          disabled={!selectedFile}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          Upload
        </button>
        {message && <p className="mt-4 text-center">{message}</p>}
        <Link href="/view-attachments" className="text-blue-500 hover:underline mt-4 text-center">
          View All Attachments
        </Link>
        <Link href="/" className="text-blue-500 hover:underline mt-2 text-center">
          Back to Home
        </Link>
      </div>
    </main>
  );
}