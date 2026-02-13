import { TechHubsReportContent } from "@/components/report/TechHubsReportContent";
import { ThemeToggle } from "@/components/ThemeToggle";
import btsLogo from "@/assets/black-tech-street-logo.png";

const TechHubsQ1Report = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Banner */}
      <div className="relative overflow-hidden border-b border-border">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: "url('/images/tulsa-skyline-banner.png')" }}
        />
        <div className="relative container mx-auto py-10 sm:py-16 px-4 sm:px-6">
          <div className="flex items-center justify-between mb-6">
            <div />
            <img src={btsLogo} alt="Black Tech Street Logo" className="h-12 sm:h-16 w-auto" />
            <ThemeToggle />
          </div>
          <div className="text-center max-w-3xl mx-auto">
            <p className="text-sm font-medium tracking-widest uppercase text-muted-foreground mb-2">
              Black Tech Street
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-foreground mb-3">
              G-ACE Quarterly Report
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground">
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
