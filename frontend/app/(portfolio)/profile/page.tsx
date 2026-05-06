'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import useSWR from 'swr';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AdminModal } from '@/components/admin-modal';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { User, Upload, Plus, GripVertical, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import type { TextBlock } from '@/lib/types';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ProfilePage() {
  const { data: profile, mutate, isLoading } = useSWR('/api/profile', fetcher);
  const [bio, setBio] = useState('');
  const [profileData, setProfileData] = useState({
    name: '',
    birthdate: '',
    location: '',
    mobile: '',
    email: '',
    'X(twitter)': '',
  });
  const [textBlocks, setTextBlocks] = useState<TextBlock[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      setBio(profile.bio || '');
      setProfileData({
        name: profile.name || '',
        birthdate: profile.birthdate || '',
        location: profile.location || '',
        mobile: profile.mobile || '',
        email: profile.email || '',
        'X(twitter)': profile['X(twitter)'] || '',
      });
      setTextBlocks(profile.textBlocks || []);
    }
  }, [profile]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addTextBlock = () => {
    const newBlock: TextBlock = {
      id: crypto.randomUUID(),
      title: '',
      content: '',
      order: textBlocks.length,
    };
    setTextBlocks([...textBlocks, newBlock]);
  };

  const updateTextBlock = (id: string, updates: Partial<TextBlock>) => {
    setTextBlocks(textBlocks.map(block => 
      block.id === id ? { ...block, ...updates } : block
    ));
  };

  const deleteTextBlock = (id: string) => {
    setTextBlocks(textBlocks.filter(block => block.id !== id).map((block, index) => ({
      ...block,
      order: index,
    })));
  };

  const moveBlockUp = (index: number) => {
    if (index === 0) return;
    const newBlocks = [...textBlocks];
    [newBlocks[index - 1], newBlocks[index]] = [newBlocks[index], newBlocks[index - 1]];
    setTextBlocks(newBlocks.map((block, i) => ({ ...block, order: i })));
  };

  const moveBlockDown = (index: number) => {
    if (index === textBlocks.length - 1) return;
    const newBlocks = [...textBlocks];
    [newBlocks[index], newBlocks[index + 1]] = [newBlocks[index + 1], newBlocks[index]];
    setTextBlocks(newBlocks.map((block, i) => ({ ...block, order: i })));
  };

  const getImageSrc = (url: string | null) => {
    if (!url) return null;
    // Check if it's a private blob URL (contains pathname)
    if (url.includes('blob.vercel-storage.com')) {
      // Extract pathname from the URL
      const urlObj = new URL(url);
      const pathname = urlObj.pathname.slice(1); // Remove leading slash
      return `/api/file?pathname=${encodeURIComponent(pathname)}`;
    }
    return url;
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let imageUrl = profile?.imageUrl;

      if (imageFile) {
        const formData = new FormData();
        formData.append('file', imageFile);
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        const uploadData = await uploadRes.json();
        if (uploadData.error) {
          console.error('Upload error:', uploadData.error);
          return;
        }
        imageUrl = uploadData.url;
      }

      await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bio, imageUrl, textBlocks, ...profileData }),
      });

      mutate();
      setImageFile(null);
      setImagePreview(null);
    } catch (error) {
      console.error('Failed to save profile:', error);
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Card>
          <CardContent className="flex flex-col md:flex-row gap-8 p-6 md:p-8">
            <Skeleton className="h-48 w-48 md:h-64 md:w-64 rounded-full mx-auto md:mx-0 flex-shrink-0" />
            <div className="flex-1 space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const profileImageSrc = imagePreview || getImageSrc(profile?.imageUrl);
  const sortedTextBlocks = [...textBlocks].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <AdminModal>
          <div className="space-y-4 max-h-[70vh] overflow-y-auto">
            <div className="space-y-2">
              <label className="text-sm font-medium">프로필 이미지</label>
              <div className="flex items-center gap-4">
                <div className="relative h-24 w-24 overflow-hidden rounded-full bg-primary/20">
                  {profileImageSrc ? (
                    <Image
                      src={profileImageSrc}
                      alt="프로필 미리보기"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <User className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <label className="cursor-pointer">
                  <div className="flex items-center gap-2 rounded-md border px-4 py-2 text-sm hover:bg-accent">
                    <Upload className="h-4 w-4" />
                    이미지 업로드
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>
              </div>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">이름</label>
                  <Input
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    placeholder="이름"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">이메일</label>
                  <Input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    placeholder="E-mail"
                  />
                </div>
                <div className="space-y-2 flex flex-col justify-end">
                  <label className="text-sm font-medium">'X(twitter)'</label>
                  <Input
                    value={profileData['X(twitter)']}
                    onChange={(e) => setProfileData({ ...profileData, 'X(twitter)': e.target.value })}
                    placeholder="@x_handle"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">텍스트 블록</label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addTextBlock}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  블록 추가
                </Button>
              </div>
              <div className="space-y-3">
                {textBlocks.map((block, index) => (
                  <div key={block.id} className="flex items-start gap-2 p-3 border rounded-lg bg-background">
                    <div className="flex flex-col gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => moveBlockUp(index)}
                        disabled={index === 0}
                      >
                        <ArrowUp className="h-3 w-3" />
                      </Button>
                      <GripVertical className="h-4 w-4 text-muted-foreground mx-auto" />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => moveBlockDown(index)}
                        disabled={index === textBlocks.length - 1}
                      >
                        <ArrowDown className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="flex flex-col flex-1 gap-2">
                      <Input
                        value={block.title || ''}
                        onChange={(e) => updateTextBlock(block.id, { title: e.target.value })}
                        placeholder="섹션 제목 (예: EDUCATION)"
                        className="font-bold"
                      />
                      <Textarea
                        value={block.content}
                        onChange={(e) => updateTextBlock(block.id, { content: e.target.value })}
                        placeholder="내용을 입력하세요..."
                        rows={3}
                        className="flex-1 text-sm whitespace-pre-wrap"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => deleteTextBlock(block.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              {textBlocks.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  텍스트 블록이 없습니다. 블록을 추가하세요.
                </p>
              )}
            </div>

            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving ? <><Spinner className="mr-2 h-4 w-4" />저장 중...</> : '저장'}
            </Button>
          </div>
        </AdminModal>
      </div>

      {/* Main Profile Area */}
      <div className="py-4 md:py-8">
        
        {/* Top Section */}
        <div className="flex flex-col md:flex-row justify-between mb-8">
          
          <div className="space-y-8 flex-1 mt-4">
            <div className="space-y-4">
              <h2 className="text-[#006699] font-bold text-sm tracking-widest">PROFILE</h2>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-slate-800">
                  {profileData.name || '이름 없음'}
                </h1>
              </div>
            </div>

            <div className="space-y-2 text-sm text-slate-600">
              <p><span className="w-20 inline-block font-semibold text-slate-500">E-mail</span> {profileData.email}</p>
              <p><span className="w-20 inline-block font-semibold text-slate-500">'X(twitter)'</span> {profileData['X(twitter)']}</p>
            </div>
          </div>

          {/* Profile Image (Right) */}
          <div className="mt-8 md:mt-0 flex-shrink-0 mx-auto md:mx-0">
            <div className="relative h-48 w-48 md:h-64 md:w-64 rounded-[2rem] bg-slate-100 overflow-hidden shadow-inner flex items-center justify-center">
              {profile?.imageUrl ? (
                <>
                  {imageLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-50 z-10">
                      <Spinner className="h-8 w-8" />
                    </div>
                  )}
                  <Image
                    src={getImageSrc(profile.imageUrl) || ''}
                    alt="프로필 이미지"
                    fill
                    className="object-cover"
                    onLoad={() => setImageLoading(false)}
                    onError={() => setImageLoading(false)}
                  />
                </>
              ) : (
                <User className="h-20 w-20 text-slate-300" />
              )}
            </div>
          </div>
        </div>

        {/* Separator / Spacer */}
        <div className="border-t border-slate-100 mb-12"></div>

        {/* Bottom Section (Text Blocks Grid) */}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-12 space-y-12">
          {sortedTextBlocks.length > 0 ? sortedTextBlocks.map((block) => (
            <div key={block.id} className="break-inside-avoid relative">
              {block.title && (
                <h3 className="text-[#006699] font-bold text-sm tracking-widest uppercase mb-4">
                  {block.title}
                </h3>
              )}
              <div className="text-slate-700 whitespace-pre-wrap leading-relaxed text-sm">
                {block.content}
              </div>
            </div>
          )) : (
            <p className="text-muted-foreground col-span-3 text-center">
              작성된 이력이 없습니다.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
