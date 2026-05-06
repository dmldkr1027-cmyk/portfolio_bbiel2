'use client';

import Link from 'next/link';
import Image from 'next/image';
import useSWR from 'swr';
import { AdminModal } from '@/components/admin-modal';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRef, useState } from 'react';
import { Spinner } from '@/components/ui/spinner';
import { Settings, Image as ImageIcon } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function WebtoonPage() {
  const { data, mutate, isLoading } = useSWR('/api/webtoon-works', fetcher);
  const [uploading, setUploading] = useState<string | null>(null);

  // References for inputs
  const titleRef = useRef<HTMLInputElement>(null);
  const subtitleRef = useRef<HTMLInputElement>(null);

  const getImageSrc = (url: string | null) => {
    if (!url) return 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&h=800&fit=crop';
    if (url.includes('blob.vercel-storage.com')) {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname.slice(1);
      return `/api/file?pathname=${encodeURIComponent(pathname)}`;
    }
    return url;
  };

  const handleUpdate = async (id: string, title?: string, subtitle?: string, coverImg?: string, hoverImg?: string) => {
    setUploading(id);
    try {
      const body: any = {};
      if (title) body.title = title;
      if (subtitle) body.subtitle = subtitle;
      if (coverImg) body.coverImg = coverImg;
      if (hoverImg) body.hoverImg = hoverImg;

      await fetch(`/api/webtoon-works/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      mutate();
    } catch (e) {
      console.error(e);
    } finally {
      setUploading(null);
    }
  };

  const handleImageUpload = async (id: string, type: 'coverImg' | 'hoverImg', file: File) => {
    setUploading(id);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const uploadData = await res.json();
      
      if (uploadData.url) {
        await handleUpdate(id, undefined, undefined, type === 'coverImg' ? uploadData.url : undefined, type === 'hoverImg' ? uploadData.url : undefined);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUploading(null);
    }
  };

  if (isLoading) {
    return (
      <div className="auto-container w-full max-w-7xl mx-auto px-4 py-12 md:py-16 space-y-12">
        <Skeleton className="h-10 w-32" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="aspect-[3/4] w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const webtoons = data?.works || [];

  return (
    <div className="auto-container w-full max-w-7xl mx-auto px-4 py-12 md:py-16">
      {/* Page Header */}
      <div className="mb-12">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">웹툰</h1>
      </div>

      {/* Grid Layout (전체적인 사각형 레이아웃) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 relative">
        {webtoons.map((webtoon: any) => (
           <div key={webtoon.id} className="relative group">
              <Link href={`/webtoon/${webtoon.id}`} className="flex flex-col cursor-pointer w-full h-full">
                
                {/* Image Container (마우스 오버 시 이미지 변경) */}
                <div className="relative w-full aspect-[3/4] overflow-hidden rounded-xl bg-slate-100 shadow-sm transition-shadow duration-300 group-hover:shadow-md">
                  {/* Default Image */}
                  <Image 
                    src={getImageSrc(webtoon.coverImg)} 
                    alt={webtoon.title} 
                    fill 
                    className="object-cover transition-opacity duration-700 ease-in-out group-hover:opacity-0 z-10" 
                  />
                  {/* Hover Image */}
                  <Image 
                    src={getImageSrc(webtoon.hoverImg)} 
                    alt={`${webtoon.title} Hover`} 
                    fill 
                    className="object-cover absolute inset-0 transition-transform duration-700 ease-in-out group-hover:scale-105 z-0" 
                  />
                </div>
                
                {/* Text Content (제목과 소제목) */}
                <div className="mt-5 space-y-1 text-center">
                  <h3 className="text-xl font-semibold text-slate-900 transition-colors duration-300 group-hover:text-[#006699]">
                    {webtoon.title}
                  </h3>
                  <p className="text-sm font-medium text-slate-500">
                    {webtoon.subtitle}
                  </p>
                </div>
              </Link>
              
              {/* 관리자용 개별 이미지 및 내용 수정 버튼 */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                <AdminModal
                  trigger={
                    <Button variant="secondary" size="icon" className="h-8 w-8 bg-white/90 shadow-sm">
                      <Settings className="w-4 h-4 text-slate-700" />
                    </Button>
                  }
                >
                  <div className="space-y-6">
                    <div className="space-y-2">
                       <Label>작품 제목</Label>
                       <div className="flex gap-2">
                         <Input 
                           defaultValue={webtoon.title} 
                           id={`${webtoon.id}-title`} 
                           onChange={(e) => {
                             if(titleRef.current) titleRef.current.value = e.target.value;
                           }} 
                         />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <Label>작품 소제목</Label>
                       <div className="flex gap-2">
                         <Input 
                           defaultValue={webtoon.subtitle} 
                           id={`${webtoon.id}-subtitle`}
                         />
                       </div>
                    </div>
                    <Button className="w-full" onClick={() => {
                        const t = (document.getElementById(`${webtoon.id}-title`) as HTMLInputElement).value;
                        const s = (document.getElementById(`${webtoon.id}-subtitle`) as HTMLInputElement).value;
                        handleUpdate(webtoon.id, t, s);
                    }}>텍스트 적용</Button>
                    
                    <div className="h-px bg-slate-200 my-4" />
                    
                    <div className="space-y-2">
                      <Label>기본 표지 이미지 (Cover)</Label>
                      <div className="flex items-center gap-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById(`${webtoon.id}-cover-upload`)?.click()}
                          disabled={uploading === webtoon.id}
                        >
                          {uploading === webtoon.id ? <Spinner className="w-4 h-4 mr-2" /> : <ImageIcon className="w-4 h-4 mr-2" />}
                          커버 이미지 변경
                        </Button>
                        <input
                          id={`${webtoon.id}-cover-upload`}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleImageUpload(webtoon.id, 'coverImg', e.target.files[0]);
                            }
                          }}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>마우스 오버 이미지 (Hover)</Label>
                      <div className="flex items-center gap-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById(`${webtoon.id}-hover-upload`)?.click()}
                          disabled={uploading === webtoon.id}
                        >
                          {uploading === webtoon.id ? <Spinner className="w-4 h-4 mr-2" /> : <ImageIcon className="w-4 h-4 mr-2" />}
                          호버 이미지 변경
                        </Button>
                        <input
                          id={`${webtoon.id}-hover-upload`}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleImageUpload(webtoon.id, 'hoverImg', e.target.files[0]);
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </AdminModal>
              </div>

           </div>
        ))}
      </div>
    </div>
  );
}
