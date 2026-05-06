'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Artwork } from '@/lib/types';

interface ImageModalProps {
  artwork: Artwork | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImageModal({ 
  artwork, 
  open, 
  onOpenChange,
  artworks = [],
  onArtworkChange
}: ImageModalProps & { 
  artworks?: Artwork[],
  onArtworkChange?: (artwork: Artwork) => void
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageLoading, setImageLoading] = useState(true);

  useEffect(() => {
    if (open) {
      setCurrentIndex(0);
      setImageLoading(true);
    }
  }, [open, artwork]);

  if (!artwork) return null;

  const getImageSrc = (url: string | null) => {
    if (!url) return '';
    if (url.includes('blob.vercel-storage.com')) {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname.slice(1);
      return `/api/file?pathname=${encodeURIComponent(pathname)}`;
    }
    return url;
  };

  const images = artwork?.imageUrls?.length > 0 
    ? artwork.imageUrls.filter(url => url) 
    : artwork?.thumbnailUrl ? [artwork.thumbnailUrl] : [];

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImageLoading(true);
    if (images.length > 1) {
      setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
    } else if (onArtworkChange && artworks.length > 0) {
      const idx = artworks.findIndex(a => a.id === artwork?.id);
      if (idx !== -1) {
        onArtworkChange(artworks[idx > 0 ? idx - 1 : artworks.length - 1]);
      }
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImageLoading(true);
    if (images.length > 1) {
      setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    } else if (onArtworkChange && artworks.length > 0) {
      const idx = artworks.findIndex(a => a.id === artwork?.id);
      if (idx !== -1) {
        onArtworkChange(artworks[idx < artworks.length - 1 ? idx + 1 : 0]);
      }
    }
  };

  const currentImageSrc = images[currentIndex] ? getImageSrc(images[currentIndex]) : '';

  const hasMultiple = images.length > 1 || (artworks && artworks.length > 1);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[1500px] w-[95vw] max-h-[90vh] overflow-visible p-0 bg-transparent border-none shadow-none flex justify-center items-center">
        <DialogHeader className="sr-only">
          <DialogTitle>{artwork?.title || '작품 정보'}</DialogTitle>
          <DialogDescription>
            {artwork?.description || artwork?.title || '작품 정보'}
          </DialogDescription>
        </DialogHeader>
        <div className="relative w-full h-full max-h-[90vh] flex items-center justify-center">
          {imageLoading && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <Spinner className="h-12 w-12 text-white" />
            </div>
          )}
          {currentImageSrc && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={currentImageSrc}
              alt={artwork?.title || ''}
              className="max-w-[1500px] w-auto max-h-[90vh] object-contain block mx-auto rounded-md"
              onLoad={() => setImageLoading(false)}
              onError={() => setImageLoading(false)}
            />
          )}

          {hasMultiple && (
            <div className="absolute -bottom-14 left-1/2 -translate-x-1/2 flex items-center justify-center gap-6 z-50">
              <Button
                variant="ghost"
                size="icon"
                className="bg-black/40 hover:bg-black/60 text-white border-transparent w-10 h-10 rounded-full"
                onClick={handlePrev}
              >
                <ChevronLeft className="h-8 w-8" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="bg-black/40 hover:bg-black/60 text-white border-transparent w-10 h-10 rounded-full"
                onClick={handleNext}
              >
                <ChevronRight className="h-8 w-8" />
              </Button>
            </div>
          )}

          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-50">
              {images.map((_, idx) => (
                <button
                      key={idx}
                      className={`h-2.5 w-2.5 rounded-full transition-colors shadow-sm ${
                        idx === currentIndex ? 'bg-white' : 'bg-white/40 hover:bg-white/60'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setImageLoading(true);
                        setCurrentIndex(idx);
                      }}
                    />
                  ))}
                </div>
              )}
              {artwork?.title && (
                <div className="absolute -bottom-14 left-0 z-50 flex items-center h-10">
                  <span className="text-white/80 text-sm font-medium">{artwork.title}</span>
                </div>
              )}
        </div>
        <div className="p-6 pt-4">
          <p className="text-muted-foreground whitespace-pre-wrap">{artwork.description}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
