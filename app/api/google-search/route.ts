import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q');

  if (!query) {
    return NextResponse.json({ error: 'Query parameter "q" is required' }, { status: 400 });
  }

  const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
  const cx = process.env.GOOGLE_SEARCH_ENGINE_ID;

  if (!apiKey || !cx) {
    return NextResponse.json(
      { error: 'Server misconfiguration: Google Search API Key or Search Engine ID is missing.' },
      { status: 500 }
    );
  }

  try {
    const googleSearchUrl = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(query)}`;
    const response = await fetch(googleSearchUrl);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Google Custom Search API Error:', errorData);
      return NextResponse.json(
        { error: errorData.error?.message || 'Failed to fetch search results from Google' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('API Route Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
