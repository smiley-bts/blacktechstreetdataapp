import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { Users, TrendingUp, Star, BookOpen, Award, ArrowUp, ExternalLink, X, ChevronLeft, ChevronRight } from "lucide-react";

interface FeedbackRow {
  [key: string]: string;
}

interface LTFRow {
  [key: string]: string;
}

interface RegistrationRow {
  [key: string]: string;
}

interface AttendanceRow {
  [key: string]: string;
}

const TOC_ITEMS = [
  { id: "nps", label: "Net Promoter Score" },
  { id: "verbatims", label: "ASPIRE Verbatims" },
  { id: "projects", label: "ASPIRE Innovation Projects" },
  { id: "gallery", label: "Gallery" },
];

const INNOVATION_PROJECTS = [
  {
    name: "Rise-Up Learning Hub",
    description: "An AI-powered educational platform designed to provide personalized learning pathways for underserved communities, connecting learners with mentors and resources tailored to their goals.",
    file: "/project-files/Rise_Up_Learning_Hub.pptx",
    cloudUrl: "https://woqjbwotxaaczkptnjfd.supabase.co/storage/v1/object/public/project-files/Rise_Up_Learning_Hub.pptx",
    place: 1,
    medal: "🥇",
  },
  {
    name: "Thrive Access Network",
    description: "A digital resource hub using AI to connect individuals with social services, healthcare, and employment opportunities — streamlining access to community support systems.",
    file: null,
    place: 2,
    medal: "🥈",
  },
  {
    name: "RV Revive Tulsa",
    description: "A community-driven initiative leveraging AI to match volunteers with RV restoration projects, creating affordable mobile housing solutions for Tulsa residents experiencing housing instability.",
    file: null,
    place: 3,
    medal: "🥉",
  },
];

const GALLERY_IMAGES = [
  "/images/gallery/techhubs-q1-05.jpg",
  "/images/gallery/techhubs-q1-10.jpg",
  "/images/gallery/techhubs-q1-03.jpg",
  "/images/gallery/techhubs-q1-11.jpg",
  "/images/gallery/techhubs-q1-12.jpg",
  "/images/gallery/techhubs-q1-13.jpg",
  "/images/gallery/techhubs-q1-14.jpg",
  "/images/gallery/techhubs-q1-16.jpg",
  "/images/gallery/techhubs-q1-17.jpg",
  "/images/gallery/techhubs-q1-19.jpg",
  
  "/images/gallery/techhubs-q1-21.jpg",
  "/images/gallery/techhubs-q1-22.jpg",
  "/images/gallery/techhubs-q1-23.jpg",
  "/images/gallery/techhubs-q1-24.jpg",
  "/images/gallery/techhubs-q1-25.jpg",
  "/images/gallery/techhubs-q1-26.jpg",
  "/images/gallery/techhubs-q1-27.jpg",
  "/images/gallery/techhubs-q1-28.jpg",
  "/images/gallery/techhubs-q1-29.jpg",
];

export function TechHubsReportContent() {
  const [feedbackData, setFeedbackData] = useState<FeedbackRow[]>([]);
  const [ltfData, setLtfData] = useState<LTFRow[]>([]);
  const [registrationData, setRegistrationData] = useState<RegistrationRow[]>([]);
  const [attendanceData, setAttendanceData] = useState<AttendanceRow[]>([]);
  const [preSurveyData, setPreSurveyData] = useState<Record<string, string>[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const prevImage = useCallback(() => setLightboxIndex((i) => (i !== null ? (i - 1 + GALLERY_IMAGES.length) % GALLERY_IMAGES.length : null)), []);
  const nextImage = useCallback(() => setLightboxIndex((i) => (i !== null ? (i + 1) % GALLERY_IMAGES.length : null)), []);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") prevImage();
      if (e.key === "ArrowRight") nextImage();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightboxIndex, closeLightbox, prevImage, nextImage]);

  useEffect(() => {
    let completed = 0;
    const checkDone = () => { completed++; if (completed >= 5) setLoading(false); };

    Papa.parse("/aspire-feedback-survey.csv", {
      download: true, header: true, skipEmptyLines: true,
      complete: (r) => { setFeedbackData(r.data as FeedbackRow[]); checkDone(); },
      error: () => checkDone(),
    });

    Papa.parse("/aspire-ltf-feedback.csv", {
      download: true, header: true, skipEmptyLines: true,
      complete: (r) => { setLtfData(r.data as LTFRow[]); checkDone(); },
      error: () => checkDone(),
    });

    Papa.parse("/aspire-dec6-registration.csv", {
      download: true, header: true, skipEmptyLines: true,
      complete: (r) => { setRegistrationData(r.data as RegistrationRow[]); checkDone(); },
      error: () => checkDone(),
    });

    Papa.parse("/aspire-dec6-pre-survey.csv", {
      download: true, header: true, skipEmptyLines: true,
      complete: (r) => { setPreSurveyData(r.data as Record<string, string>[]); checkDone(); },
      error: () => checkDone(),
    });

    // Load XLSX attendance
    fetch("/aspire-dec6-attendance.xlsx")
      .then((res) => res.arrayBuffer())
      .then((buf) => {
        const wb = XLSX.read(buf, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<AttendanceRow>(ws);
        setAttendanceData(rows);
        checkDone();
      })
      .catch(() => checkDone());
  }, []);

  // Extract verbatim quotes from feedback
  const verbatims = useMemo(() => {
    const quoteColumns: { col: string; label: string }[] = [
      { col: "Please share a highlight or takeaway from your experience today.", label: "On their highlight or takeaway" },
      { col: "What is the most valuable thing you learned today?", label: "On the most valuable thing they learned" },
    ];
    const quotes: { text: string; name: string; question: string }[] = [];

    feedbackData.forEach((row) => {
      const firstName = (row["What's your first name?"] || "").trim();
      const lastName = (row["What's your last name?"] || "").trim();
      const attribution = lastName ? `${firstName} ${lastName.charAt(0)}.` : firstName;

      quoteColumns.forEach(({ col, label }) => {
        const text = (row[col] || "").trim();
        if (text && text.length > 15 && attribution) {
          quotes.push({ text, name: attribution, question: label });
        }
      });
    });

    // Curated featured quotes
    const curated: { text: string; name: string; question: string }[] = [
      {
        text: "I really enjoyed learning AI prompting. Understanding how to communicate the task, the role, and the outcomes that you want really made me feel confident in generating my idea.",
        name: "Tania G.",
        question: "On their highlight or takeaway",
      },
      {
        text: "I really want to thank Tyrance for being a great teacher. He went back and covered things if we asked. He engaged the crowd. He was encouraging and VERY informative. I am looking forward to practicing the Prompting Framework at home and also try building out the workflow chart. My initial fear of AI has been conquered thanks to the ASPIRE workshop.",
        name: "Karra D.",
        question: "On their highlight or takeaway",
      },
      {
        text: "This is going to change my life. My organization's success. Our impact on those we serve. Awesome! Thank you.",
        name: "Katie P.",
        question: "On their highlight or takeaway",
      },
      {
        text: "It is not as hard as I thought it was!",
        name: "Gretchen M.",
        question: "On the most valuable thing they learned",
      },
      {
        text: "I enjoyed learning about the ways to use AI prompts effectively, most of all the Advanced Prompting Techniques.",
        name: "LaTisha N.",
        question: "On the most valuable thing they learned",
      },
      {
        text: "The prompt making and hands on experience was incredible! Being able to practice this in real time was so helpful to understanding the overall workshop.",
        name: "Tiyahna G.",
        question: "On the most valuable thing they learned",
      },
      {
        text: "Walking through engineer design and realizing how \"easy\" it can be with a template and practice. The process removed the intimidation of creating workflows.",
        name: "Natalie B.",
        question: "On the most valuable thing they learned",
      },
    ];

    const blocklistRaw = ["This is the BEST", "Prompt writing & workflow design", "The importance of prompt writing", "Spotting bias or using AI ethically", "great prompting framework", "I loved the positive tone!", "the pocket guide", "The pocket guide", "The Pocket Guide", "Third one and each one is smoother than the last", "Third one and each one is smoother than the previous one.", "Hands-on experience using AI tools"];
    const blocklist = new Set(blocklistRaw.map(s => s.toLowerCase()));
    const seen = new Set<string>();
    const unique = quotes.filter((q) => {
      if (blocklist.has(q.text.toLowerCase())) return false;
      if (seen.has(q.text)) return false;
      seen.add(q.text);
      return true;
    });
    return [...curated, ...unique].slice(0, 10);
  }, [feedbackData]);

  // NPS Calculation for Dec 6 ASPIRE
  const dec6NPS = useMemo(() => {
    const col = "How likely are you to recommend this event to someone else?";
    let promoters = 0, passives = 0, detractors = 0;
    feedbackData.forEach((row) => {
      const val = row[col] || "";
      const score = parseInt(val.charAt(0));
      if (isNaN(score)) return;
      if (score === 5) promoters++;
      else if (score === 4) passives++;
      else detractors++;
    });
    const total = promoters + passives + detractors;
    const nps = total > 0 ? Math.round(((promoters - detractors) / total) * 100) : 0;
    return { promoters, passives, detractors, total, nps };
  }, [feedbackData]);

  // NPS Calculation for LTF
  const ltfNPS = useMemo(() => {
    const col = "Overall, how would you rate your experience in the ASPIRE: Lead the Future with AI workshop?";
    let promoters = 0, passives = 0, detractors = 0;
    ltfData.forEach((row) => {
      const val = row[col] || "";
      const score = parseInt(val);
      if (isNaN(score)) return;
      if (score === 5) promoters++;
      else if (score === 4) passives++;
      else detractors++;
    });
    const total = promoters + passives + detractors;
    const nps = total > 0 ? Math.round(((promoters - detractors) / total) * 100) : 0;
    return { promoters, passives, detractors, total, nps };
  }, [ltfData]);

  // Dec 6 Workshop Metrics
  const dec6Metrics = useMemo(() => {
    const registrants = registrationData.length;
    const emailSet = new Set<string>();
    registrationData.forEach((r) => {
      const email = (r["What's your email?"] || "").trim().toLowerCase();
      if (email) emailSet.add(email);
    });
    const uniqueRegistrants = emailSet.size || registrants;

    // Attendance from XLSX - count those with check-ins >= 1
    let attendees = 0;
    const attendeeEmails = new Set<string>();
    attendanceData.forEach((row) => {
      const checkins = parseInt(String(row["Total check-ins"] || row["Total Check-ins"] || "0"));
      const email = (String(row["Email"] || row["email"] || "")).trim().toLowerCase();
      if (checkins >= 1 && email && !attendeeEmails.has(email)) {
        attendeeEmails.add(email);
        attendees++;
      }
    });

    const rate = uniqueRegistrants > 0 ? Math.round((attendees / uniqueRegistrants) * 100) : 0;
    return { registrants: uniqueRegistrants, attendees, rate };
  }, [registrationData, attendanceData]);

  // LTF Workshop Metrics
  const ltfMetrics = useMemo(() => {
    const total = ltfData.length;
    const ratingCol = "Overall, how would you rate your experience in the ASPIRE: Lead the Future with AI workshop?";
    const engagementCol = "The workshop was engaging and held my attention.";
    const clarityCol = "The content was explained in a way I could understand.";
    const beforeCol = "BEFORE today's workshop, how confident were you in using AI tools like ChatGPT?";
    const afterCol = "AFTER today's workshop, how confident do you feel using AI tools like ChatGPT?";

    const avg = (col: string) => {
      let sum = 0, count = 0;
      ltfData.forEach((r) => { const v = parseInt(r[col]); if (!isNaN(v)) { sum += v; count++; } });
      return count > 0 ? (sum / count).toFixed(1) : "N/A";
    };

    const avgBefore = avg(beforeCol);
    const avgAfter = avg(afterCol);
    const shift = avgBefore !== "N/A" && avgAfter !== "N/A"
      ? (parseFloat(avgAfter) - parseFloat(avgBefore)).toFixed(1)
      : "N/A";

    return {
      total,
      overallRating: avg(ratingCol),
      engagement: avg(engagementCol),
      clarity: avg(clarityCol),
      confidenceBefore: avgBefore,
      confidenceAfter: avgAfter,
      confidenceShift: shift,
    };
  }, [ltfData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  // --- Verbatim Carousel Component ---
  const VerbatimCarousel = ({ quotes: vQuotes }: { quotes: { text: string; name: string; question: string }[] }) => {
    const [active, setActive] = useState(0);
    const [paused, setPaused] = useState(false);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
      if (paused || vQuotes.length <= 1) return;
      timerRef.current = setInterval(() => {
        setActive((prev) => (prev + 1) % vQuotes.length);
      }, 5000);
      return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [paused, vQuotes.length]);

    if (vQuotes.length === 0) return null;

    const prev = () => setActive((a) => (a - 1 + vQuotes.length) % vQuotes.length);
    const next = () => setActive((a) => (a + 1) % vQuotes.length);

    return (
      <div
        className="relative"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* Left Arrow */}
        <button
          onClick={prev}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 sm:-translate-x-3 z-10 bg-muted/80 hover:bg-muted backdrop-blur-sm rounded-full p-2 text-foreground/70 hover:text-foreground transition-colors"
          aria-label="Previous quote"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        {/* Right Arrow */}
        <button
          onClick={next}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 sm:translate-x-3 z-10 bg-muted/80 hover:bg-muted backdrop-blur-sm rounded-full p-2 text-foreground/70 hover:text-foreground transition-colors"
          aria-label="Next quote"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        <div className="overflow-hidden rounded-lg border border-border bg-muted/30 min-h-[140px] sm:min-h-[120px] mx-6 sm:mx-8">
          {vQuotes.map((q, i) => (
            <div
              key={i}
              className={`px-6 py-6 sm:px-8 sm:py-8 transition-all duration-500 ease-in-out ${
                i === active ? "block animate-fade-in" : "hidden"
              }`}
            >
              <p className="italic text-foreground text-base sm:text-lg leading-relaxed text-center">
                &ldquo;{q.text}&rdquo;
              </p>
              <footer className="mt-4 text-sm text-muted-foreground font-medium text-center">
                — {q.name}
              </footer>
            </div>
          ))}
        </div>
        <div className="flex justify-center gap-2 mt-4">
          {vQuotes.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i === active ? "bg-primary w-6" : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
              }`}
              aria-label={`Go to quote ${i + 1}`}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-4xl">
      {/* Horizontal Interactive TOC Bar */}
      <nav className="mb-12 sticky top-0 z-40">
        <div className="relative overflow-hidden rounded-xl border border-primary/20 bg-card/80 backdrop-blur-xl shadow-lg shadow-primary/5">
          {/* Subtle animated glow line */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
          <div className="flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-3">
            {TOC_ITEMS.map((item, idx) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="group relative flex items-center gap-2 px-3 sm:px-5 py-2 rounded-lg text-xs sm:text-sm font-medium tracking-wide uppercase transition-all duration-300 text-muted-foreground hover:text-primary-foreground hover:bg-primary/90 hover:shadow-md hover:shadow-primary/20 hover:scale-[1.03] active:scale-95"
              >
                <span className="relative z-10">{item.label}</span>
                {idx < TOC_ITEMS.length - 1 && (
                  <span className="hidden sm:block absolute -right-1 top-1/2 -translate-y-1/2 w-px h-4 bg-border/40" />
                )}
              </a>
            ))}
          </div>
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        </div>
      </nav>

      {/* Net Promoter Score - Dec 6 ASPIRE Only */}
      <section id="nps" className="mb-16 scroll-mt-8">
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-foreground mb-6 pb-2 border-b border-border">
          Net Promoter Score
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-muted/40 rounded-lg p-4 text-center">
            <p className="text-2xl sm:text-3xl font-bold text-primary">{dec6NPS.nps}%</p>
            <p className="text-xs text-muted-foreground mt-1">NPS</p>
          </div>
          <div className="bg-muted/40 rounded-lg p-4 text-center">
            <p className="text-2xl sm:text-3xl font-bold text-foreground">{dec6NPS.promoters}</p>
            <p className="text-xs text-muted-foreground mt-1">Promoters</p>
          </div>
          <div className="bg-muted/40 rounded-lg p-4 text-center">
            <p className="text-2xl sm:text-3xl font-bold text-foreground">{dec6NPS.passives}</p>
            <p className="text-xs text-muted-foreground mt-1">Passives</p>
          </div>
          <div className="bg-muted/40 rounded-lg p-4 text-center">
            <p className="text-2xl sm:text-3xl font-bold text-foreground">{dec6NPS.detractors}</p>
            <p className="text-xs text-muted-foreground mt-1">Detractors</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-3 text-center">
          Based on {dec6NPS.total} post-survey responses from the December 6 ASPIRE Workshop
        </p>
      </section>

      {/* ASPIRE Verbatims Carousel */}
      <section id="verbatims" className="mb-16 scroll-mt-8">
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-foreground mb-6 pb-2 border-b border-border">
          ASPIRE Verbatims
        </h2>
        <VerbatimCarousel quotes={verbatims} />
      </section>


      {/* ASPIRE Innovation Projects */}
      <section id="projects" className="mb-16 scroll-mt-8">
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-foreground mb-6 pb-2 border-b border-border">
          ASPIRE Innovation Projects
        </h2>
        <div className="space-y-6">
          {INNOVATION_PROJECTS.map((project) => {
            const placeLabels = ["1st Place", "2nd Place", "3rd Place"];
            const borderColors = [
              "border-yellow-500/60 bg-yellow-500/5",
              "border-gray-400/60 bg-gray-400/5",
              "border-amber-700/60 bg-amber-700/5",
            ];
            return (
              <div
                key={project.name}
                className={`relative p-6 rounded-xl border-2 transition-all hover:shadow-lg ${borderColors[project.place - 1] || "border-border bg-card"}`}
              >
                {/* Medal & Place */}
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-4xl">{project.medal}</span>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      {placeLabels[project.place - 1]}
                    </span>
                    <h3 className="text-xl font-bold text-foreground">{project.name}</h3>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed ml-[52px]">{project.description}</p>
                {project.file && project.file.endsWith('.pptx') ? (
                  <div className="mt-4 ml-[52px]">
                    <iframe
                      src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(project.cloudUrl || (window.location.origin + project.file))}`}
                      className="w-full rounded-lg border border-border"
                      style={{ height: '400px' }}
                      title={`${project.name} presentation`}
                      allowFullScreen
                    />
                  </div>
                ) : project.file ? (
                  <a
                    href={project.file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mt-3 ml-[52px] text-xs text-primary hover:underline"
                  >
                    <ExternalLink className="h-3 w-3" /> View Project File
                  </a>
                ) : null}
              </div>
            );
          })}
        </div>
      </section>

      {/* Gallery */}
      <section id="gallery" className="mb-16 scroll-mt-8">
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-foreground mb-6 pb-2 border-b border-border">
          Gallery
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {GALLERY_IMAGES.map((src, i) => (
            <button
              key={i}
              onClick={() => setLightboxIndex(i)}
              className="aspect-[4/3] overflow-hidden rounded-lg border border-border cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <img
                src={src}
                alt={`ASPIRE event photo ${i + 1}`}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      </section>

      {/* Lightbox */}
      {lightboxIndex !== null && createPortal(
        <div
          className="fixed inset-0 z-[9999] bg-black/95 flex flex-col items-center justify-center"
          onClick={closeLightbox}
          style={{ touchAction: 'none' }}
        >
          {/* Close button */}
          <button
            onClick={(e) => { e.stopPropagation(); closeLightbox(); }}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 text-white/80 hover:text-white z-50 p-2 bg-black/40 rounded-full backdrop-blur-sm"
          >
            <X className="h-6 w-6 sm:h-7 sm:w-7" />
          </button>

          {/* Previous button */}
          <button
            onClick={(e) => { e.stopPropagation(); prevImage(); }}
            className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-2 sm:p-3 z-50 bg-black/40 rounded-full backdrop-blur-sm"
          >
            <ChevronLeft className="h-7 w-7 sm:h-10 sm:w-10" />
          </button>

          {/* Next button */}
          <button
            onClick={(e) => { e.stopPropagation(); nextImage(); }}
            className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-2 sm:p-3 z-50 bg-black/40 rounded-full backdrop-blur-sm"
          >
            <ChevronRight className="h-7 w-7 sm:h-10 sm:w-10" />
          </button>

          {/* Image */}
          <img
            src={GALLERY_IMAGES[lightboxIndex]}
            alt={`ASPIRE event photo ${lightboxIndex + 1}`}
            className="max-h-[75dvh] sm:max-h-[85vh] max-w-[calc(100vw-4rem)] sm:max-w-[90vw] object-contain rounded-lg select-none"
            onClick={(e) => e.stopPropagation()}
            draggable={false}
          />

          {/* Counter */}
          <div className="absolute bottom-4 sm:bottom-6 text-white/60 text-xs sm:text-sm font-medium bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm">
            {lightboxIndex + 1} / {GALLERY_IMAGES.length}
          </div>
        </div>,
        document.body
      )}

      {/* Footer */}
      <footer className="text-center py-8 border-t border-border">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Black Tech Street • ASPIRE Program Report
        </p>
      </footer>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  highlight,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string | number;
  highlight?: boolean;
}) {
  return (
    <div className={`p-4 rounded-lg border ${highlight ? "border-primary/50 bg-primary/5" : "border-border bg-card"}`}>
      <div className="flex items-center gap-2 mb-1">
        {icon && <span className="text-muted-foreground">{icon}</span>}
        <span className="text-xs text-muted-foreground uppercase tracking-wide">{label}</span>
      </div>
      <p className={`text-2xl font-bold ${highlight ? "text-primary" : "text-foreground"}`}>
        {value}
      </p>
    </div>
  );
}
