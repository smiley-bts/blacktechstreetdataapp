import { LTFDashboard } from "@/components/dashboard/LTFDashboard";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import btsLogo from "@/assets/black-tech-street-logo.png";

const StudentDashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Link to="/">
              <Button variant="outline" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to CRM
              </Button>
            </Link>
            <img 
              src={btsLogo} 
              alt="Black Tech Street Logo" 
              className="h-16 w-auto"
            />
            <ThemeToggle />
          </div>
          <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">
            ASPIRE: Lead the Future with AI
          </h1>
            <p className="text-lg text-muted-foreground">
              Student Feedback Dashboard • December 13, 2025
            </p>
          </div>
        </header>

        <LTFDashboard />

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

export default StudentDashboard;
