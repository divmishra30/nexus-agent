import { NextRequest, NextResponse } from 'next/server';
import { readdir } from 'fs/promises';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    
    let files: string[] = [];
    try {
      files = await readdir(uploadDir);
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        // Directory doesn't exist, return empty array
        return NextResponse.json({ files: [] }, { status: 200 });
      }
      throw error; // Re-throw other errors
    }

    // Filter out any hidden files or directories that might appear
    const attachmentFiles = files.filter(name => !name.startsWith('.'));

    return NextResponse.json({ files: attachmentFiles }, { status: 200 });
  } catch (error) {
    console.error('Error listing attachments:', error);
    return NextResponse.json({ error: 'Failed to list attachments.' }, { status: 500 });
  }
}
