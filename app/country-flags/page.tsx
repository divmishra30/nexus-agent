'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Country {
  name: {
    common: string;
  };
  flags: {
    png: string;
    alt: string;
  };
  cca2: string;
}

interface Comment {
  id: string;
  userId: string;
  username: string;
  text: string;
  timestamp: string;
  replies: Comment[];
}

export default function CountryFlagsPage() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [loggedInUser, setLoggedInUser] = useState<string>('Guest');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  const definedCardClasses = "bg-white border-2 border-slate-100 rounded-[var(--radius-2xl)] shadow-sm transition-all duration-300 ease-in-out hover:border-slate-300 hover:shadow-md";

  useEffect(() => {
    const storedComments = localStorage.getItem('countryFlagsComments');
    if (storedComments) {
      setComments(JSON.parse(storedComments));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('countryFlagsComments', JSON.stringify(comments));
  }, [comments]);

  const addReplyToComment = useCallback((currentComments: Comment[], parentId: string, newReply: Comment): Comment[] => {
    return currentComments.map(comment => {
      if (comment.id === parentId) {
        return {
          ...comment,
          replies: [...comment.replies, newReply]
        };
      }
      if (comment.replies && comment.replies.length > 0) {
        return {
          ...comment,
          replies: addReplyToComment(comment.replies, parentId, newReply)
        };
      }
      return comment;
    });
  }, []);

  const handleSubmitComment = useCallback((parentId: string | null = null) => {
    if (loggedInUser === 'Guest') {
      alert('Please log in to post comments.');
      return;
    }
    const text = parentId ? replyText : newCommentText;
    if (!text.trim()) {
      alert('Comment cannot be empty.');
      return;
    }
    const newComment: Comment = {
      id: Date.now().toString(),      userId: loggedInUser,
      username: loggedInUser,
      text: text.trim(),
      timestamp: new Date().toLocaleString(),
      replies: [],
    };
    if (parentId) {
      setComments(prev => addReplyToComment(prev, parentId, newComment));
      setReplyText('');
      setReplyingTo(null);
    } else {
      setComments(prev => [newComment, ...prev]);
      setNewCommentText('');
    }
  }, [loggedInUser, newCommentText, replyText, addReplyToComment]);

  const CommentSection = ({ commentsToRender, level = 0 }: { commentsToRender: Comment[]; level?: number }) => (
    <div className={`space-y-6 ${level > 0 ? 'ml-8 pl-6 border-l-2 border-slate-100' : ''}`}>
      {commentsToRender.map(comment => (
        <div key={comment.id} className="bg-white p-5 rounded-[var(--radius-2xl)] shadow-md border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-slate-900">{comment.username}</span>
            <span className="text-sm text-slate-400">{comment.timestamp}</span>
          </div>
          <p className="text-slate-700 mb-3 whitespace-pre-wrap">{comment.text}</p>
          {loggedInUser !== 'Guest' && (
            <button
              onClick={() => {
                setReplyingTo(comment.id);
                setReplyText('');
              }}
              className="text-sm text-blue-600 font-bold hover:underline transition-colors duration-200"
            >
              Reply
            </button>
          )}
          {replyingTo === comment.id && (
            <div className="mt-4 flex flex-col gap-3">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={`Replying to ${comment.username}...`}
                className="w-full p-3 border border-slate-200 rounded-[var(--radius-lg)] focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-slate-900 transition-colors duration-200"
                rows={2}
              ></textarea>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setReplyingTo(null)}
                  className="px-4 py-2 text-sm rounded-[var(--radius-lg)] bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSubmitComment(comment.id)}
                  className="px-4 py-2 text-sm rounded-[var(--radius-lg)] bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200 font-bold"
                >
                  Post Reply
                </button>
              </div>
            </div>
          )}
          {comment.replies.length > 0 && (
            <div className="mt-4">
              <CommentSection commentsToRender={comment.replies} level={level + 1} />
            </div>
          )}
        </div>
      ))}
    </div>
  );

  useEffect(() => {
    async function fetchCountries() {
      try {
        setLoading(true);
        const response = await fetch('https://restcountries.com/v3.1/region/asia?fields=name,flags,cca2');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: Country[] = await response.json();
        const sortedCountries = data
          .sort((a, b) => a.name.common.localeCompare(b.name.common))
          .slice(0, 12);
        setCountries(sortedCountries);
      } catch (err) {
        setError(`Failed to fetch countries: ${(err as Error).message}`);
      } finally {
        setLoading(false);
      }
    }
    fetchCountries();
  }, []);

  if (loading) {
    return (
      <main className="flex flex-col items-center justify-center py-12 px-4 sm:px-8 bg-white">
        <p className="text-lg text-slate-600">Loading country flags...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex flex-col items-center justify-center py-12 px-4 sm:px-8 bg-white">
        <p className="text-red-600 text-lg">{error}</p>
      </main>
    );
  }

  return (
    <main className="flex flex-col items-center py-12 px-4 sm:px-8 bg-white">
      <h1 className="text-[var(--font-size-4xl)] font-black mb-10 text-slate-900 text-center tracking-tight">Country Flags</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
        {countries.map((country) => {
          const isSelected = selectedCountry === country.cca2;
          return (
            <motion.div 
              key={country.cca2}
              onClick={() => setSelectedCountry(country.cca2)}
              className={`flex flex-col items-center p-6 cursor-pointer relative ${definedCardClasses} ${isSelected ? 'ring-2 ring-blue-600 ring-offset-4 scale-[1.05]' : ''}`}
            >
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    layoutId="flag-selection"
                    className="absolute -inset-[3px] border-2 border-blue-600 rounded-[calc(var(--radius-2xl)+4px)] z-10 pointer-events-none"
                  />
                )}
              </AnimatePresence>
              <img
                src={country.flags.png}
                alt={country.flags.alt}
                className="w-32 h-20 object-cover rounded-[var(--radius-md)] mb-4 border border-slate-200"
              />
              <p className="text-lg font-bold text-slate-900 text-center">{country.name.common}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="w-full max-w-3xl mt-16 bg-slate-50 p-8 rounded-[var(--radius-2xl)] border-2 border-slate-100">
        <h2 className="text-[var(--font-size-3xl)] font-black mb-8 text-slate-900 text-center border-b-2 pb-4 border-slate-200">Reviews & Discussion</h2>
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8 pb-6 border-b border-slate-200">
          <span className="text-lg text-slate-700">Currently logged in as: <span className="font-bold text-blue-600">{loggedInUser}</span></span>
          <select
            value={loggedInUser}
            onChange={(e) => setLoggedInUser(e.target.value)}
            className="p-2 border-2 border-slate-200 rounded-[var(--radius-lg)] bg-white text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-100 cursor-pointer font-bold"
          >
            <option value="Guest">Guest (Read-only)</option>
            <option value="Alice">Alice</option>
            <option value="Bob">Bob</option>
            <option value="Charlie">Charlie</option>
          </select>
        </div>

        {loggedInUser !== 'Guest' ? (
          <div className="mb-8 p-6 bg-white rounded-[var(--radius-2xl)] border-2 border-slate-100 shadow-sm">
            <h3 className="text-xl font-bold mb-6 text-slate-900">Add a Comment</h3>
            <textarea
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              placeholder="Write your review or comment here..."
              className="w-full p-3 border-2 border-slate-100 rounded-[var(--radius-lg)] mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-slate-900"
              rows={4}
            ></textarea>
            <button
              onClick={() => handleSubmitComment()}
              className="px-6 py-3 rounded-[var(--radius-lg)] bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50"
              disabled={!newCommentText.trim()}
            >
              Post Comment
            </button>
          </div>
        ) : (
          <div className="mb-8 p-6 bg-amber-50 border-2 border-amber-200 text-amber-800 rounded-[var(--radius-2xl)] text-center">
            <p className="font-bold">Log in to post comments and replies.</p>
          </div>
        )}

        <div className="space-y-6">
          <h3 className="text-xl font-bold mb-6 text-slate-900 border-b-2 pb-3 border-slate-100">All Comments</h3>
          {comments.length === 0 ? (
            <p className="text-center text-slate-400 font-medium">No comments yet. Be the first to comment!</p>
          ) : (
            <CommentSection commentsToRender={comments} />
          )}
        </div>
      </div>
    </main>
  );
}