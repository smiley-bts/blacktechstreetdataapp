import { AspireLeadJan2026Dashboard } from "@/components/dashboard/AspireLeadJan2026Dashboard";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import btsLogo from "@/assets/black-tech-street-logo.png";

const AspireLeadJan2026 = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6 sm:py-8 px-3 sm:px-4">
        {/* Header */}
        <header className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-4">
            <Link to="/">
              <Button variant="outline" size="sm" className="gap-1 sm:gap-2 px-2 sm:px-3">
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back to CRM</span>
                <span className="sm:hidden">Back</span>
              </Button>
            </Link>
            <img 
              src={btsLogo} 
              alt="Black Tech Street Logo" 
              className="h-12 sm:h-16 w-auto"
            />
            <ThemeToggle />
          </div>
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-foreground mb-2">
              ASPIRE: Lead the Future with AI
            </h1>
            <p className="text-sm sm:text-lg text-muted-foreground px-4">
              Student Feedback Dashboard • January 31, 2026
            </p>
          </div>
        </header>

        <AspireLeadJan2026Dashboard />

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Black Tech Street. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default AspireLeadJan2026;
