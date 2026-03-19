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
    <main className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-8 bg-gray-50">
      <h1 className="text-4xl font-bold mb-8 text-gray-900 text-center">Upload File</h1>
      <div className="flex flex-col items-center gap-4 w-full max-w-md bg-white p-8 rounded-lg shadow-xl border border-gray-200">
        <input type="file" onChange={handleFileChange} className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full" />
        <button
          onClick={handleUpload}
          disabled={!selectedFile}
          className="px-6 py-3 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed w-full"
        >
          Upload
        </button>
        {message && <p className="mt-4 text-center text-gray-700">{message}</p>}
        <Link href="/view-attachments" className="text-blue-600 hover:underline mt-4 text-center font-medium">
          View All Attachments
        </Link>
        <Link href="/" className="text-blue-600 hover:underline mt-2 text-center font-medium">
          Back to Home
        </Link>
      </div>
    </main>
  );
}