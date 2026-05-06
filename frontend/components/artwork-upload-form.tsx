'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { X, Upload } from 'lucide-react';

interface ArtworkUploadFormProps {
  category: string;
  subcategory?: string;
  onSuccess?: () => void;
}

export function ArtworkUploadForm({ category, subcategory, onSuccess }: ArtworkUploadFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length > 0) {
      setFiles((prev) => [...prev, ...selectedFiles]);
      
      selectedFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviews((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || files.length === 0) return;

    setUploading(true);
    try {
      // Upload all images
      const uploadedUrls: string[] = [];
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (data.url) {
          uploadedUrls.push(data.url);
        }
      }

      // Create artwork
      await fetch('/api/artworks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          thumbnailUrl: uploadedUrls[0],
          imageUrls: uploadedUrls,
          category,
          subcategory,
        }),
      });

      // Reset form
      setTitle('');
      setDescription('');
      setFiles([]);
      setPreviews([]);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Failed to upload artwork:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">제목</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="작품 제목"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">설명</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="작품 설명"
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label>이미지</Label>
        <div className="grid grid-cols-3 gap-2">
          {previews.map((preview, index) => (
            <Card key={index} className="relative overflow-hidden">
              <CardContent className="p-0 aspect-square relative">
                <Image
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  fill
                  className="object-cover"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-1 right-1 h-6 w-6"
                  onClick={() => removeFile(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </CardContent>
            </Card>
          ))}
          <Card
            className="cursor-pointer border-dashed hover:border-primary/50 hover:bg-accent/50 transition-all"
            onClick={() => fileInputRef.current?.click()}
          >
            <CardContent className="flex flex-col items-center justify-center aspect-square p-2">
              <Upload className="h-6 w-6 text-muted-foreground" />
              <span className="mt-1 text-xs text-muted-foreground text-center">
                이미지 추가
              </span>
            </CardContent>
          </Card>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
        <p className="text-xs text-muted-foreground">
          여러 이미지를 업로드할 수 있습니다. 첫 번째 이미지가 썸네일로 사용됩니다.
        </p>
      </div>

      <Button type="submit" className="w-full" disabled={uploading || !title || files.length === 0}>
        {uploading ? <><Spinner className="mr-2 h-4 w-4" />업로드 중...</> : '작품 등록'}
      </Button>
    </form>
  );
}
