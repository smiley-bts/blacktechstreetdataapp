import { LTFDashboard } from "@/components/dashboard/LTFDashboard";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img 
              src="/lovable-uploads/a4b70602-833d-4338-a498-ea07e4d5e926.png" 
              alt="Black Tech Street Logo" 
              className="h-16 w-auto"
            />
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">
            ASPIRE: Lead the Future with AI
          </h1>
          <p className="text-lg text-muted-foreground">
            Student Feedback Dashboard • December 13, 2025
          </p>
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

export default Index;
