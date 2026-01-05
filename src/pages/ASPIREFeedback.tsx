import { ASPIREWorkshopDashboard } from "@/components/dashboard/ASPIREWorkshopDashboard";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import btsLogo from "@/assets/black-tech-street-logo.png";

export default function ASPIREFeedback() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6 sm:py-8 px-3 sm:px-4">
        <header className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-4">
            <Link to="/admin">
              <Button variant="ghost" size="sm" className="gap-1 sm:gap-2 px-2 sm:px-3">
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back to Portal</span>
                <span className="sm:hidden">Back</span>
              </Button>
            </Link>
            <img 
              src={btsLogo} 
              alt="Black Tech Street Logo" 
              className="h-10 sm:h-12 w-auto"
            />
            <ThemeToggle />
          </div>
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-foreground mb-2">
              ASPIRE Workshop Feedback
            </h1>
            <p className="text-sm sm:text-lg text-muted-foreground px-4">
              Detailed participant feedback and insights
            </p>
          </div>
        </header>

        <ASPIREWorkshopDashboard />

        <footer className="mt-12 pt-8 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Black Tech Street. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
}
