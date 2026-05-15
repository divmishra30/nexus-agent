'use client';
import { useState, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function UploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info' | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
      setMessage('');
      setMessageType(null);
    } else {
      setSelectedFile(null);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
      setMessage('');
      setMessageType(null);
    }
  }, []);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleUpload = async () => {
    if (!selectedFile) {
      setMessage('Please select a file first.');
      setMessageType('info');
      return;
    }

    setUploading(true);
    setMessage('Uploading...');
    setMessageType('info');

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setMessage('File uploaded successfully!');
        setMessageType('success');
        setSelectedFile(null);
      } else {
        const errorData = await response.json();
        setMessage(`Upload failed: ${errorData.error || response.statusText}`);
        setMessageType('error');
      }
    } catch (error) {
      setMessage(`An error occurred: ${(error as Error).message}`);
      setMessageType('error');
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const messageStyles = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center py-16 px-4 sm:px-8 bg-gradient-to-br from-white via-slate-50 to-slate-100">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-lg"
      >
        <h1 className="text-4xl md:text-5xl font-black mb-3 text-slate-900 text-center tracking-tight">
          Upload{' '}
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Files
          </span>
        </h1>
        <p className="text-slate-500 text-center mb-10 font-medium">
          Drag & drop or click to select a file
        </p>

        <div className="bg-white border-2 border-slate-200 rounded-3xl shadow-xl p-8">
          {/* Drop Zone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => document.getElementById('file-input')?.click()}
            className={`relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 ${
              isDragging
                ? 'border-blue-500 bg-blue-50 scale-[1.02]'
                : selectedFile
                ? 'border-emerald-400 bg-emerald-50'
                : 'border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-blue-50/50'
            }`}
          >
            <input
              id="file-input"
              type="file"
              onChange={handleFileChange}
              className="hidden"
            />

            <AnimatePresence mode="wait">
              {selectedFile ? (
                <motion.div
                  key="file-selected"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex flex-col items-center gap-3"
                >
                  <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center">
                    <svg className="w-7 h-7 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{selectedFile.name}</p>
                    <p className="text-slate-500 text-xs mt-1">{formatFileSize(selectedFile.size)}</p>
                  </div>
                  <p className="text-xs text-slate-400">Click to change file</p>
                </motion.div>
              ) : (
                <motion.div
                  key="no-file"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-3"
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
                    isDragging ? 'bg-blue-100' : 'bg-slate-100'
                  }`}>
                    <svg className={`w-7 h-7 transition-colors ${
                      isDragging ? 'text-blue-600' : 'text-slate-400'
                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold text-slate-700 text-sm">
                      {isDragging ? 'Drop it here!' : 'Drop your file here'}
                    </p>
                    <p className="text-slate-400 text-xs mt-1">or click to browse</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className="mt-6 w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-2xl shadow-lg hover:opacity-90 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {uploading ? (
              <>
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Uploading...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Upload File
              </>
            )}
          </button>

          {/* Message */}
          <AnimatePresence>
            {message && messageType && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`mt-4 px-4 py-3 rounded-xl border-2 text-sm font-medium ${messageStyles[messageType]}`}
              >
                {message}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Links */}
          <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
            <Link
              href="/view-attachments"
              className="flex-1 py-3 text-center text-sm font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors duration-200 border-2 border-blue-100"
            >
              View All Attachments
            </Link>
            <Link
              href="/"
              className="flex-1 py-3 text-center text-sm font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors duration-200 border-2 border-slate-100"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
