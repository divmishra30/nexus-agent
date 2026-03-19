'use client';

import { useEffect, useState, useCallback } from 'react';

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

  // State for comments
  const [comments, setComments] = useState<Comment[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [loggedInUser, setLoggedInUser] = useState<string>('Guest'); // Default user
  const [replyingTo, setReplyingTo] = useState<string | null>(null); // ID of comment being replied to
  const [replyText, setReplyText] = useState('');

  // Load comments from localStorage on mount
  useEffect(() => {
    const storedComments = localStorage.getItem('countryFlagsComments');
    if (storedComments) {
      setComments(JSON.parse(storedComments));
    }
  }, []);

  // Save comments to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('countryFlagsComments', JSON.stringify(comments));
  }, [comments]);

  // Recursive function to find a comment by ID and add a reply
  const addReplyToComment = useCallback((currentComments: Comment[], parentId: string, newReply: Comment): Comment[] => {
    return currentComments.map(comment => {
      if (comment.id === parentId) {
        return {
          ...comment,
          replies: [...comment.replies, newReply]
        };
      }
      // Recursively check replies
      if (comment.replies && comment.replies.length > 0) {
        return {
          ...comment,
          replies: addReplyToComment(comment.replies, parentId, newReply)
        };
      }
      return comment;
    });
  }, []);

  // Handles submitting a new top-level comment or a reply to an existing one
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
      id: Date.now().toString(), // Simple unique ID
      userId: loggedInUser,
      username: loggedInUser, // Using userId as username for simplicity
      text: text.trim(),
      timestamp: new Date().toLocaleString(),
      replies: [],
    };

    if (parentId) {
      setComments(prev => addReplyToComment(prev, parentId, newComment));
      setReplyText('');
      setReplyingTo(null);
    } else {
      setComments(prev => [newComment, ...prev]); // Add new comments at the top
      setNewCommentText('');
    }
  }, [loggedInUser, newCommentText, replyText, addReplyToComment]);

  // Component for rendering comments recursively
  const CommentSection = ({ commentsToRender, level = 0 }: { commentsToRender: Comment[]; level?: number }) => (
    <div className={`space-y-6 ${level > 0 ? 'ml-8 pl-6 border-l border-[var(--color-border-default)]' : ''}`}>
      {commentsToRender.map(comment => (
        <div key={comment.id} className="bg-[var(--color-background-card)] p-5 rounded-xl shadow-md border border-[var(--color-border-default)]">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-[var(--color-text-default)]">{comment.username}</span>
            <span className="text-sm text-[var(--color-text-muted)]">{comment.timestamp}</span>
          </div>
          <p className="text-[var(--color-text-default)] mb-3 whitespace-pre-wrap">{comment.text}</p>
          {loggedInUser !== 'Guest' && (
            <button
              onClick={() => {
                setReplyingTo(comment.id);
                setReplyText(''); // Clear previous reply text
              }}
              className="text-sm text-[var(--color-primary-600)] hover:text-[var(--color-secondary-500)] hover:underline transition-colors duration-200"
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
                className="w-full p-3 border border-[var(--color-border-default)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] transition-colors duration-200"
                rows={2}
              ></textarea>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setReplyingTo(null)}
                  className="px-4 py-2 text-sm rounded-lg bg-[var(--color-background-light)] text-[var(--color-text-default)] hover:bg-[var(--color-background-default)] transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSubmitComment(comment.id)}
                  className="px-4 py-2 text-sm rounded-lg bg-[var(--color-primary-500)] text-white hover:bg-[var(--color-primary-600)] transition-colors duration-200"
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

  // Existing useEffect for fetching countries
  useEffect(() => {
    async function fetchCountries() {
      try {
        setLoading(true);
        // Request specific fields to keep the payload small and filter by region: Asia
        const response = await fetch('https://restcountries.com/v3.1/region/asia?fields=name,flags,cca2');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: Country[] = await response.json();
        // Sort alphabetically by common name for consistency and take the first 12 for a 3x4 grid
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
      <main className="flex flex-col items-center justify-center py-12 px-4 sm:px-8 bg-[var(--color-background-default)]">
        <p className="text-lg text-[var(--color-text-default)]">Loading country flags...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex flex-col items-center justify-center py-12 px-4 sm:px-8 bg-[var(--color-background-default)]">
        <p className="text-[var(--color-error-600)] text-lg">{error}</p>
      </main>
    );
  }

  return (
    <main className="flex flex-col items-center py-12 px-4 sm:px-8 bg-[var(--color-background-default)]">
      <h1 className="text-[var(--font-size-4xl)] font-[var(--font-weight-extrabold)] mb-10 text-[var(--color-text-default)] text-center tracking-tight">Country Flags (3x4 Grid)</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
        {countries.map((country) => (
          <div 
            key={country.cca2} 
            className="flex flex-col items-center p-6 bg-[var(--color-background-card)] rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-[var(--color-border-default)]"
          >
            <img 
              src={country.flags.png} 
              alt={country.flags.alt} 
              className="w-32 h-20 object-cover rounded-md mb-4 border border-[var(--color-border-default)]" 
            />
            <p className="text-lg font-semibold text-[var(--color-text-default)] text-center">{country.name.common}</p>
          </div>
        ))}
      </div>

      {/* Discussion Section */}
      <div className="w-full max-w-3xl mt-16 bg-[var(--color-background-card)] p-8 rounded-2xl shadow-xl border border-[var(--color-border-default)]">
        <h2 className="text-[var(--font-size-3xl)] font-[var(--font-weight-extrabold)] mb-8 text-[var(--color-text-default)] text-center border-b pb-4 border-[var(--color-border-default)]">Reviews & Discussion</h2>

        {/* Login Toggle */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8 pb-6 border-b border-[var(--color-border-default)]">
          <span className="text-lg text-[var(--color-text-default)]">Currently logged in as: <span className="font-bold text-[var(--color-primary-600)]">{loggedInUser}</span></span>
          <select
            value={loggedInUser}
            onChange={(e) => setLoggedInUser(e.target.value)}
            className="p-2 border border-[var(--color-border-default)] rounded-lg bg-white text-[var(--color-text-default)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] cursor-pointer transition-colors duration-200"
          >
            <option value="Guest">Guest (Read-only)</option>
            <option value="Alice">Alice</option>
            <option value="Bob">Bob</option>
            <option value="Charlie">Charlie</option>
          </select>
        </div>

        {/* New Comment Input */}
        {loggedInUser !== 'Guest' ? (
          <div className="mb-8 p-6 bg-[var(--color-background-light)] rounded-xl border border-[var(--color-border-default)]">
            <h3 className="text-[var(--font-size-2xl)] font-[var(--font-weight-bold)] mb-6 text-[var(--color-text-default)]">Add a Comment</h3>
            <textarea
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              placeholder="Write your review or comment here..."
              className="w-full p-3 border border-[var(--color-border-default)] rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] transition-colors duration-200"
              rows={4}
            ></textarea>
            <button
              onClick={() => handleSubmitComment()}
              className="px-6 py-3 rounded-lg bg-[var(--color-primary-500)] text-white font-semibold hover:bg-[var(--color-primary-600)] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!newCommentText.trim()}
            >
              Post Comment
            </button>
          </div>
        ) : (
          <div className="mb-8 p-6 bg-[var(--color-warning-50)] border border-[var(--color-warning-600)] text-[var(--color-warning-600)] rounded-xl text-center">
            <p className="font-semibold">Log in to post comments and replies.</p>
          </div>
        )}


        {/* Comments List */}
        <div className="space-y-6">
          <h3 className="text-[var(--font-size-2xl)] font-[var(--font-weight-bold)] mb-6 text-[var(--color-text-default)] border-b pb-3">All Comments</h3>
          {comments.length === 0 ? (
            <p className="text-center text-[var(--color-text-muted)]">No comments yet. Be the first to comment!</p>
          ) : (
            <CommentSection commentsToRender={comments} />
          )}
        </div>
      </div>
    </main>
  );
}
