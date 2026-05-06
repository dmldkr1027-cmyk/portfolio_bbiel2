'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ImageModal } from '@/components/image-modal';
import { AdminModal } from '@/components/admin-modal';
import { Trash2, Plus, ImageIcon } from 'lucide-react';
import type { Artwork } from '@/lib/types';

interface ArtworkGridProps {
  artworks: Artwork[];
  onDelete?: (id: string) => void;
  onAdd?: () => void;
  showAdmin?: boolean;
}

export function ArtworkGrid({ artworks, onDelete, onAdd, showAdmin = true }: ArtworkGridProps) {
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleThumbnailClick = (artwork: Artwork) => {
    setSelectedArtwork(artwork);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    if (onDelete) {
      await onDelete(id);
    }
    setDeletingId(null);
  };

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {showAdmin && onAdd && (
          <AdminModal
            onAuthenticated={onAdd}
            trigger={
              <Card className="group cursor-pointer border-dashed hover:border-primary/50 hover:bg-accent/50 transition-all">
                <CardContent className="flex flex-col items-center justify-center aspect-square p-4">
                  <Plus className="h-8 w-8 text-muted-foreground group-hover:text-primary" />
                  <span className="mt-2 text-sm text-muted-foreground group-hover:text-primary">
                    새 작품 추가
                  </span>
                </CardContent>
              </Card>
            }
          >
            <div />
          </AdminModal>
        )}
        {artworks.map((artwork) => (
          <Card
            key={artwork.id}
            className="group overflow-hidden cursor-pointer hover:shadow-md transition-all"
          >
            <CardContent className="p-0 relative">
              <div
                className="aspect-square relative bg-muted"
                onClick={() => handleThumbnailClick(artwork)}
              >
                {artwork.thumbnailUrl ? (
                  <Image
                    src={artwork.thumbnailUrl}
                    alt={artwork.title}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <ImageIcon className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="p-3">
                <h3 className="text-sm font-medium truncate">{artwork.title}</h3>
              </div>
              {showAdmin && onDelete && (
                <AdminModal
                  onAuthenticated={() => handleDelete(artwork.id)}
                  trigger={
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  }
                >
                  <div className="space-y-4">
                    <p>이 작품을 삭제하시겠습니까?</p>
                    <p className="font-medium">{artwork.title}</p>
                    <Button
                      variant="destructive"
                      className="w-full"
                      onClick={() => handleDelete(artwork.id)}
                      disabled={deletingId === artwork.id}
                    >
                      {deletingId === artwork.id ? '삭제 중...' : '삭제'}
                    </Button>
                  </div>
                </AdminModal>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <ImageModal
        artwork={selectedArtwork}
        open={modalOpen}
        onOpenChange={setModalOpen}
        artworks={artworks}
        onArtworkChange={setSelectedArtwork}
      />
    </>
  );
}
