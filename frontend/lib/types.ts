export interface TextBlock {
  id: string;
  title?: string;
  content: string;
  order: number;
}

export interface Profile {
  id: string;
  imageUrl: string | null;
  name?: string;
  birthdate?: string;
  location?: string;
  mobile?: string;
  email?: string;
  'X(twitter)': string;
  bio: string;
  textBlocks: TextBlock[];
  updatedAt: string;
}

export interface Artwork {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  imageUrls: string[];
  category: 'webtoon' | 'illustration' | 'casual';
  subcategory?: string;
  createdAt: string;
  type?: 'image' | 'text';
  content?: string;
}

export interface WebtoonWork {
  id: string;
  title: string;
  subtitle: string;
  coverImg: string;
  hoverImg: string;
}
