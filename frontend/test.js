const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  const data = { homeBgUrl: '/uploads/test.jpg' };
  try {
    const existingProfile = await prisma.profile.findFirst();
    const updatedProfile = await prisma.profile.update({
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
            create: data.textBlocks.map((b, index) => ({
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
    console.log("Success", updatedProfile.homeBgUrl);
  } catch (e) {
    console.error(e);
  }
}

test();