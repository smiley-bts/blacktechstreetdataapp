import { Contact, getDisplayName, hasEventFeedback, hasBuildDayData } from "@/types/contact";
import { ContactFilter } from "@/types/contact";
import btsLogo from "@/assets/black-tech-street-logo.png";

interface PrintableReportProps {
  contacts: Contact[];
  filters: ContactFilter;
  title?: string;
}

export function PrintableReport({ contacts, filters, title = "Contact Report" }: PrintableReportProps) {
  const now = new Date();
  const formattedDate = now.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const formattedTime = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Calculate summary stats
  const withFeedback = contacts.filter(c => hasEventFeedback(c)).length;
  const withBuildDay = contacts.filter(c => hasBuildDayData(c)).length;
  const withEmail = contacts.filter(c => c.email).length;

  // Get active filters for display
  const activeFilters: string[] = [];
  if (filters.search) activeFilters.push(`Search: "${filters.search}"`);
  if (filters.lifecycleStage.length) activeFilters.push(`Lifecycle: ${filters.lifecycleStage.join(", ")}`);
  if (filters.aiExperienceLevel.length) activeFilters.push(`AI Level: ${filters.aiExperienceLevel.join(", ")}`);
  if (filters.dec6Workshop) activeFilters.push("Dec 6 Workshop");
  if (filters.dec13LTF) activeFilters.push("Dec 13 LTF");
  if (filters.sept27BuildDay) activeFilters.push("Sept 27 Build Day");
  if (filters.hasFeedback) activeFilters.push("Has Feedback");
  if (filters.hasProject) activeFilters.push("Has Project");
  if (filters.tags?.length) activeFilters.push(`Tags: ${filters.tags.join(", ")}`);

  return (
    <div className="print-report bg-white text-black p-8 max-w-[8.5in] mx-auto">
      {/* Header */}
      <header className="flex items-center justify-between border-b-2 border-black pb-4 mb-6">
        <div className="flex items-center gap-4">
          <img src={btsLogo} alt="Black Tech Street" className="h-12 w-auto print:filter-none" />
          <div>
            <h1 className="text-2xl font-bold text-black">{title}</h1>
            <p className="text-sm text-gray-600">Generated {formattedDate} at {formattedTime}</p>
          </div>
        </div>
        <div className="text-right text-sm text-gray-600">
          <p className="font-semibold text-black">{contacts.length} Contacts</p>
          <p>Black Tech Street CRM</p>
        </div>
      </header>

      {/* Summary Stats */}
      <section className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-100 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-black">{contacts.length}</p>
          <p className="text-sm text-gray-600">Total Contacts</p>
        </div>
        <div className="bg-gray-100 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-black">{withEmail}</p>
          <p className="text-sm text-gray-600">With Email</p>
        </div>
        <div className="bg-gray-100 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-black">{withFeedback}</p>
          <p className="text-sm text-gray-600">With Feedback</p>
        </div>
        <div className="bg-gray-100 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-black">{withBuildDay}</p>
          <p className="text-sm text-gray-600">Build Day Participants</p>
        </div>
      </section>

      {/* Applied Filters */}
      {activeFilters.length > 0 && (
        <section className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Applied Filters</h3>
          <div className="flex flex-wrap gap-2">
            {activeFilters.map((filter, i) => (
              <span key={i} className="px-2 py-1 bg-gray-200 rounded text-xs text-gray-700">
                {filter}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Contact Table */}
      <section>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-800 text-white">
              <th className="text-left p-2 font-semibold">#</th>
              <th className="text-left p-2 font-semibold">Name</th>
              <th className="text-left p-2 font-semibold">Email</th>
              <th className="text-left p-2 font-semibold">Company</th>
              <th className="text-left p-2 font-semibold">Location</th>
              <th className="text-left p-2 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {contacts.slice(0, 100).map((contact, index) => (
              <tr key={contact.recordId} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                <td className="p-2 border-b border-gray-200 text-gray-500">{index + 1}</td>
                <td className="p-2 border-b border-gray-200 font-medium">
                  {getDisplayName(contact)}
                </td>
                <td className="p-2 border-b border-gray-200 text-gray-600">
                  {contact.email || "-"}
                </td>
                <td className="p-2 border-b border-gray-200 text-gray-600">
                  {contact.companyName || "-"}
                </td>
                <td className="p-2 border-b border-gray-200 text-gray-600">
                  {[contact.city, contact.state].filter(Boolean).join(", ") || "-"}
                </td>
                <td className="p-2 border-b border-gray-200">
                  <span className="px-2 py-0.5 bg-gray-200 rounded text-xs">
                    {contact.lifecycleStage || "-"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {contacts.length > 100 && (
          <p className="text-sm text-gray-500 mt-4 text-center italic">
            Showing first 100 of {contacts.length} contacts
          </p>
        )}
      </section>

      {/* Footer */}
      <footer className="mt-8 pt-4 border-t border-gray-300 text-center text-xs text-gray-500">
        <p>This report was generated from the Black Tech Street CRM</p>
        <p className="mt-1">Confidential - For internal use only</p>
      </footer>
    </div>
  );
}

// Function to open print view in new window
export function openPrintView(contacts: Contact[], filters: ContactFilter, title?: string) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Please allow popups to print the report");
    return;
  }

  // Get the logo as base64 or use a data URL approach
  const logoUrl = new URL(btsLogo, window.location.origin).href;

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title || "Contact Report"} - Black Tech Street</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          color: #000;
          background: #fff;
          padding: 0.5in;
          font-size: 11px;
        }
        
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 2px solid #000;
          padding-bottom: 16px;
          margin-bottom: 24px;
        }
        
        .header-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        
        .header img {
          height: 48px;
          width: auto;
        }
        
        .header h1 {
          font-size: 24px;
          font-weight: bold;
          margin: 0;
        }
        
        .header p {
          font-size: 12px;
          color: #666;
          margin: 4px 0 0;
        }
        
        .header-right {
          text-align: right;
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }
        
        .stat-box {
          background: #f5f5f5;
          border-radius: 8px;
          padding: 16px;
          text-align: center;
        }
        
        .stat-box .number {
          font-size: 28px;
          font-weight: bold;
        }
        
        .stat-box .label {
          font-size: 11px;
          color: #666;
        }
        
        .filters {
          background: #f9f9f9;
          padding: 12px 16px;
          border-radius: 8px;
          margin-bottom: 24px;
        }
        
        .filters h3 {
          font-size: 12px;
          font-weight: 600;
          color: #555;
          margin-bottom: 8px;
        }
        
        .filter-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        
        .filter-tag {
          background: #e0e0e0;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 10px;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
        }
        
        thead tr {
          background: #1a1a1a;
          color: #fff;
        }
        
        th, td {
          text-align: left;
          padding: 8px 10px;
          border-bottom: 1px solid #ddd;
        }
        
        th {
          font-weight: 600;
          font-size: 11px;
        }
        
        tbody tr:nth-child(even) {
          background: #fafafa;
        }
        
        .status-badge {
          display: inline-block;
          background: #e0e0e0;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 10px;
        }
        
        .footer {
          margin-top: 32px;
          padding-top: 16px;
          border-top: 1px solid #ddd;
          text-align: center;
          font-size: 10px;
          color: #888;
        }
        
        .truncated-note {
          text-align: center;
          font-style: italic;
          color: #666;
          margin-top: 16px;
        }
        
        @media print {
          body { padding: 0; }
          .header img { filter: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="header-left">
          <img src="${logoUrl}" alt="Black Tech Street" />
          <div>
            <h1>${title || "Contact Report"}</h1>
            <p>Generated ${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })} at ${new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</p>
          </div>
        </div>
        <div class="header-right">
          <p style="font-weight: 600; color: #000;">${contacts.length} Contacts</p>
          <p>Black Tech Street CRM</p>
        </div>
      </div>
      
      <div class="stats-grid">
        <div class="stat-box">
          <div class="number">${contacts.length}</div>
          <div class="label">Total Contacts</div>
        </div>
        <div class="stat-box">
          <div class="number">${contacts.filter(c => c.email).length}</div>
          <div class="label">With Email</div>
        </div>
        <div class="stat-box">
          <div class="number">${contacts.filter(c => hasEventFeedback(c)).length}</div>
          <div class="label">With Feedback</div>
        </div>
        <div class="stat-box">
          <div class="number">${contacts.filter(c => hasBuildDayData(c)).length}</div>
          <div class="label">Build Day Participants</div>
        </div>
      </div>
      
      ${(() => {
        const activeFilters: string[] = [];
        if (filters.search) activeFilters.push(`Search: "${filters.search}"`);
        if (filters.lifecycleStage?.length) activeFilters.push(`Lifecycle: ${filters.lifecycleStage.join(", ")}`);
        if (filters.dec6Workshop) activeFilters.push("Dec 6 Workshop");
        if (filters.dec13LTF) activeFilters.push("Dec 13 LTF");
        if (filters.sept27BuildDay) activeFilters.push("Sept 27 Build Day");
        if (filters.hasFeedback) activeFilters.push("Has Feedback");
        if (filters.hasProject) activeFilters.push("Has Project");
        if (filters.tags?.length) activeFilters.push(`Tags: ${filters.tags.join(", ")}`);
        
        if (activeFilters.length === 0) return "";
        
        return `
          <div class="filters">
            <h3>Applied Filters</h3>
            <div class="filter-tags">
              ${activeFilters.map(f => `<span class="filter-tag">${f}</span>`).join("")}
            </div>
          </div>
        `;
      })()}
      
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Email</th>
            <th>Company</th>
            <th>Location</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${contacts.slice(0, 100).map((contact, index) => `
            <tr>
              <td style="color: #888;">${index + 1}</td>
              <td style="font-weight: 500;">${getDisplayName(contact)}</td>
              <td style="color: #555;">${contact.email || "-"}</td>
              <td style="color: #555;">${contact.companyName || "-"}</td>
              <td style="color: #555;">${[contact.city, contact.state].filter(Boolean).join(", ") || "-"}</td>
              <td><span class="status-badge">${contact.lifecycleStage || "-"}</span></td>
            </tr>
          `).join("")}
        </tbody>
      </table>
      
      ${contacts.length > 100 ? `
        <p class="truncated-note">Showing first 100 of ${contacts.length} contacts</p>
      ` : ""}
      
      <div class="footer">
        <p>This report was generated from the Black Tech Street CRM</p>
        <p style="margin-top: 4px;">Confidential - For internal use only</p>
      </div>
      
      <script>
        window.onload = function() {
          window.print();
        };
      </script>
    </body>
    </html>
  `);

  printWindow.document.close();
}
