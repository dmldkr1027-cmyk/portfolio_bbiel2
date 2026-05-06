import { type NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const category = searchParams.get('category') || '';
  const subcategory = searchParams.get('subcategory') || undefined;

  const whereClause: any = { category };
  if (subcategory) {
    whereClause.subcategory = subcategory;
  }

  const dbArtworks = await prisma.artwork.findMany({
    where: whereClause,
    orderBy: { order: 'desc' },
  });

  const artworks = dbArtworks.map(art => ({
    ...art,
    imageUrls: JSON.parse(art.imageUrls)
  }));

  return NextResponse.json({ artworks });
}

export async function POST(request: Request) {
  const data = await request.json();
  const dbArtwork = await prisma.artwork.create({
    data: {
      ...data,
      id: crypto.randomUUID(),
      imageUrls: JSON.stringify(data.imageUrls || []),
    },
  });

  const artwork = {
    ...dbArtwork,
    imageUrls: JSON.parse(dbArtwork.imageUrls)
  };
  return NextResponse.json(artwork);
}
