import { useState, useEffect, useMemo, useCallback } from "react";
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
  { id: "verbatims", label: "ASPIRE Verbatims" },
  { id: "nps", label: "Net Promoter Score" },
  { id: "dec6-workshop", label: "December 6 ASPIRE Workshop" },
  { id: "ltf-workshop", label: "December 13 LTF Student Workshop" },
  { id: "projects", label: "ASPIRE Innovation Day Projects" },
  { id: "gallery", label: "Gallery" },
];

const INNOVATION_PROJECTS = [
  {
    name: "Rise-Up Learning Hub",
    description: "An AI-powered educational platform designed to provide personalized learning pathways for underserved communities, connecting learners with mentors and resources tailored to their goals.",
    file: "/project-files/Rise_Up_Learning_Hub.pptx",
    cloudUrl: "https://woqjbwotxaaczkptnjfd.supabase.co/storage/v1/object/public/project-files/Rise_Up_Learning_Hub.pptx",
  },
  {
    name: "RV Revive Tulsa",
    description: "A community-driven initiative leveraging AI to match volunteers with RV restoration projects, creating affordable mobile housing solutions for Tulsa residents experiencing housing instability.",
    file: null,
  },
  {
    name: "Thrive Access Network",
    description: "A digital resource hub using AI to connect individuals with social services, healthcare, and employment opportunities — streamlining access to community support systems.",
    file: null,
  },
];

const GALLERY_IMAGES = [
  "/images/gallery/techhubs-q1-01.jpg",
  "/images/gallery/techhubs-q1-02.jpg",
  "/images/gallery/techhubs-q1-03.jpg",
  "/images/gallery/techhubs-q1-04.jpg",
  "/images/gallery/techhubs-q1-05.jpg",
  "/images/gallery/techhubs-q1-06.jpg",
  "/images/gallery/techhubs-q1-07.jpg",
  "/images/gallery/techhubs-q1-08.jpg",
  "/images/gallery/techhubs-q1-09.jpg",
  "/images/gallery/techhubs-q1-10.jpg",
];

export function TechHubsReportContent() {
  const [feedbackData, setFeedbackData] = useState<FeedbackRow[]>([]);
  const [ltfData, setLtfData] = useState<LTFRow[]>([]);
  const [registrationData, setRegistrationData] = useState<RegistrationRow[]>([]);
  const [attendanceData, setAttendanceData] = useState<AttendanceRow[]>([]);
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
    const checkDone = () => { completed++; if (completed >= 4) setLoading(false); };

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
        name: "Participant",
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
        name: "Tiyahna Garrett",
        question: "On the most valuable thing they learned",
      },
      {
        text: "Walking through engineer design and realizing how \"easy\" it can be with a template and practice. The process removed the intimidation of creating workflows.",
        name: "Natalie Brown",
        question: "On the most valuable thing they learned",
      },
      {
        text: "Enjoyed working with a team and creating a website & slide deck.",
        name: "Kisha Jefferson",
        question: "On the most valuable thing they learned",
      },
    ];

    const seen = new Set<string>();
    const unique = quotes.filter((q) => {
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

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-4xl">
      {/* Table of Contents */}
      <nav className="mb-12 p-6 rounded-lg border border-border bg-card">
        <h2 className="text-lg font-semibold text-foreground mb-4">Contents</h2>
        <ul className="space-y-2">
          {TOC_ITEMS.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className="text-primary hover:underline text-sm sm:text-base"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* ASPIRE Verbatims */}
      <section id="verbatims" className="mb-16 scroll-mt-8">
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-foreground mb-6 pb-2 border-b border-border">
          ASPIRE Verbatims
        </h2>
        <p className="text-muted-foreground mb-6 text-sm">
          Direct feedback from December 6 ASPIRE Workshop participants
        </p>
        <div className="space-y-4">
          {verbatims.map((q, i) => (
            <blockquote
              key={i}
              className="border-l-4 border-primary/60 bg-muted/40 rounded-r-lg px-5 py-4"
            >
              <p className="text-xs font-medium text-primary/80 uppercase tracking-wide mb-2">
                {q.question}
              </p>
              <p className="italic text-foreground text-sm sm:text-base leading-relaxed">
                "{q.text}"
              </p>
              <footer className="mt-2 text-xs text-muted-foreground font-medium">
                — {q.name}
              </footer>
            </blockquote>
          ))}
        </div>
      </section>

      {/* Net Promoter Score */}
      <section id="nps" className="mb-16 scroll-mt-8">
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-foreground mb-6 pb-2 border-b border-border">
          Net Promoter Score
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-muted/60">
                <th className="text-left px-4 py-3 font-semibold text-foreground">Event</th>
                <th className="text-center px-4 py-3 font-semibold text-foreground">Score 5<br/><span className="text-xs text-muted-foreground font-normal">Promoters</span></th>
                <th className="text-center px-4 py-3 font-semibold text-foreground">Score 4<br/><span className="text-xs text-muted-foreground font-normal">Passive</span></th>
                <th className="text-center px-4 py-3 font-semibold text-foreground">Score 1-3<br/><span className="text-xs text-muted-foreground font-normal">Detractors</span></th>
                <th className="text-center px-4 py-3 font-semibold text-foreground">Total</th>
                <th className="text-center px-4 py-3 font-semibold text-foreground">NPS</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-border">
                <td className="px-4 py-3 font-medium text-foreground">Dec 6 ASPIRE Workshop</td>
                <td className="text-center px-4 py-3 text-foreground">{dec6NPS.promoters}</td>
                <td className="text-center px-4 py-3 text-foreground">{dec6NPS.passives}</td>
                <td className="text-center px-4 py-3 text-foreground">{dec6NPS.detractors}</td>
                <td className="text-center px-4 py-3 text-foreground">{dec6NPS.total}</td>
                <td className="text-center px-4 py-3 font-bold text-primary">{dec6NPS.nps}%</td>
              </tr>
              <tr className="border-t border-border bg-muted/20">
                <td className="px-4 py-3 font-medium text-foreground">Dec 13 LTF Student Workshop</td>
                <td className="text-center px-4 py-3 text-foreground">{ltfNPS.promoters}</td>
                <td className="text-center px-4 py-3 text-foreground">{ltfNPS.passives}</td>
                <td className="text-center px-4 py-3 text-foreground">{ltfNPS.detractors}</td>
                <td className="text-center px-4 py-3 text-foreground">{ltfNPS.total}</td>
                <td className="text-center px-4 py-3 font-bold text-primary">{ltfNPS.nps}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* December 6 ASPIRE Workshop */}
      <section id="dec6-workshop" className="mb-16 scroll-mt-8">
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-foreground mb-6 pb-2 border-b border-border">
          December 6 ASPIRE Workshop
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <MetricCard icon={<Users className="h-5 w-5" />} label="Registrants" value={dec6Metrics.registrants} />
          <MetricCard icon={<BookOpen className="h-5 w-5" />} label="Participants" value={dec6Metrics.attendees} />
        </div>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <MetricCard icon={<Star className="h-5 w-5" />} label="Survey Responses" value={feedbackData.length} />
          <MetricCard icon={<Award className="h-5 w-5" />} label="NPS Score" value={`${dec6NPS.nps}%`} />
        </div>
      </section>

      {/* December 13 LTF Student Workshop */}
      <section id="ltf-workshop" className="mb-16 scroll-mt-8">
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-foreground mb-6 pb-2 border-b border-border">
          December 13 LTF Student Workshop
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <MetricCard icon={<Users className="h-5 w-5" />} label="Respondents" value={ltfMetrics.total} />
          <MetricCard icon={<Star className="h-5 w-5" />} label="Overall Rating" value={`${ltfMetrics.overallRating}/5`} />
          <MetricCard icon={<TrendingUp className="h-5 w-5" />} label="Engagement" value={`${ltfMetrics.engagement}/5`} />
          <MetricCard icon={<BookOpen className="h-5 w-5" />} label="Content Clarity" value={`${ltfMetrics.clarity}/5`} />
        </div>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <MetricCard label="Confidence Before" value={`${ltfMetrics.confidenceBefore}/5`} />
          <MetricCard label="Confidence After" value={`${ltfMetrics.confidenceAfter}/5`} />
          <MetricCard
            icon={<ArrowUp className="h-5 w-5 text-primary" />}
            label="Confidence Shift"
            value={`+${ltfMetrics.confidenceShift}`}
            highlight
          />
        </div>
      </section>

      {/* ASPIRE Innovation Day Projects */}
      <section id="projects" className="mb-16 scroll-mt-8">
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-foreground mb-6 pb-2 border-b border-border">
          ASPIRE Innovation Day Projects
        </h2>
        <p className="text-muted-foreground mb-6 text-sm">
          Highlighted projects from the ASPIRE Build Day cohort
        </p>
        <div className="space-y-4">
          {INNOVATION_PROJECTS.map((project) => (
            <div
              key={project.name}
              className="p-5 rounded-lg border border-border bg-card hover:border-primary/40 transition-colors"
            >
              <h3 className="text-lg font-semibold text-foreground mb-2">{project.name}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{project.description}</p>
              {project.file && project.file.endsWith('.pptx') ? (
                <div className="mt-4">
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
                  className="inline-flex items-center gap-1 mt-3 text-xs text-primary hover:underline"
                >
                  <ExternalLink className="h-3 w-3" /> View Project File
                </a>
              ) : null}
            </div>
          ))}
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
