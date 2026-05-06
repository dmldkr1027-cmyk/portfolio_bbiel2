import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getProfile } from '@/lib/store';

export async function GET() {
  const profile = await prisma.profile.findFirst({
    include: { textBlocks: { orderBy: { order: 'asc' } } }
  });

  if (!profile) {
    // Migration: If no profile exists in DB, fetch from in-memory store and save it
    const defaultProfile = getProfile();
    
    if (defaultProfile) {
      const newProfile = await prisma.profile.create({
        data: {
          imageUrl: defaultProfile.imageUrl,
          homeBgUrl: null,
          name: defaultProfile.name,
          email: defaultProfile.email,
          twitter: defaultProfile['X(twitter)'],
          bio: defaultProfile.bio || '',
          textBlocks: {
            create: (defaultProfile.textBlocks || []).map((b: any, index: number) => ({
              id: b.id || crypto.randomUUID(),
              title: b.title,
              content: b.content,
              order: index
            }))
          }
        },
        include: { textBlocks: true }
      });

      return NextResponse.json({
        ...newProfile,
        'X(twitter)': newProfile.twitter
      });
    }

    // Return empty state if still nothing
    return NextResponse.json({
      id: 'default',
      imageUrl: null,
      homeBgUrl: null,
      name: '',
      email: '',
      twitter: '',
      bio: '',
      textBlocks: []
    });
  }
  
  return NextResponse.json({
    ...profile,
    'X(twitter)': profile.twitter
  });
}

export async function PUT(request: Request) {
  const data = await request.json();
  const profileId = data.id || 'default';
  
  const existingProfile = await prisma.profile.findFirst();

  let updatedProfile;
  if (!existingProfile) {
    updatedProfile = await prisma.profile.create({
      data: {
        imageUrl: data.imageUrl !== undefined ? data.imageUrl : null,
        homeBgUrl: data.homeBgUrl !== undefined ? data.homeBgUrl : null,
        name: data.name !== undefined ? data.name : null,
        email: data.email !== undefined ? data.email : null,
        twitter: data['X(twitter)'] !== undefined ? data['X(twitter)'] : (data.twitter !== undefined ? data.twitter : null),
        bio: data.bio !== undefined ? data.bio : null,
        textBlocks: data.textBlocks ? {
          create: data.textBlocks.map((b: any, index: number) => ({
            id: b.id || crypto.randomUUID(),
            title: b.title,
            content: b.content,
            order: index
          }))
        } : undefined
      },
      include: { textBlocks: true }
    });
  } else {
    // Only delete and recreate blocks if textBlocks is explicitly provided in the request
    if (data.textBlocks !== undefined) {
      await prisma.textBlock.deleteMany({ where: { profileId: existingProfile.id } });
    }
    
    updatedProfile = await prisma.profile.update({
      where: { id: existingProfile.id },
      data: {
        ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
        ...(data.homeBgUrl !== undefined && { homeBgUrl: data.homeBgUrl }),
        ...(data.name !== undefined && { name: data.name }),
        ...(data.email !== undefined && { email: data.email }),
        ...(data['X(twitter)'] !== undefined || data.twitter !== undefined ? { twitter: data['X(twitter)'] || data.twitter } : {}),
        ...(data.bio !== undefined && { bio: data.bio }),
        ...(data.textBlocks !== undefined && {
          textBlocks: {
            create: data.textBlocks.map((b: any, index: number) => ({
              id: b.id || crypto.randomUUID(),
              title: b.title,
              content: b.content,
              order: index
            }))
          }
        })
      },
      include: { textBlocks: true }
    });
  }

  // Format to match frontend types if needed
  const returnProfile = {
    ...updatedProfile,
    'X(twitter)': updatedProfile.twitter
  };

  return NextResponse.json(returnProfile);
}
