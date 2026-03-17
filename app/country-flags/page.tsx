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
    <div className={`space-y-6 ${level > 0 ? 'ml-6 pl-4 border-l border-gray-200' : ''}`}>
      {commentsToRender.map(comment => (
        <div key={comment.id} className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-gray-800">{comment.username}</span>
            <span className="text-sm text-gray-500">{comment.timestamp}</span>
          </div>
          <p className="text-gray-700 mb-3 whitespace-pre-wrap">{comment.text}</p>
          {loggedInUser !== 'Guest' && (
            <button
              onClick={() => {
                setReplyingTo(comment.id);
                setReplyText(''); // Clear previous reply text
              }}
              className="text-sm text-blue-600 hover:underline"
            >
              Reply
            </button>
          )}

          {replyingTo === comment.id && (
            <div className="mt-4 flex flex-col gap-2">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={`Replying to ${comment.username}...`}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
              ></textarea>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setReplyingTo(null)}
                  className="px-4 py-2 text-sm rounded-md bg-gray-200 hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSubmitComment(comment.id)}
                  className="px-4 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700"
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
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <p>Loading country flags...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <p className="text-red-500">{error}</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-24 bg-gray-100">
      <h1 className="text-4xl font-bold mb-10 text-gray-800">Country Flags (3x4 Grid)</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
        {countries.map((country) => (
          <div 
            key={country.cca2} 
            className="flex flex-col items-center p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
          >
            <img 
              src={country.flags.png} 
              alt={country.flags.alt} 
              className="w-24 h-16 object-cover mb-3 border border-gray-200" 
            />
            <p className="text-lg font-semibold text-gray-700 text-center">{country.name.common}</p>
          </div>
        ))}
      </div>

      {/* Discussion Section */}
      <div className="w-full max-w-2xl mt-12 bg-white p-8 rounded-lg shadow-xl">
        <h2 className="text-3xl font-bold mb-8 text-gray-800 text-center">Reviews & Discussion</h2>

        {/* Login Toggle */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6 pb-6 border-b border-gray-200">
          <span className="text-lg text-gray-700">Currently logged in as: <span className="font-bold text-blue-600">{loggedInUser}</span></span>
          <select
            value={loggedInUser}
            onChange={(e) => setLoggedInUser(e.target.value)}
            className="p-2 border border-gray-300 rounded-md bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="Guest">Guest (Read-only)</option>
            <option value="Alice">Alice</option>
            <option value="Bob">Bob</option>
            <option value="Charlie">Charlie</option>
          </select>
        </div>

        {/* New Comment Input */}
        {loggedInUser !== 'Guest' ? (
          <div className="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-100">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Add a Comment</h3>
            <textarea
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              placeholder="Write your review or comment here..."
              className="w-full p-3 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
              rows={4}
            ></textarea>
            <button
              onClick={() => handleSubmitComment()}
              className="px-6 py-3 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!newCommentText.trim()}
            >
              Post Comment
            </button>
          </div>
        ) : (
          <div className="mb-8 p-6 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg text-center">
            <p className="font-semibold">Log in to post comments and replies.</p>
          </div>
        )}


        {/* Comments List */}
        <div className="space-y-6">
          <h3 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-3">All Comments</h3>
          {comments.length === 0 ? (
            <p className="text-center text-gray-600">No comments yet. Be the first to comment!</p>
          ) : (
            <CommentSection commentsToRender={comments} />
          )}
        </div>
      </div>
    </main>
  );
}
