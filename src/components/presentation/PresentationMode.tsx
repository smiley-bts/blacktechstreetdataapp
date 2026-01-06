import { useState, useEffect, useCallback } from "react";
import { Contact } from "@/types/contact";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  X,
  Users,
  Calendar,
  TrendingUp,
  Brain,
  Target,
  Sparkles,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import btsLogo from "@/assets/black-tech-street-logo.png";

interface PresentationModeProps {
  contacts: Contact[];
  onExit: () => void;
}

interface Slide {
  title: string;
  value: number;
  suffix?: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
}

function CountUp({ end, duration = 2000, suffix = "" }: { end: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  return <span>{count.toLocaleString()}{suffix}</span>;
}

export function PresentationMode({ contacts, onExit }: PresentationModeProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [key, setKey] = useState(0);

  // Calculate stats
  const total = contacts.length;
  const withEmail = contacts.filter(c => c.email).length;
  const eventAttendees = contacts.filter(c => c.eventsAttended || c.sept27thReg).length;
  const withFeedback = contacts.filter(c => c.npsScore || c.ahaMoment).length;
  
  const npsResponses = contacts.filter(c => c.npsScore);
  const promoters = npsResponses.filter(c => parseInt(c.npsScore) >= 4).length;
  const detractors = npsResponses.filter(c => parseInt(c.npsScore) <= 2).length;
  const npsScore = npsResponses.length > 0 
    ? Math.round(((promoters - detractors) / npsResponses.length) * 100)
    : 0;

  const aiLevels = contacts.reduce((acc, c) => {
    if (c.aiExperienceLevel) acc++;
    return acc;
  }, 0);

  const slides: Slide[] = [
    {
      title: "Total Contacts in CRM",
      value: total,
      description: `${withEmail.toLocaleString()} with verified email addresses`,
      icon: <Users className="h-16 w-16" />,
      gradient: "from-blue-500 to-indigo-600",
    },
    {
      title: "Event Attendees",
      value: eventAttendees,
      description: `${Math.round((eventAttendees / total) * 100)}% engagement rate across all events`,
      icon: <Calendar className="h-16 w-16" />,
      gradient: "from-amber-500 to-orange-600",
    },
    {
      title: "Net Promoter Score",
      value: npsScore,
      suffix: npsScore > 0 ? "+" : "",
      description: `${npsResponses.length} responses • ${promoters} promoters, ${detractors} detractors`,
      icon: <TrendingUp className="h-16 w-16" />,
      gradient: npsScore >= 50 ? "from-emerald-500 to-green-600" : "from-amber-500 to-orange-600",
    },
    {
      title: "Feedback Submissions",
      value: withFeedback,
      description: "Participants who shared their experience and insights",
      icon: <Brain className="h-16 w-16" />,
      gradient: "from-purple-500 to-violet-600",
    },
    {
      title: "AI Experience Tracked",
      value: aiLevels,
      description: "Contacts with documented AI skill levels",
      icon: <Sparkles className="h-16 w-16" />,
      gradient: "from-pink-500 to-rose-600",
    },
  ];

  const nextSlide = useCallback(() => {
    setCurrentSlide(prev => {
      const next = (prev + 1) % slides.length;
      setKey(k => k + 1);
      return next;
    });
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide(prev => {
      const next = (prev - 1 + slides.length) % slides.length;
      setKey(k => k + 1);
      return next;
    });
  }, [slides.length]);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [isPlaying, nextSlide]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onExit();
      if (e.key === 'ArrowRight' || e.key === ' ') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
      if (e.key === 'p') setIsPlaying(p => !p);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide, onExit]);

  const slide = slides[currentSlide];

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card/50 backdrop-blur">
        <div className="flex items-center gap-4">
          <img src={btsLogo} alt="Black Tech Street" className="h-10 w-auto" />
          <div>
            <h1 className="font-bold text-lg">ASPIRE CRM Dashboard</h1>
            <p className="text-sm text-muted-foreground">Presentation Mode</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm">
            {currentSlide + 1} / {slides.length}
          </Badge>
          <Button variant="ghost" size="icon" onClick={onExit}>
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <Card 
          key={key}
          className="w-full max-w-4xl border-0 shadow-2xl overflow-hidden animate-fade-in"
        >
          <div className={cn(
            "absolute inset-0 opacity-10 bg-gradient-to-br",
            slide.gradient
          )} />
          <CardContent className="relative z-10 p-12 flex flex-col items-center text-center">
            <div className={cn(
              "p-6 rounded-2xl bg-gradient-to-br mb-8 text-white",
              slide.gradient
            )}>
              {slide.icon}
            </div>
            <h2 className="text-2xl font-medium text-muted-foreground mb-4">
              {slide.title}
            </h2>
            <div className={cn(
              "text-8xl font-bold mb-6 bg-gradient-to-r bg-clip-text text-transparent",
              slide.gradient
            )}>
              <CountUp 
                key={key} 
                end={slide.value} 
                suffix={slide.suffix}
              />
            </div>
            <p className="text-xl text-muted-foreground max-w-lg">
              {slide.description}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 p-6 border-t border-border bg-card/50 backdrop-blur">
        <Button variant="outline" size="icon" onClick={prevSlide}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <Button
          variant={isPlaying ? "default" : "outline"}
          onClick={() => setIsPlaying(!isPlaying)}
          className="min-w-[120px]"
        >
          {isPlaying ? (
            <>
              <Pause className="h-4 w-4 mr-2" />
              Pause
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Auto-Play
            </>
          )}
        </Button>
        <Button variant="outline" size="icon" onClick={nextSlide}>
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Slide indicators */}
      <div className="flex items-center justify-center gap-2 pb-4">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => {
              setCurrentSlide(idx);
              setKey(k => k + 1);
            }}
            className={cn(
              "w-2 h-2 rounded-full transition-all",
              idx === currentSlide 
                ? "w-8 bg-primary" 
                : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
            )}
          />
        ))}
      </div>

      {/* Keyboard hints */}
      <div className="absolute bottom-4 right-4 text-xs text-muted-foreground opacity-50">
        <kbd className="px-1.5 py-0.5 rounded bg-muted">←</kbd>{" "}
        <kbd className="px-1.5 py-0.5 rounded bg-muted">→</kbd> Navigate •{" "}
        <kbd className="px-1.5 py-0.5 rounded bg-muted">P</kbd> Play/Pause •{" "}
        <kbd className="px-1.5 py-0.5 rounded bg-muted">Esc</kbd> Exit
      </div>
    </div>
  );
}
