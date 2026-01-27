
# Timeline Page Export Package

This plan outlines everything you need to copy to create a standalone timeline website. Since I'm in planning mode, I'll provide you with the complete file structure and instructions. Once you approve this plan, I can create a consolidated export document with all the code.

---

## Export Package Overview

### Files to Copy (16 Total + Assets)

| Category | Files | Size Est. |
|----------|-------|-----------|
| **Page Entry** | `Timeline.tsx` | 209 lines |
| **Timeline Components** | 11 files | ~1,800 lines |
| **UI Components** | 3 files | ~150 lines |
| **Data** | `timeline.ts` | 236 lines |
| **Utilities** | `utils.ts` | 6 lines |
| **Styling** | `index.css`, `tailwind.config.ts` | 650 lines |
| **Images** | 58 gallery + 4 team + 4 misc | ~60 files |

---

## Complete File List

### 1. Page Component
```text
src/pages/Timeline.tsx
```

### 2. Timeline Components (src/components/timeline/)
```text
├── BackToTopButton.tsx
├── ImpactSnapshot.tsx
├── InTheNewsSection.tsx
├── TableOfContents.tsx
├── TeamSection.tsx
├── TechBackground.tsx
├── TestimonialsSection.tsx
├── TimelineAboutSection.tsx
├── TimelineCard.tsx
├── TimelineGallery.tsx
├── TimelineHero.tsx
└── TimelineProgress.tsx
```

### 3. UI Components (src/components/ui/)
```text
├── count-up.tsx
└── dialog.tsx
```

### 4. Data & Utilities
```text
src/data/timeline.ts
src/lib/utils.ts
```

### 5. Styling & Config
```text
src/index.css
tailwind.config.ts
```

### 6. Assets

**Team Photos (public/images/team/)**
```text
├── tyrance-billingsley.png
├── josephine-nelms.png
├── allen-collins.png
└── smiley-elmore.png
```

**Gallery Photos (public/images/gallery/) - 54 files**
```text
├── 01-chamber-group.png through 14-lobby-tour.jpg
├── ai-executive-order-oct2023.png
├── aspire-927-01.jpg through aspire-927-09.jpg
├── aspire-dec6-01.jpg through aspire-dec6-05.jpg
├── aspire-june-01.jpg through aspire-june-08.jpg
├── aspire-lead-01.jpg, aspire-lead-02.jpg
├── defcon-seed-ai-aug2023.png
├── democratic-caucus-interview-dec2023.png
├── hack-the-future-feb2024.png
├── microsoft-announce-01.png through microsoft-announce-03.png
├── microsoft-bts-retreat-mockup.png
├── nvidia-sept3-01.jpg through nvidia-sept3-04.jpg
├── senate-help-testimony-cspan.png
└── white-house-cyber-01.png through white-house-cyber-04.png
```

**Logo (src/assets/logos/)**
```text
└── bts-b-logo.png
```

**Misc Images (public/images/)**
```text
├── bts-logo-white.png
└── tulsa-skyline-banner.png
```

---

## Required Dependencies

Add to your new project's `package.json`:

```json
{
  "dependencies": {
    "framer-motion": "^12.26.2",
    "lucide-react": "^0.462.0",
    "@radix-ui/react-dialog": "^1.1.14",
    "next-themes": "^0.3.0",
    "react-router-dom": "^6.30.1",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.6.0",
    "tailwindcss-animate": "^1.0.7"
  }
}
```

---

## Implementation Options

When I switch to implementation mode, I can:

### Option A: Create Consolidated Code File
Create a single markdown file with all code organized by section that you can copy-paste from.

### Option B: Create Copy-Ready Files
Generate each file individually with clear instructions for where to place them.

### Option C: Create a Setup Script
Generate a shell script that creates the folder structure and placeholder files.

---

## Key Modifications for Standalone Use

### 1. Remove React Router Dependency (Optional)
If building a single-page site, modify `Timeline.tsx`:
```tsx
// Remove this import
import { useLocation } from 'react-router-dom';

// Remove location-based hash navigation
```

### 2. Update SEO Meta Tags
Modify the `useEffect` in `Timeline.tsx` to use your new domain:
```tsx
updateOrCreateMeta('og:url', 'https://yourdomain.com');
updateOrCreateMeta('og:image', 'https://yourdomain.com/images/bts-logo-white.png');
```

### 3. Optional: Enable Light Mode
Remove the forced dark mode in `Timeline.tsx`:
```tsx
// Remove this useEffect
useEffect(() => {
  setTheme('dark');
}, []);
```

---

## Technical Notes

- **Animations**: All motion effects use `framer-motion` with viewport-triggered animations
- **Theme System**: Uses `next-themes` with CSS custom properties in `index.css`
- **Gallery Lightbox**: Uses Radix UI Dialog component
- **Matrix Background**: Custom CSS animation (`animate-matrix-fall`) defined in `index.css`
- **Count Up Animation**: Uses `requestAnimationFrame` for smooth number animations
- **Image Loading**: Lazy loading with `loading="lazy"` and `decoding="async"` attributes

---

## Next Steps

1. **Approve this plan** to switch me to implementation mode
2. I'll generate a **consolidated code document** with all files
3. You can copy the code to your new Lovable project
4. Download images separately from this project's preview URL

