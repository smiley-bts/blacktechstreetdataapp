import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import btsLogo from "@/assets/black-tech-street-logo.png";
import { ASPIREWorkshopDashboard } from "./ASPIREWorkshopDashboard";
import { LTFDashboard } from "./LTFDashboard";

export function DashboardTabs() {
  return (
    <div className="min-h-screen bg-background p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8 animate-fade-in">
          <div className="flex items-center gap-4 mb-4">
            <img src={btsLogo} alt="Black Tech Street" className="h-12 w-auto" />
          </div>
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">ASPIRE Workshop Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive feedback insights from workshop participants
          </p>
        </header>

        {/* Tabs */}
        <Tabs defaultValue="aspire-main" className="w-full">
          <TabsList className="mb-6 bg-muted/50 border border-border">
            <TabsTrigger value="aspire-main" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              ASPIRE Workshop
            </TabsTrigger>
            <TabsTrigger value="ltf-1213" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              12/13/25 LTF
            </TabsTrigger>
          </TabsList>

          <TabsContent value="aspire-main">
            <ASPIREWorkshopDashboard />
          </TabsContent>

          <TabsContent value="ltf-1213">
            <LTFDashboard />
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <footer className="mt-12 text-center text-sm text-muted-foreground">
          <p>ASPIRE Workshop Feedback Dashboard</p>
        </footer>
      </div>
    </div>
  );
}
