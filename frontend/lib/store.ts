import type { Profile, Artwork, WebtoonWork } from './types';

// In-memory store for the portfolio data
// In production, this would be replaced with a database

let webtoonWorks: WebtoonWork[] = [
  {
    id: 'work-1',
    title: '배드 럭 큐피드',
    subtitle: '2025.04 / 글, 그림',
    coverImg: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&h=800&fit=crop',
    hoverImg: 'https://images.unsplash.com/photo-1618005192305-654da6f10bc5?q=80&w=600&h=800&fit=crop',
  },
  {
    id: 'work-2',
    title: '내가 잘못했어!',
    subtitle: '2025.06 / 글, 그림',
    coverImg: 'https://images.unsplash.com/photo-1549490349-8643362247b5?q=80&w=600&h=800&fit=crop',
    hoverImg: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?q=80&w=600&h=800&fit=crop',
  },
  {
    id: 'work-3',
    title: '쓰레기는 이제 그만!',
    subtitle: '2025.05 / 그림(선화)',
    coverImg: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?q=80&w=600&h=800&fit=crop',
    hoverImg: 'https://images.unsplash.com/photo-1506259091721-347e791bab0f?q=80&w=600&h=800&fit=crop',
  }
];

export function getWebtoonWorks(): WebtoonWork[] {
  return webtoonWorks;
}

export function updateWebtoonWork(id: string, data: Partial<WebtoonWork>): WebtoonWork | undefined {
  const index = webtoonWorks.findIndex(w => w.id === id);
  if (index !== -1) {
    webtoonWorks[index] = { ...webtoonWorks[index], ...data };
    return webtoonWorks[index];
  }
  return undefined;
}

let profile: Profile = {
  id: '1',
  imageUrl: null,
  name: '삐엘',
  email: 'bbi1bl@naver.com',
  'X(twitter)': '@BBI1BL',
  bio: '',
  textBlocks: [
    {
      id: 'tb-1',
      title: '자기소개',
      content: '안녕하세요!\n남(男)들의 사랑에 관심이 많은 작가,\n삐엘입니다.',
      order: 0,
    },
    {
      id: 'tb-2',
      title: 'SKILLS',
      content: 'Clip Studio / SketchUp / Snaptoon / Adobe Photoshop / Adobe Illustrator',
      order: 1,
    }
  ],
  updatedAt: new Date().toISOString(),
};

let artworks: Artwork[] = [];

// Profile functions
export function getProfile(): Profile {
  return profile;
}

export function updateProfile(data: Partial<Profile>): Profile {
  profile = {
    ...profile,
    ...data,
    updatedAt: new Date().toISOString(),
  };
  return profile;
}

// Artwork functions
export function getArtworks(): Artwork[] {
  return artworks;
}

export function getArtworksByCategory(category: string, subcategory?: string): Artwork[] {
  return artworks.filter(a => {
    if (subcategory) {
      return a.category === category && a.subcategory === subcategory;
    }
    return a.category === category;
  });
}

export function getArtworkById(id: string): Artwork | undefined {
  return artworks.find(a => a.id === id);
}

export function createArtwork(data: Omit<Artwork, 'id' | 'createdAt'>): Artwork {
  const artwork: Artwork = {
    ...data,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  artworks.push(artwork);
  return artwork;
}

export function updateArtwork(id: string, data: Partial<Artwork>): Artwork | undefined {
  const index = artworks.findIndex(a => a.id === id);
  if (index !== -1) {
    artworks[index] = { ...artworks[index], ...data };
    return artworks[index];
  }
  return undefined;
}

export function deleteArtwork(id: string): boolean {
  const index = artworks.findIndex(a => a.id === id);
  if (index !== -1) {
    artworks.splice(index, 1);
    return true;
  }
  return false;
}

export function reorderArtwork(id: string, direction: 'up' | 'down'): boolean {
  const index = artworks.findIndex(a => a.id === id);
  if (index === -1) return false;
  
  if (direction === 'up' && index > 0) {
    const temp = artworks[index - 1];
    artworks[index - 1] = artworks[index];
    artworks[index] = temp;
    return true;
  } else if (direction === 'down' && index < artworks.length - 1) {
    const temp = artworks[index + 1];
    artworks[index + 1] = artworks[index];
    artworks[index] = temp;
    return true;
  }
  return false;
}
