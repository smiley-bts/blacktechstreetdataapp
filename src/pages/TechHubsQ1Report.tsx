import { TechHubsReportContent } from "@/components/report/TechHubsReportContent";
import { ThemeToggle } from "@/components/ThemeToggle";
import { MatrixHeroRain } from "@/components/report/MatrixHeroRain";
import btsBLogo from "@/assets/logos/bts-b-logo.png";

const TechHubsQ1Report = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Banner */}
      <div className="relative overflow-hidden border-b border-border bg-black">
        <MatrixHeroRain height={280} />
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-10"
          style={{ backgroundImage: "url('/images/tulsa-skyline-banner.png')" }}
        />
        <div className="relative container mx-auto py-10 sm:py-16 px-4 sm:px-6 z-10">
          <div className="flex items-center justify-between mb-6">
            <div />
            <img src={btsBLogo} alt="BTS" className="h-12 sm:h-16 w-auto drop-shadow-[0_0_12px_rgba(16,185,129,0.4)]" />
            <ThemeToggle />
          </div>
           <div className="text-center max-w-3xl mx-auto">
             <p className="text-sm font-medium tracking-widest uppercase text-emerald-400/80 mb-2">
               Black Tech Street
             </p>
             <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white mb-3 drop-shadow-[0_0_20px_rgba(16,185,129,0.3)]">
               G-ACE Quarterly Report
             </h1>
            <p className="text-base sm:text-lg text-emerald-300/60">
              Q4 2025
            </p>
          </div>
        </div>
      </div>

      <TechHubsReportContent />
    </div>
  );
};

export default TechHubsQ1Report;
