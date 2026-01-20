import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn, Download } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

// Event categories for filtering
export const galleryEvents = [
  { id: 'all', label: 'All Photos' },
  { id: 'aspire-dec-2025', label: 'ASPIRE Dec 2025' },
  { id: 'nvidia-sep-2025', label: 'NVIDIA Sep 2025' },
  { id: 'aspire-sep-2025', label: 'ASPIRE Sep 2025' },
  { id: 'aspire-june-2025', label: 'ASPIRE June 2025' },
  { id: 'microsoft-visit', label: 'Microsoft Visit' },
] as const;

export type GalleryEventId = typeof galleryEvents[number]['id'] | 'aspire-dec-2025';

// Featured hero image
const featuredImage = {
  id: 0,
  src: '/images/gallery/microsoft-bts-retreat-mockup.png',
  alt: 'Microsoft & Black Tech Street Retreat Center Mockup',
  eventId: 'microsoft-visit' as const,
};

// Gallery images organized by event
const galleryImages = [
  // ASPIRE AI Workshop - December 6, 2025
  { id: 401, src: '/images/gallery/aspire-dec6-01.jpg', alt: 'Tyrance Billingsley Presenting at Langston University', eventId: 'aspire-dec-2025' },
  { id: 402, src: '/images/gallery/aspire-dec6-02.jpg', alt: 'Workshop Participants Learning', eventId: 'aspire-dec-2025' },
  { id: 403, src: '/images/gallery/aspire-dec6-03.jpg', alt: 'Lovable Design Prompt Review', eventId: 'aspire-dec-2025' },
  { id: 404, src: '/images/gallery/aspire-dec6-04.jpg', alt: 'ASPIRE Certificate Recipients', eventId: 'aspire-dec-2025' },
  { id: 405, src: '/images/gallery/aspire-dec6-05.jpg', alt: 'ASPIRE GenAI Fluency Lab Group Photo', eventId: 'aspire-dec-2025' },
  // NVIDIA Partnership Announcement - September 3, 2025
  { id: 201, src: '/images/gallery/nvidia-sept3-01.jpg', alt: 'NVIDIA Partnership Announcement', eventId: 'nvidia-sep-2025' },
  { id: 202, src: '/images/gallery/nvidia-sept3-02.jpg', alt: 'Community Leaders at NVIDIA Event', eventId: 'nvidia-sep-2025' },
  { id: 203, src: '/images/gallery/nvidia-sept3-03.jpg', alt: 'Partnership Team Photo', eventId: 'nvidia-sep-2025' },
  { id: 204, src: '/images/gallery/nvidia-sept3-04.jpg', alt: 'NVIDIA Event Attendees at Greenwood', eventId: 'nvidia-sep-2025' },
  // ASPIRE AI Workshop - September 27, 2025
  { id: 101, src: '/images/gallery/aspire-927-01.jpg', alt: 'ASPIRE GenAI Fluency Lab Presentation', eventId: 'aspire-sep-2025' },
  { id: 102, src: '/images/gallery/aspire-927-02.jpg', alt: 'Workshop Group Discussion', eventId: 'aspire-sep-2025' },
  { id: 103, src: '/images/gallery/aspire-927-03.jpg', alt: 'Workshop Attendee', eventId: 'aspire-sep-2025' },
  { id: 104, src: '/images/gallery/aspire-927-04.jpg', alt: 'Hands-on Learning Session', eventId: 'aspire-sep-2025' },
  { id: 105, src: '/images/gallery/aspire-927-05.jpg', alt: 'Collaborative Discussion', eventId: 'aspire-sep-2025' },
  { id: 106, src: '/images/gallery/aspire-927-06.jpg', alt: 'Peer Learning', eventId: 'aspire-sep-2025' },
  { id: 107, src: '/images/gallery/aspire-927-07.jpg', alt: 'Participant Q&A', eventId: 'aspire-sep-2025' },
  { id: 108, src: '/images/gallery/aspire-927-08.jpg', alt: 'Taking Notes', eventId: 'aspire-sep-2025' },
  { id: 109, src: '/images/gallery/aspire-927-09.jpg', alt: 'AI Learning Exercise', eventId: 'aspire-sep-2025' },
  // ASPIRE AI Workshop - June 2025
  { id: 301, src: '/images/gallery/aspire-june-01.jpg', alt: 'Coach White with Post-It Notes', eventId: 'aspire-june-2025' },
  { id: 302, src: '/images/gallery/aspire-june-02.jpg', alt: 'G-ACE Presentation', eventId: 'aspire-june-2025' },
  { id: 303, src: '/images/gallery/aspire-june-03.jpg', alt: 'The Pocket Guide Presentation', eventId: 'aspire-june-2025' },
  { id: 304, src: '/images/gallery/aspire-june-04.jpg', alt: 'Workshop Participant Smiling', eventId: 'aspire-june-2025' },
  { id: 305, src: '/images/gallery/aspire-june-05.jpg', alt: 'Participant Asking Question', eventId: 'aspire-june-2025' },
  { id: 306, src: '/images/gallery/aspire-june-06.jpg', alt: 'Facilitator Leading Discussion', eventId: 'aspire-june-2025' },
  { id: 307, src: '/images/gallery/aspire-june-07.jpg', alt: 'Full Auditorium View', eventId: 'aspire-june-2025' },
  { id: 308, src: '/images/gallery/aspire-june-08.jpg', alt: 'Participants with Laptops', eventId: 'aspire-june-2025' },
  // Microsoft Visit Photos
  { id: 1, src: '/images/gallery/01-chamber-group.png', alt: 'Chamber Group Meeting', eventId: 'microsoft-visit' },
  { id: 2, src: '/images/gallery/02-memorial-group.png', alt: 'Memorial Group Photo', eventId: 'microsoft-visit' },
  { id: 3, src: '/images/gallery/03-memorial-wide.png', alt: 'Memorial Wide Shot', eventId: 'microsoft-visit' },
  { id: 4, src: '/images/gallery/04-greenwood-walk.png', alt: 'Greenwood Walking Tour', eventId: 'microsoft-visit' },
  { id: 5, src: '/images/gallery/05-bodega.png', alt: 'Bodega Visit', eventId: 'microsoft-visit' },
  { id: 6, src: '/images/gallery/06-underpass-tour.png', alt: 'Underpass Tour', eventId: 'microsoft-visit' },
  { id: 7, src: '/images/gallery/07-chamber-stairs.png', alt: 'Chamber Stairs', eventId: 'microsoft-visit' },
  { id: 8, src: '/images/gallery/08-moton-building.png', alt: 'Moton Building', eventId: 'microsoft-visit' },
  { id: 9, src: '/images/gallery/09-moton-group.png', alt: 'Moton Group Photo', eventId: 'microsoft-visit' },
  { id: 10, src: '/images/gallery/10-black-wall-street-mural.png', alt: 'Black Wall Street Mural', eventId: 'microsoft-visit' },
  { id: 11, src: '/images/gallery/11-chamber-meeting.png', alt: 'Chamber Meeting', eventId: 'microsoft-visit' },
  { id: 12, src: '/images/gallery/12-roundtable-discussion.jpg', alt: 'Roundtable Discussion', eventId: 'microsoft-visit' },
  { id: 13, src: '/images/gallery/13-downtown-walk.jpg', alt: 'Downtown Walk', eventId: 'microsoft-visit' },
  { id: 14, src: '/images/gallery/14-lobby-tour.jpg', alt: 'Lobby Tour', eventId: 'microsoft-visit' },
];

interface TimelineGalleryProps {
  initialEventFilter?: GalleryEventId;
}

export function TimelineGallery({ initialEventFilter }: TimelineGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<typeof galleryImages[0] | null>(null);
  const [activeEvent, setActiveEvent] = useState<GalleryEventId>(initialEventFilter || 'all');

  // Listen for custom event from timeline cards
  useEffect(() => {
    const handleSetFilter = (e: CustomEvent<GalleryEventId>) => {
      setActiveEvent(e.detail);
    };
    
    window.addEventListener('setGalleryFilter', handleSetFilter as EventListener);
    return () => window.removeEventListener('setGalleryFilter', handleSetFilter as EventListener);
  }, []);

  const filteredImages = activeEvent === 'all' 
    ? galleryImages 
    : galleryImages.filter(img => img.eventId === activeEvent);

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
    <section id="photo-gallery" className="py-16">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-10"
      >
        <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-3">
          Photo Gallery
        </h2>

        {/* Event filter tabs */}
        <div className="flex flex-wrap justify-center gap-2">
          {galleryEvents.map((event) => (
            <button
              key={event.id}
              onClick={() => setActiveEvent(event.id)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                activeEvent === event.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {event.label}
              <span className="ml-1.5 text-xs opacity-70">
                ({event.id === 'all' 
                  ? galleryImages.length + 1
                  : event.id === 'microsoft-visit' 
                    ? galleryImages.filter(img => img.eventId === event.id).length + 1
                    : galleryImages.filter(img => img.eventId === event.id).length})
              </span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Featured Hero Image - shown for 'all' or 'microsoft-visit' */}
      {(activeEvent === 'all' || activeEvent === 'microsoft-visit') && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-6 cursor-pointer group"
          onClick={() => setSelectedImage(featuredImage)}
        >
          <div className="relative overflow-hidden rounded-2xl border-2 border-primary/30 shadow-2xl shadow-primary/10">
            <img
              src={featuredImage.src}
              alt={featuredImage.alt}
              className="w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="text-sm text-white font-medium">
                {featuredImage.alt}
              </span>
              <ZoomIn className="h-5 w-5 text-white/80" />
            </div>
          </div>
        </motion.div>
      )}

      {/* Masonry grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeEvent}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="columns-2 md:columns-3 lg:columns-4 gap-3 space-y-3"
        >
          {filteredImages.map((image, index) => (
            <motion.div
              key={image.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.03 }}
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
        </motion.div>
      </AnimatePresence>

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
