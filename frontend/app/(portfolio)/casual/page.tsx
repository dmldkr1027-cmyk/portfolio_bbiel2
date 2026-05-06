'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { MasonryGallery } from '@/components/masonry-gallery';
import { ArtworkUploadForm } from '@/components/artwork-upload-form';
import { AdminModal } from '@/components/admin-modal';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Empty, EmptyContent, EmptyTitle, EmptyDescription, EmptyMedia } from '@/components/ui/empty';
import { Plus, ImageIcon } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function CasualWorkPage() {
  const { data, mutate, isLoading } = useSWR('/api/artworks?category=casual', fetcher);
  const [showUploadForm, setShowUploadForm] = useState(false);

  const handleDelete = async (id: string) => {
    await fetch(`/api/artworks/${id}`, { method: 'DELETE' });
    mutate();
  };

  const handleReorder = async (id: string, direction: 'up' | 'down' | 'first' | 'last') => {
    await fetch(`/api/artworks/${id}/reorder`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ direction }),
    });
    mutate();
  };

  const skeletonHeights = [180, 220, 160, 240, 200, 190];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
          {skeletonHeights.map((height, i) => (
            <Skeleton key={i} className="w-full break-inside-avoid" style={{ height: `${height}px` }} />
          ))}
        </div>
      </div>
    );
  }

  const artworks = data?.artworks || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl md:text-2xl font-light text-foreground">평소작</h1>
        <AdminModal
          onAuthenticated={() => setShowUploadForm(true)}
          trigger={
            <Button variant="outline" size="sm">
              <Plus className="mr-2 h-4 w-4" />
              새 작품 추가
            </Button>
          }
        >
          <ArtworkUploadForm
            category="casual"
            onSuccess={() => {
              setShowUploadForm(false);
              mutate();
            }}
          />
        </AdminModal>
      </div>

      {artworks.length > 0 ? (
        <MasonryGallery
          artworks={artworks}
          onDelete={handleDelete}
          onReorder={handleReorder}
          showAdmin={true}
          itemsPerPage={12}
        />
      ) : (
        <Empty>
          <EmptyContent>
            <EmptyMedia variant="icon">
              <ImageIcon />
            </EmptyMedia>
            <EmptyTitle>등록된 작품이 없습니다</EmptyTitle>
            <EmptyDescription>새 작품을 추가하여 갤러리를 채워보세요.</EmptyDescription>
          </EmptyContent>
        </Empty>
      )}
    </div>
  );
}
