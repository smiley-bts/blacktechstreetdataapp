import { Link } from "react-router-dom";
import { PasswordGate } from "@/components/PasswordGate";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Users, ClipboardList, BarChart3, Rocket, Contact } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import btsLogo from "@/assets/black-tech-street-logo.png";

const dashboards = [
  {
    title: "Contact CRM",
    description: "Full contact management with search, filters, and detailed profiles - 3,300+ contacts",
    path: "/crm",
    icon: Contact,
    dataset: "contacts.csv",
  },
  {
    title: "Student Dashboard (LTF)",
    description: "Lead the Future workshop feedback - student experience and learning outcomes",
    path: "/",
    icon: Users,
    dataset: "aspire-ltf-feedback.csv",
  },
  {
    title: "ASPIRE Workshop Feedback",
    description: "Detailed workshop feedback including NPS scores, confidence changes, and participant insights",
    path: "/aspire-feedback",
    icon: ClipboardList,
    dataset: "aspire-feedback-survey.csv",
  },
  {
    title: "Pre-Survey Data",
    description: "Demographics, prior AI experience, and baseline confidence levels before the workshop",
    path: "/pre-survey",
    icon: BarChart3,
    dataset: "aspire-pre-survey.csv",
  },
  {
    title: "Build Day Projects",
    description: "Project submissions from ASPIRE Build Day - team solutions, websites, and presentations",
    path: "/build-day",
    icon: Rocket,
    dataset: "aspire-build-day-projects.csv",
  },
];

function AdminPortalContent() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <header className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <ThemeToggle />
            <img 
              src={btsLogo} 
              alt="Black Tech Street Logo" 
              className="h-16 w-auto"
            />
            <div className="w-9" /> {/* Spacer for balance */}
          </div>
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">
              ASPIRE Dashboard Portal
            </h1>
            <p className="text-lg text-muted-foreground">
              Select a dashboard to view
            </p>
          </div>
        </header>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
          {dashboards.map((dashboard) => (
            <Link key={dashboard.path} to={dashboard.path}>
              <Card className="h-full hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer group">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <dashboard.icon className="h-8 w-8 text-primary" />
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                  <CardTitle className="mt-4">{dashboard.title}</CardTitle>
                  <CardDescription>{dashboard.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground font-mono">
                    Data: {dashboard.dataset}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <footer className="mt-12 pt-8 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Black Tech Street. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
}

export default function AdminPortal() {
  return (
    <PasswordGate>
      <AdminPortalContent />
    </PasswordGate>
  );
}
