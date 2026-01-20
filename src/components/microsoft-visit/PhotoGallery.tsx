import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X, ChevronLeft, ChevronRight, Camera, Download, ZoomIn } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface GalleryImage {
  src: string;
  alt: string;
}

const galleryImages: GalleryImage[] = [
  { src: "/images/gallery/01-chamber-group.png", alt: "Chamber Meeting Group Photo" },
  { src: "/images/gallery/02-memorial-group.png", alt: "1921 Race Massacre Memorial" },
  { src: "/images/gallery/03-memorial-wide.png", alt: "Memorial Wide Shot" },
  { src: "/images/gallery/04-greenwood-walk.png", alt: "Greenwood District Walk" },
  { src: "/images/gallery/05-bodega.png", alt: "Black Wall Street Bodega" },
  { src: "/images/gallery/06-underpass-tour.png", alt: "Greenwood Underpass Tour" },
  { src: "/images/gallery/07-chamber-stairs.png", alt: "Chamber Building Interior" },
  { src: "/images/gallery/08-moton-building.png", alt: "Moton Building Exterior" },
  { src: "/images/gallery/09-moton-group.png", alt: "Moton Building Group Photo" },
  { src: "/images/gallery/10-black-wall-street-mural.png", alt: "Black Wall Street Mural" },
  { src: "/images/gallery/11-chamber-meeting.png", alt: "Chamber Meeting Discussion" },
  { src: "/images/gallery/12-roundtable-discussion.jpg", alt: "Roundtable Discussion" },
  { src: "/images/gallery/13-downtown-walk.jpg", alt: "Downtown Tulsa Walk" },
  { src: "/images/gallery/14-lobby-tour.jpg", alt: "Building Lobby Tour" }
];

export default function PhotoGallery() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [imageLoaded, setImageLoaded] = useState<Record<number, boolean>>({});

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

  const handleDownload = useCallback(async (imageSrc: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      const response = await fetch(imageSrc);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = imageSrc.split('/').pop() || 'image';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  }, []);

  const handleImageLoad = (index: number) => {
    setImageLoaded(prev => ({ ...prev, [index]: true }));
  };

  // Masonry-style grid with varied sizes
  const getGridClass = (index: number) => {
    const pattern = index % 8;
    if (pattern === 0 || pattern === 5) return "col-span-2 row-span-2";
    if (pattern === 3) return "col-span-2";
    return "col-span-1";
  };

  return (
    <motion.section 
      className="mb-16"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7 }}
    >
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <motion.div
            initial={{ rotate: -10 }}
            animate={{ rotate: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Camera className="h-8 w-8 text-emerald-600" />
          </motion.div>
          <span className="bg-gradient-to-r from-gray-900 via-emerald-800 to-gray-900 bg-clip-text text-transparent">
            Photo Gallery
          </span>
        </h2>
        <motion.div 
          className="text-sm text-gray-500 font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {galleryImages.length} photos
        </motion.div>
      </div>
      
      {/* Masonry Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 auto-rows-[150px] md:auto-rows-[180px]">
        {galleryImages.map((image, index) => (
          <motion.div
            key={index}
            className={`relative overflow-hidden rounded-xl cursor-pointer group ${getGridClass(index)}`}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ 
              delay: index * 0.05, 
              duration: 0.5,
              type: "spring",
              stiffness: 100
            }}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            onClick={() => openLightbox(index)}
            whileHover={{ scale: 1.02, zIndex: 10 }}
          >
            {/* Loading skeleton */}
            {!imageLoaded[index] && (
              <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse" />
            )}
            
            {/* Image */}
            <motion.img 
              src={image.src} 
              alt={image.alt}
              onLoad={() => handleImageLoad(index)}
              className={`w-full h-full object-cover transition-all duration-700 ${
                imageLoaded[index] ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                filter: hoveredIndex !== null && hoveredIndex !== index ? 'brightness(0.7) saturate(0.8)' : 'brightness(1) saturate(1)'
              }}
            />
            
            {/* Gradient overlay */}
            <motion.div 
              className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"
              initial={{ opacity: 0 }}
              animate={{ opacity: hoveredIndex === index ? 1 : 0 }}
              transition={{ duration: 0.3 }}
            />
            
            {/* Hover content */}
            <AnimatePresence>
              {hoveredIndex === index && (
                <motion.div
                  className="absolute inset-0 flex flex-col items-center justify-center gap-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: 180 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="p-3 rounded-full bg-white/20 backdrop-blur-sm"
                  >
                    <ZoomIn className="h-6 w-6 text-white" />
                  </motion.div>
                  
                  <motion.button
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 20, opacity: 0 }}
                    transition={{ delay: 0.1 }}
                    onClick={(e) => handleDownload(image.src, e)}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm font-medium hover:bg-white/30 transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Corner shine effect */}
            <motion.div
              className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-white/30 to-transparent rounded-full blur-2xl pointer-events-none"
              animate={{
                opacity: hoveredIndex === index ? 0.8 : 0,
                scale: hoveredIndex === index ? 1.2 : 0.8
              }}
              transition={{ duration: 0.4 }}
            />
          </motion.div>
        ))}
      </div>

      {/* Lightbox Dialog */}
      <Dialog open={selectedIndex !== null} onOpenChange={() => closeLightbox()}>
        <DialogContent className="max-w-6xl w-[98vw] md:w-[95vw] h-[100dvh] md:h-auto md:max-h-[95vh] p-0 bg-black/98 border-none overflow-hidden">
          <AnimatePresence mode="wait">
            {selectedIndex !== null && (
              <motion.div
                key={selectedIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="relative flex flex-col h-full"
              >
                {/* Close button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 md:top-4 md:right-4 z-50 text-white hover:bg-white/20 rounded-full h-10 w-10 md:h-12 md:w-12"
                  onClick={closeLightbox}
                >
                  <X className="h-5 w-5 md:h-6 md:w-6" />
                </Button>

                {/* Image container */}
                <div className="flex-1 flex items-center justify-center min-h-0 p-2 md:p-8 relative">
                  {/* Previous button */}
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="absolute left-1 md:left-4 z-20"
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white hover:bg-white/20 rounded-full h-10 w-10 md:h-12 md:w-12 bg-black/30 md:bg-transparent"
                      onClick={goToPrevious}
                    >
                      <ChevronLeft className="h-6 w-6 md:h-8 md:w-8" />
                    </Button>
                  </motion.div>

                  {/* Main image with animation */}
                  <motion.img
                    key={galleryImages[selectedIndex].src}
                    src={galleryImages[selectedIndex].src}
                    alt={galleryImages[selectedIndex].alt}
                    className="max-w-[calc(100%-5rem)] md:max-w-full max-h-[60vh] md:max-h-[70vh] object-contain rounded-lg shadow-2xl"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                  />

                  {/* Next button */}
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="absolute right-1 md:right-4 z-20"
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white hover:bg-white/20 rounded-full h-10 w-10 md:h-12 md:w-12 bg-black/30 md:bg-transparent"
                      onClick={goToNext}
                    >
                      <ChevronRight className="h-6 w-6 md:h-8 md:w-8" />
                    </Button>
                  </motion.div>
                </div>

                {/* Bottom bar with counter and download */}
                <motion.div 
                  className="flex flex-col md:flex-row items-center justify-between gap-3 px-3 md:px-8 pb-4 md:pb-6 pt-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {/* Thumbnail strip - hidden on mobile, shown on tablet+ */}
                  <div className="hidden md:flex gap-2 overflow-x-auto max-w-[50%] py-2">
                    {galleryImages.map((img, idx) => (
                      <motion.button
                        key={idx}
                        onClick={() => setSelectedIndex(idx)}
                        className={`flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden transition-all duration-300 ${
                          idx === selectedIndex 
                            ? 'ring-2 ring-emerald-500 ring-offset-2 ring-offset-black' 
                            : 'opacity-50 hover:opacity-100'
                        }`}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <img src={img.src} alt="" className="w-full h-full object-cover" />
                      </motion.button>
                    ))}
                  </div>

                  {/* Counter and download - full width on mobile */}
                  <div className="flex items-center justify-between w-full md:w-auto gap-4">
                    <span className="text-gray-400 text-sm font-medium">
                      {selectedIndex + 1} / {galleryImages.length}
                    </span>
                    <motion.button
                      onClick={() => handleDownload(galleryImages[selectedIndex].src)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Download className="h-4 w-4" />
                      <span className="hidden sm:inline">Download</span>
                    </motion.button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </motion.section>
  );
}
