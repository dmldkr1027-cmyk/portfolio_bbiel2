import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { direction } = body;
    
    if (!['up', 'down', 'first', 'last'].includes(direction)) {
      return NextResponse.json({ error: 'Invalid direction' }, { status: 400 });
    }
    
    const currentArtwork = await prisma.artwork.findUnique({ where: { id } });
    if (!currentArtwork) {
      return NextResponse.json({ error: 'Artwork not found' }, { status: 404 });
    }

    const subcategoryCondition = currentArtwork.subcategory ? { subcategory: currentArtwork.subcategory } : {};
    
    if (direction === 'first') {
      const target = await prisma.artwork.findFirst({
        where: { category: currentArtwork.category, ...subcategoryCondition },
        orderBy: { order: 'desc' },
      });
      if (target && target.id !== id) {
        await prisma.artwork.update({
          where: { id },
          data: { order: target.order + 1 },
        });
      }
      return NextResponse.json({ success: true });
    }

    if (direction === 'last') {
      const target = await prisma.artwork.findFirst({
        where: { category: currentArtwork.category, ...subcategoryCondition },
        orderBy: { order: 'asc' },
      });
      if (target && target.id !== id) {
        await prisma.artwork.update({
          where: { id },
          data: { order: target.order - 1 },
        });
      }
      return NextResponse.json({ success: true });
    }
    
    let swapTarget;
    if (direction === 'up') {
      swapTarget = await prisma.artwork.findFirst({
        where: {
          category: currentArtwork.category,
          ...subcategoryCondition,
          order: { gt: currentArtwork.order },
        },
        orderBy: { order: 'asc' },
      });
    } else {
      swapTarget = await prisma.artwork.findFirst({
        where: {
          category: currentArtwork.category,
          ...subcategoryCondition,
          order: { lt: currentArtwork.order },
        },
        orderBy: { order: 'desc' },
      });
    }

    if (!swapTarget) {
      return NextResponse.json({ error: 'Cannot be moved' }, { status: 400 });
    }
    
    // Swap orders
    await prisma.$transaction([
      prisma.artwork.update({
        where: { id },
        data: { order: swapTarget.order },
      }),
      prisma.artwork.update({
        where: { id: swapTarget.id },
        data: { order: currentArtwork.order },
      }),
    ]);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to reorder' }, { status: 500 });
  }
}
