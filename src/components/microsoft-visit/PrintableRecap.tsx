import { forwardRef } from "react";
import btsBLogo from "@/assets/logos/bts-b-logo.png";

interface MeetingInsight {
  title: string;
  focus: string;
  themes: string[];
  insights: string[];
  signal: string;
}

interface CrossCuttingTheme {
  title: string;
  description: string;
}

interface PrintableRecapProps {
  meetingInsights: MeetingInsight[];
  crossCuttingThemes: CrossCuttingTheme[];
  risks: string[];
  opportunities: string[];
}

const PrintableRecap = forwardRef<HTMLDivElement, PrintableRecapProps>(
  ({ meetingInsights, crossCuttingThemes, risks, opportunities }, ref) => {
    return (
      <div ref={ref} className="hidden print:block bg-white text-black p-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8 border-b-2 border-emerald-600 pb-4">
          <img src={btsBLogo} alt="Black Tech Street" className="h-16 w-auto" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Microsoft Visit Recap</h1>
            <p className="text-gray-600">Black Tech Street | AI & Security Team Visit Insights</p>
          </div>
        </div>

        {/* Executive Summary */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-emerald-700 mb-3 border-b border-gray-200 pb-2">
            Executive Summary
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Across all meetings, the Microsoft visit reinforced a shared alignment around responsible AI, 
            ecosystem building, and Tulsa as a national testbed for applied AI and cybersecurity. 
            Stakeholders consistently framed Black Tech Street, ASPIRE, and the Greenwood AI Center of 
            Excellence as connective tissue between community, startups, institutions, and enterprise.
          </p>
          
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Microsoft Interest Areas:</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Early access to startups</li>
                <li>• Community-embedded pilots</li>
                <li>• Responsible AI guardrails</li>
                <li>• Talent and internship pipelines</li>
                <li>• Translating research into deployable solutions</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Local Partner Priorities:</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Coordination, not duplication</li>
                <li>• Trust, transparency, and historical responsibility</li>
                <li>• Long-term economic and social outcomes over hype</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Meeting Breakdowns */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-emerald-700 mb-3 border-b border-gray-200 pb-2">
            Meeting-by-Meeting Breakdown
          </h2>
          {meetingInsights.map((meeting, index) => (
            <div key={index} className="mb-6 page-break-inside-avoid">
              <h3 className="font-bold text-gray-900 mb-2">{meeting.title}</h3>
              <p className="text-sm text-gray-600 mb-2"><strong>Focus:</strong> {meeting.focus}</p>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-semibold text-gray-700 mb-1">Key Themes:</p>
                  <ul className="text-gray-600 space-y-0.5">
                    {meeting.themes.map((theme, i) => (
                      <li key={i}>• {theme}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-gray-700 mb-1">Notable Insights:</p>
                  <ul className="text-gray-600 space-y-0.5">
                    {meeting.insights.map((insight, i) => (
                      <li key={i}>• {insight}</li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="mt-2 bg-emerald-50 border-l-4 border-emerald-500 p-2">
                <p className="text-sm text-emerald-800"><strong>Strategic Signal:</strong> {meeting.signal}</p>
              </div>
            </div>
          ))}
        </section>

        {/* Cross-Cutting Themes */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-emerald-700 mb-3 border-b border-gray-200 pb-2">
            Cross-Cutting Themes
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {crossCuttingThemes.map((theme, index) => (
              <div key={index} className="text-sm">
                <h4 className="font-semibold text-gray-900">{theme.title}</h4>
                <p className="text-gray-600">{theme.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Risks & Opportunities */}
        <section className="mb-8">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-bold text-amber-600 mb-3 border-b border-gray-200 pb-2">
                Gaps & Risks
              </h2>
              <ul className="text-sm text-gray-600 space-y-1">
                {risks.map((risk, index) => (
                  <li key={index}>⚠ {risk}</li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-xl font-bold text-emerald-700 mb-3 border-b border-gray-200 pb-2">
                Strategic Opportunities
              </h2>
              <ul className="text-sm text-gray-600 space-y-1">
                {opportunities.map((opportunity, index) => (
                  <li key={index}>✓ {opportunity}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-gray-200 pt-4 text-center text-sm text-gray-500">
          <p>Generated from Black Tech Street Microsoft Visit Recap</p>
          <p>© {new Date().getFullYear()} Black Tech Street</p>
        </footer>
      </div>
    );
  }
);

PrintableRecap.displayName = "PrintableRecap";

export default PrintableRecap;
