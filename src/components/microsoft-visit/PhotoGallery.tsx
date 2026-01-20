import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, ChevronLeft, ChevronRight, Camera } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface GalleryImage {
  src: string;
  alt: string;
  caption: string;
}

// Placeholder images - replace with actual photos from the visit
const galleryImages: GalleryImage[] = [
  {
    src: "/images/microsoft-visit-og.jpg",
    alt: "Microsoft Visit Welcome",
    caption: "Microsoft AI & Security Team arrives at Black Tech Street"
  },
  {
    src: "/images/tulsa-skyline-banner.png",
    alt: "Tulsa Skyline",
    caption: "Tulsa skyline - host city for the Microsoft visit"
  }
];

export default function PhotoGallery() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const openLightbox = (index: number) => setSelectedIndex(index);
  const closeLightbox = () => setSelectedIndex(null);
  
  const goToPrevious = () => {
    if (selectedIndex !== null) {
      setSelectedIndex(selectedIndex === 0 ? galleryImages.length - 1 : selectedIndex - 1);
    }
  };
  
  const goToNext = () => {
    if (selectedIndex !== null) {
      setSelectedIndex(selectedIndex === galleryImages.length - 1 ? 0 : selectedIndex + 1);
    }
  };

  return (
    <motion.section 
      className="mb-16"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7 }}
    >
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <Camera className="h-6 w-6 text-emerald-600" />
        Photo Gallery
      </h2>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {galleryImages.map((image, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            className="cursor-pointer"
            onClick={() => openLightbox(index)}
          >
            <Card className="overflow-hidden bg-white/80 backdrop-blur-sm border-gray-200 hover:shadow-lg transition-all duration-300 hover:border-emerald-300">
              <div className="aspect-square relative overflow-hidden">
                <img 
                  src={image.src} 
                  alt={image.alt}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end">
                  <p className="p-3 text-white text-sm font-medium">{image.caption}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {galleryImages.length === 2 && (
        <p className="text-center text-gray-500 mt-4 text-sm italic">
          More photos coming soon!
        </p>
      )}

      {/* Lightbox Dialog */}
      <Dialog open={selectedIndex !== null} onOpenChange={() => closeLightbox()}>
        <DialogContent className="max-w-5xl w-full p-0 bg-black/95 border-none">
          <AnimatePresence mode="wait">
            {selectedIndex !== null && (
              <motion.div
                key={selectedIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="relative"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 right-4 z-50 text-white hover:bg-white/20"
                  onClick={closeLightbox}
                >
                  <X className="h-6 w-6" />
                </Button>

                <div className="flex items-center justify-center min-h-[60vh] p-8">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-4 text-white hover:bg-white/20"
                    onClick={goToPrevious}
                  >
                    <ChevronLeft className="h-8 w-8" />
                  </Button>

                  <img
                    src={galleryImages[selectedIndex].src}
                    alt={galleryImages[selectedIndex].alt}
                    className="max-w-full max-h-[70vh] object-contain rounded-lg"
                  />

                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 text-white hover:bg-white/20"
                    onClick={goToNext}
                  >
                    <ChevronRight className="h-8 w-8" />
                  </Button>
                </div>

                <div className="text-center pb-6">
                  <p className="text-white text-lg font-medium">
                    {galleryImages[selectedIndex].caption}
                  </p>
                  <p className="text-gray-400 text-sm mt-1">
                    {selectedIndex + 1} of {galleryImages.length}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </motion.section>
  );
}
