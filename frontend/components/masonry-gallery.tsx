'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { AdminModal } from '@/components/admin-modal';
import { ImageModal } from '@/components/image-modal';
import { Spinner } from '@/components/ui/spinner';
import { Trash2, ChevronLeft, ChevronRight, ArrowUp, ArrowDown, ChevronsUp, ChevronsDown } from 'lucide-react';
import type { Artwork } from '@/lib/types';

interface MasonryGalleryProps {
  artworks: Artwork[];
  onDelete?: (id: string) => void;
  onReorder?: (id: string, direction: 'up' | 'down' | 'first' | 'last') => void;
  showAdmin?: boolean;
  itemsPerPage?: number;
}

interface ImageDimensions {
  [key: string]: { width: number; height: number };
}

interface ImageLoadingState {
  [key: string]: boolean;
}

export function MasonryGallery({ 
  artworks, 
  onDelete, 
  onReorder,
  showAdmin = true,
  itemsPerPage = 12 
}: MasonryGalleryProps) {
  const [dimensions, setDimensions] = useState<ImageDimensions>({});
  const [loadingStates, setLoadingStates] = useState<ImageLoadingState>({});
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(artworks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedArtworks = artworks.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    paginatedArtworks.forEach((artwork) => {
      if (!dimensions[artwork.id] && artwork.thumbnailUrl) {
        const img = new window.Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          setDimensions((prev) => ({
            ...prev,
            [artwork.id]: { width: img.width, height: img.height },
          }));
        };
        img.src = getImageSrc(artwork.thumbnailUrl);
      }
      if (loadingStates[artwork.id] === undefined) {
        setLoadingStates((prev) => ({ ...prev, [artwork.id]: true }));
      }
    });
  }, [paginatedArtworks, dimensions, loadingStates]);

  // Reset to first page when artworks change
  useEffect(() => {
    setCurrentPage(1);
  }, [artworks.length]);

  const getImageSrc = (url: string | null) => {
    if (!url) return '';
    if (url.includes('blob.vercel-storage.com')) {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname.slice(1);
      return `/api/file?pathname=${encodeURIComponent(pathname)}`;
    }
    return url;
  };

  const handleDelete = async (id: string) => {
    if (onDelete) {
      await onDelete(id);
    }
  };

  const handleReorder = async (id: string, direction: 'up' | 'down' | 'first' | 'last') => {
    if (onReorder) {
      await onReorder(id, direction);
    }
  };

  const handleImageLoad = (id: string) => {
    setLoadingStates((prev) => ({ ...prev, [id]: false }));
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
        {paginatedArtworks.map((artwork) => {
          const dim = dimensions[artwork.id];
          const originalRatio = dim ? dim.width / dim.height : 1;
          // 가로 이미지(1.2 이상)가 너무 작게 보이지 않도록 썸네일 표시 비율 상한선을 정하여 높이를 확보합니다.
          const displayRatio = originalRatio > 1.2 ? 1.2 : originalRatio;
          const isLoading = loadingStates[artwork.id];
          
          return (
            <div
              key={artwork.id}
              className="relative group cursor-pointer overflow-hidden rounded-lg"
              onClick={() => {
                setSelectedArtwork(artwork);
                setModalOpen(true);
              }}
            >
              <div
                className="relative w-full bg-muted"
                style={{
                  aspectRatio: displayRatio,
                }}
              >
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-muted z-10">
                    <Spinner className="h-6 w-6" />
                  </div>
                )}
                {artwork.thumbnailUrl && (
                  <Image
                    src={getImageSrc(artwork.thumbnailUrl)}
                    alt={artwork.title}
                    fill
                    className="object-cover"
                    onLoad={() => handleImageLoad(artwork.id)}
                    onError={() => handleImageLoad(artwork.id)}
                  />
                )}
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                  <h3 className="text-white font-medium text-sm truncate">
                    {artwork.title}
                  </h3>
                  {artwork.description && (
                    <p className="text-white/80 text-xs mt-1 line-clamp-2">
                      {artwork.description}
                    </p>
                  )}
                </div>
              </div>
              {showAdmin && (
                <div 
                  className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  onClick={(e) => e.stopPropagation()}
                >
                  {onReorder && (
                    <>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="h-8 w-8 bg-black/50 hover:bg-black/80 text-white border-transparent"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReorder(artwork.id, 'first');
                        }}
                      >
                        <ChevronsUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="h-8 w-8 bg-black/50 hover:bg-black/80 text-white border-transparent"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReorder(artwork.id, 'up');
                        }}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="h-8 w-8 bg-black/50 hover:bg-black/80 text-white border-transparent"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReorder(artwork.id, 'down');
                        }}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="h-8 w-8 bg-black/50 hover:bg-black/80 text-white border-transparent"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReorder(artwork.id, 'last');
                        }}
                      >
                        <ChevronsDown className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  {onDelete && (
                    <AdminModal
                      trigger={
                        <Button
                          variant="destructive"
                          size="icon"
                          className="h-8 w-8"
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
                          onClick={() => {
                            handleDelete(artwork.id);
                            setModalOpen(false);
                          }}
                        >
                          삭제
                        </Button>
                      </div>
                    </AdminModal>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? 'default' : 'outline'}
                size="icon"
                className="h-8 w-8"
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            ))}
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

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
