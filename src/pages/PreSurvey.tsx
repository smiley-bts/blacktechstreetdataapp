import { PreSurveyDashboard } from "@/components/dashboard/PreSurveyDashboard";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import btsLogo from "@/assets/black-tech-street-logo.png";

export default function PreSurvey() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <header className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Link to="/admin">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Portal
              </Button>
            </Link>
            <img 
              src={btsLogo} 
              alt="Black Tech Street Logo" 
              className="h-12 w-auto"
            />
          </div>
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">
              Pre-Survey Data
            </h1>
            <p className="text-lg text-muted-foreground">
              Baseline demographics and AI experience before the workshop
            </p>
          </div>
        </header>

        <PreSurveyDashboard />

        <footer className="mt-12 pt-8 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Black Tech Street. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
}
