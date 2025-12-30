import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import BuildDayDashboard from "@/components/dashboard/BuildDayDashboard";
import { ThemeToggle } from "@/components/ThemeToggle";
import btsLogo from "@/assets/black-tech-street-logo.png";

export default function BuildDayProjects() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <header className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Link 
              to="/admin" 
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard Portal
            </Link>
            <ThemeToggle />
          </div>
          <div className="flex items-center gap-3 mb-2">
            <img 
              src={btsLogo} 
              alt="Black Tech Street Logo" 
              className="h-12 w-auto"
            />
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
                Build Day Project Submissions
              </h1>
              <p className="text-muted-foreground">
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
