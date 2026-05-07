import { type NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const originalName = file.name.replace(/\.[^/.]+$/, '');
    const extension = path.extname(file.name) || '.jpg';
    const filename = `${originalName}-${Date.now()}${extension}`;

    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const blob = await put(filename, buffer, {
        access: 'private',
        addRandomSuffix: true,
        contentType: file.type || 'application/octet-stream',
      });

      return NextResponse.json(blob);
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadDir, { recursive: true });
    await fs.writeFile(path.join(uploadDir, filename), buffer);

    return NextResponse.json({ url: `/uploads/${filename}`, pathname: filename });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
