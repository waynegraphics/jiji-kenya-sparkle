import { useState, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, X, Camera } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";

interface BentoGalleryProps {
  images: string[];
  title: string;
  isFeatured?: boolean;
  isUrgent?: boolean;
}

const BentoGallery = ({ images, title, isFeatured, isUrgent }: BentoGalleryProps) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const isMobile = useIsMobile();
  const thumbnailRef = useRef<HTMLDivElement>(null);

  const displayImages = images.length > 0 ? images : ["/placeholder.svg"];

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const nextImage = () => setLightboxIndex((i) => (i + 1) % displayImages.length);
  const prevImage = () => setLightboxIndex((i) => (i - 1 + displayImages.length) % displayImages.length);

  const selectImage = (index: number) => {
    setActiveIndex(index);
  };

  return (
    <>
      <div className="relative rounded-xl overflow-hidden">
        {/* Badges */}
        <div className="absolute top-3 left-3 z-10 flex gap-2">
          {isFeatured && <Badge className="bg-primary text-primary-foreground">FEATURED</Badge>}
          {isUrgent && <Badge className="bg-secondary text-secondary-foreground">URGENT</Badge>}
        </div>

        {isMobile ? (
          /* ─── Mobile: Main image + thumbnail carousel ─── */
          <div className="space-y-2">
            {/* Main display image */}
            <button onClick={() => openLightbox(activeIndex)} className="w-full">
              <img
                src={displayImages[activeIndex]}
                alt={title}
                className="w-full h-[260px] object-cover rounded-xl"
              />
            </button>

            {/* Thumbnail carousel */}
            {displayImages.length > 1 && (
              <div
                ref={thumbnailRef}
                className="flex gap-2 overflow-x-auto pb-1 scrollbar-none"
              >
                {displayImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => selectImage(idx)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      idx === activeIndex
                        ? "border-primary ring-1 ring-primary"
                        : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${title} ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : displayImages.length === 1 ? (
          <button onClick={() => openLightbox(0)} className="w-full">
            <img
              src={displayImages[0]}
              alt={title}
              className="w-full h-[320px] lg:h-[480px] object-cover"
            />
          </button>
        ) : (
          /* ─── Desktop/Tablet: Bento grid ─── */
          <div className="grid grid-cols-4 grid-rows-2 gap-1.5 h-[320px] lg:h-[480px]">
            <button
              onClick={() => openLightbox(0)}
              className="col-span-2 row-span-2 overflow-hidden"
            >
              <img
                src={displayImages[0]}
                alt={title}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </button>

            {displayImages.slice(1, 5).map((img, idx) => (
              <button
                key={idx}
                onClick={() => openLightbox(idx + 1)}
                className="overflow-hidden relative"
              >
                <img
                  src={img}
                  alt={`${title} ${idx + 2}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
                {idx === 3 && displayImages.length > 5 && (
                  <div className="absolute inset-0 bg-foreground/50 flex items-center justify-center">
                    <span className="text-card font-semibold text-sm">
                      +{displayImages.length - 5} more
                    </span>
                  </div>
                )}
              </button>
            ))}

            {displayImages.length < 5 &&
              Array.from({ length: Math.min(4, 5 - displayImages.length) }).map((_, i) => (
                <div key={`empty-${i}`} className="bg-muted" />
              ))}
          </div>
        )}

        {/* Show all photos button */}
        {displayImages.length > 1 && (
          <button
            onClick={() => openLightbox(0)}
            className="absolute bottom-3 right-3 bg-card/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-card transition-colors flex items-center gap-1.5"
          >
            {isMobile ? (
              <>
                <Camera className="h-4 w-4" />
                <span>+{displayImages.length - 1}</span>
              </>
            ) : (
              `Show all ${displayImages.length} photos`
            )}
          </button>
        )}
      </div>

      {/* Lightbox */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-5xl p-0 bg-foreground/95 border-none">
          <div className="relative flex items-center justify-center min-h-[70vh]">
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-card/20 backdrop-blur-sm flex items-center justify-center hover:bg-card/40 text-card"
            >
              <X className="h-5 w-5" />
            </button>

            {displayImages.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 z-10 w-10 h-10 rounded-full bg-card/20 backdrop-blur-sm flex items-center justify-center hover:bg-card/40 text-card"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 z-10 w-10 h-10 rounded-full bg-card/20 backdrop-blur-sm flex items-center justify-center hover:bg-card/40 text-card"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}

            <img
              src={displayImages[lightboxIndex]}
              alt={`${title} ${lightboxIndex + 1}`}
              className="max-h-[85vh] max-w-full object-contain"
            />

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-card text-sm">
              {lightboxIndex + 1} / {displayImages.length}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BentoGallery;
