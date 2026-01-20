import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn, Download } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

// Gallery images organized by event
const galleryImages = [
  // ASPIRE AI Workshop - September 27, 2025
  { id: 101, src: '/images/gallery/aspire-927-01.jpg', alt: 'ASPIRE GenAI Fluency Lab Presentation', event: 'ASPIRE Sep 2025' },
  { id: 102, src: '/images/gallery/aspire-927-02.jpg', alt: 'Workshop Group Discussion', event: 'ASPIRE Sep 2025' },
  { id: 103, src: '/images/gallery/aspire-927-03.jpg', alt: 'Workshop Attendee', event: 'ASPIRE Sep 2025' },
  { id: 104, src: '/images/gallery/aspire-927-04.jpg', alt: 'Hands-on Learning Session', event: 'ASPIRE Sep 2025' },
  { id: 105, src: '/images/gallery/aspire-927-05.jpg', alt: 'Collaborative Discussion', event: 'ASPIRE Sep 2025' },
  { id: 106, src: '/images/gallery/aspire-927-06.jpg', alt: 'Peer Learning', event: 'ASPIRE Sep 2025' },
  { id: 107, src: '/images/gallery/aspire-927-07.jpg', alt: 'Participant Q&A', event: 'ASPIRE Sep 2025' },
  { id: 108, src: '/images/gallery/aspire-927-08.jpg', alt: 'Taking Notes', event: 'ASPIRE Sep 2025' },
  { id: 109, src: '/images/gallery/aspire-927-09.jpg', alt: 'AI Learning Exercise', event: 'ASPIRE Sep 2025' },
  // Microsoft Visit Photos
  { id: 1, src: '/images/gallery/01-chamber-group.png', alt: 'Chamber Group Meeting', event: 'Microsoft Visit' },
  { id: 2, src: '/images/gallery/02-memorial-group.png', alt: 'Memorial Group Photo', event: 'Microsoft Visit' },
  { id: 3, src: '/images/gallery/03-memorial-wide.png', alt: 'Memorial Wide Shot', event: 'Microsoft Visit' },
  { id: 4, src: '/images/gallery/04-greenwood-walk.png', alt: 'Greenwood Walking Tour', event: 'Microsoft Visit' },
  { id: 5, src: '/images/gallery/05-bodega.png', alt: 'Bodega Visit', event: 'Microsoft Visit' },
  { id: 6, src: '/images/gallery/06-underpass-tour.png', alt: 'Underpass Tour', event: 'Microsoft Visit' },
  { id: 7, src: '/images/gallery/07-chamber-stairs.png', alt: 'Chamber Stairs', event: 'Microsoft Visit' },
  { id: 8, src: '/images/gallery/08-moton-building.png', alt: 'Moton Building', event: 'Microsoft Visit' },
  { id: 9, src: '/images/gallery/09-moton-group.png', alt: 'Moton Group Photo', event: 'Microsoft Visit' },
  { id: 10, src: '/images/gallery/10-black-wall-street-mural.png', alt: 'Black Wall Street Mural', event: 'Microsoft Visit' },
  { id: 11, src: '/images/gallery/11-chamber-meeting.png', alt: 'Chamber Meeting', event: 'Microsoft Visit' },
  { id: 12, src: '/images/gallery/12-roundtable-discussion.jpg', alt: 'Roundtable Discussion', event: 'Microsoft Visit' },
  { id: 13, src: '/images/gallery/13-downtown-walk.jpg', alt: 'Downtown Walk', event: 'Microsoft Visit' },
  { id: 14, src: '/images/gallery/14-lobby-tour.jpg', alt: 'Lobby Tour', event: 'Microsoft Visit' },
];

export function TimelineGallery() {
  const [selectedImage, setSelectedImage] = useState<typeof galleryImages[0] | null>(null);

  const handleDownload = async (src: string, alt: string) => {
    try {
      const response = await fetch(src);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${alt.replace(/\s+/g, '-').toLowerCase()}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  return (
    <section className="py-16">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-10"
      >
        <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-3">
          Photo Gallery
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Moments captured from our journey building the future of Greenwood.
        </p>
      </motion.div>

      {/* Masonry grid */}
      <div className="columns-2 md:columns-3 lg:columns-4 gap-3 space-y-3">
        {galleryImages.map((image, index) => (
          <motion.div
            key={image.id}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05 }}
            className="break-inside-avoid group relative cursor-pointer"
            onClick={() => setSelectedImage(image)}
          >
            <div className="relative overflow-hidden rounded-xl border border-border/30">
              <img
                src={image.src}
                alt={image.alt}
                className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="text-xs text-white/90 font-medium truncate mr-2">
                  {image.alt}
                </span>
                <ZoomIn className="h-4 w-4 text-white/80 shrink-0" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Lightbox */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-[95vw] md:max-w-4xl h-[100dvh] md:h-auto md:max-h-[90vh] p-0 bg-black/95 border-border/30">
          <AnimatePresence mode="wait">
            {selectedImage && (
              <motion.div
                key={selectedImage.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative flex flex-col h-full"
              >
                {/* Close button */}
                <button
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 text-white/80 hover:text-white hover:bg-black/70 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>

                {/* Image */}
                <div className="flex-1 flex items-center justify-center p-4 md:p-8">
                  <img
                    src={selectedImage.src}
                    alt={selectedImage.alt}
                    className="max-w-full max-h-[70vh] object-contain rounded-lg"
                  />
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-4 md:px-8 pb-4 md:pb-6">
                  <span className="text-sm text-white/70">{selectedImage.alt}</span>
                  <button
                    onClick={() => handleDownload(selectedImage.src, selectedImage.alt)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition-colors text-sm"
                  >
                    <Download className="h-4 w-4" />
                    <span className="hidden sm:inline">Download</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </section>
  );
}
