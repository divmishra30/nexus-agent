import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required in the request body.' }, { status: 400 });
    }

    // Validate URL format (basic check)
    try {
      new URL(url);
    } catch (e) {
      return NextResponse.json({ error: 'Invalid URL format.' }, { status: 400 });
    }

    // === IMPORTANT: HTML PARSING LIBRARY MISSING ===
    // To properly implement the HTML parsing for title and image, a server-side
    // HTML parsing library like 'cheerio' or 'jsdom' is required.
    // These libraries are NOT listed in the 'AVAILABLE DEPENDENCIES' for this project.
    // Therefore, this functionality cannot be fully implemented without adding a new dependency.
    // Uncomment and run `npm install cheerio` if you wish to enable this feature.
    // For now, a placeholder response is returned.

    // Simulating a fetch operation and returning a placeholder/error
    console.warn(`Attempted to fetch URL: ${url} for details. HTML parsing library (e.g., cheerio) is missing.`);

    // In a real implementation with cheerio:
    /*
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch external URL: ${response.statusText}`);
    }
    const html = await response.text();
    const $ = cheerio.load(html);

    const title = $('title').text();
    let imageUrl = $('meta[property="og:image"]').attr('content');

    if (!imageUrl) {
      // Fallback to first img tag in body
      imageUrl = $('body img').attr('src');
      // Basic attempt to resolve relative URLs
      if (imageUrl && !imageUrl.startsWith('http')) {
        try {
          const baseUrl = new URL(url);
          imageUrl = new URL(imageUrl, baseUrl).href;
        } catch (e) { 
          imageUrl = null; 
        }
      }
    }

    if (!imageUrl) {
      // Fallback to favicon
      imageUrl = $('link[rel="icon"]').attr('href') || $('link[rel="shortcut icon"]').attr('href');
      if (imageUrl && !imageUrl.startsWith('http')) {
        try {
          const baseUrl = new URL(url);
          imageUrl = new URL(imageUrl, baseUrl).href;
        } catch (e) { 
          imageUrl = null; 
        }
      }
    }
    */

    // Placeholder response due to missing dependency
    return NextResponse.json(
      {
        title: `(Parser Missing) Details for: ${url}`,
        imageUrl: 'https://via.placeholder.com/300x200?text=Parser+Needed'
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching URL details:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred on the server.' },
      { status: 500 }
    );
  }
}
