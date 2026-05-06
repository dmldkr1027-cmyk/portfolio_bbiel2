import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getWebtoonWorks } from '@/lib/store';

export async function GET() {
  let works = await prisma.webtoonWork.findMany({
    orderBy: { order: 'asc' }
  });

  // 초기 DB가 비어있을 경우 store.ts 의 기본 데이터로 채워넣기 (마이그레이션)
  if (works.length === 0) {
    const defaultWorks = getWebtoonWorks();
    for (const work of defaultWorks) {
      await prisma.webtoonWork.create({
        data: {
          id: work.id,
          title: work.title,
          subtitle: work.subtitle,
          coverImg: work.coverImg,
          hoverImg: work.hoverImg,
          intro: ''
        }
      });
    }
    works = await prisma.webtoonWork.findMany({
      orderBy: { order: 'asc' }
    });
  }

  return NextResponse.json({ works });
}

export async function POST(request: Request) {
  const data = await request.json();
  const work = await prisma.webtoonWork.create({
    data: {
      title: data.title,
      subtitle: data.subtitle,
      coverImg: data.coverImg,
      hoverImg: data.hoverImg,
      intro: data.intro || ''
    }
  });
  return NextResponse.json(work);
}
