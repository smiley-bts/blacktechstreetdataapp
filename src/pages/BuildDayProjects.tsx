import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import BuildDayDashboard from "@/components/dashboard/BuildDayDashboard";
import { ThemeToggle } from "@/components/ThemeToggle";
import btsLogo from "@/assets/black-tech-street-logo.png";

export default function BuildDayProjects() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6 sm:py-8 px-3 sm:px-4">
        <header className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-4">
            <Link 
              to="/admin" 
              className="inline-flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back to Dashboard Portal</span>
              <span className="sm:hidden">Back</span>
            </Link>
            <ThemeToggle />
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 mb-2">
            <img 
              src={btsLogo} 
              alt="Black Tech Street Logo" 
              className="h-10 sm:h-12 w-auto"
            />
            <div className="text-center sm:text-left">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-display font-bold text-foreground">
                Build Day Project Submissions
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                ASPIRE Build Day participant projects and solutions
              </p>
            </div>
          </div>
        </header>

        <BuildDayDashboard />

        <footer className="mt-12 pt-8 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Black Tech Street. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
}
