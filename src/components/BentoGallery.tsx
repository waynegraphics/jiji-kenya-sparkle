import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface BentoGalleryProps {
  images: string[];
  title: string;
  isFeatured?: boolean;
  isUrgent?: boolean;
}

const BentoGallery = ({ images, title, isFeatured, isUrgent }: BentoGalleryProps) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const displayImages = images.length > 0 ? images : ["/placeholder.svg"];

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const nextImage = () => setLightboxIndex((i) => (i + 1) % displayImages.length);
  const prevImage = () => setLightboxIndex((i) => (i - 1 + displayImages.length) % displayImages.length);

  // Airbnb-style bento: 1 large left + up to 4 small right
  return (
    <>
      <div className="relative rounded-xl overflow-hidden">
        {/* Badges */}
        <div className="absolute top-3 left-3 z-10 flex gap-2">
          {isFeatured && <Badge className="bg-primary text-primary-foreground">FEATURED</Badge>}
          {isUrgent && <Badge className="bg-secondary text-secondary-foreground">URGENT</Badge>}
        </div>

        {displayImages.length === 1 ? (
          <button onClick={() => openLightbox(0)} className="w-full">
            <img
              src={displayImages[0]}
              alt={title}
              className="w-full h-[260px] md:h-[320px] lg:h-[480px] object-cover"
            />
          </button>
        ) : (
          <div className="grid grid-cols-4 grid-rows-2 gap-1.5 h-[260px] md:h-[320px] lg:h-[480px]">
            {/* Main large image */}
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

            {/* Smaller images */}
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
                {/* Show all photos overlay on last visible image */}
                {idx === 3 && displayImages.length > 5 && (
                  <div className="absolute inset-0 bg-foreground/50 flex items-center justify-center">
                    <span className="text-card font-semibold text-sm">
                      +{displayImages.length - 5} more
                    </span>
                  </div>
                )}
              </button>
            ))}

            {/* Fill empty slots if less than 5 images */}
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
            className="absolute bottom-3 right-3 bg-card/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-card transition-colors"
          >
            Show all {displayImages.length} photos
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
