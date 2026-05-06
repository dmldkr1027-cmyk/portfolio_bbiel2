import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updatedWork = await prisma.webtoonWork.update({
      where: { id },
      data: body,
    });
    
    return NextResponse.json(updatedWork);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update work' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    await prisma.webtoonWork.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete work' }, { status: 500 });
  }
}
