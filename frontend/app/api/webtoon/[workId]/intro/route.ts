import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ workId: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  const { workId } = await params;
  const work = await prisma.webtoonWork.findUnique({ where: { id: workId } });
  const introduction = work?.intro || '';
  return NextResponse.json({ introduction });
}

export async function PUT(request: Request, { params }: RouteParams) {
  const { workId } = await params;
  const data = await request.json();
  await prisma.webtoonWork.update({
    where: { id: workId },
    data: { intro: data.introduction }
  });
  return NextResponse.json({ success: true, introduction: data.introduction });
}
