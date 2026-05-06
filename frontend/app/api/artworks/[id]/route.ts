import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const dbArtwork = await prisma.artwork.findUnique({ where: { id } });
  
  if (!dbArtwork) {
    return NextResponse.json({ error: 'Artwork not found' }, { status: 404 });
  }
  
  const artwork = { ...dbArtwork, imageUrls: JSON.parse(dbArtwork.imageUrls) };
  return NextResponse.json(artwork);
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const data = await request.json();
    
    const updateData: any = { ...data };
    if (data.imageUrls) {
      updateData.imageUrls = JSON.stringify(data.imageUrls);
    }
    
    const dbUpdated = await prisma.artwork.update({
      where: { id },
      data: updateData,
    });
    
    return NextResponse.json({ ...dbUpdated, imageUrls: JSON.parse(dbUpdated.imageUrls) });
  } catch (err) {
    return NextResponse.json({ error: 'Artwork not found' }, { status: 404 });
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    await prisma.artwork.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Artwork not found' }, { status: 404 });
  }
}
