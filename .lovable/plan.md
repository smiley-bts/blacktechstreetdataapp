

# Tech Hubs Q1 2026 Report Page (`/techhubsq12026`)

## Overview

A new standalone permalink page at `/techhubsq12026` that consolidates reporting data from the **December 6 ASPIRE Workshop** and **December 13 LTF (Lead the Future)** student event into a single, clean, Notion-inspired report. This page is designed to be shared with stakeholders and grant partners.

## Page Structure (matching the Notion layout)

The page will be a single, long-scroll document with a sticky table of contents sidebar (or anchor-link TOC on mobile), styled with a clean light/dark Notion aesthetic -- white/off-white cards, generous whitespace, readable typography.

### Sections (in order):

1. **Hero Banner** -- Circuit-art-style header image (reuse existing BTS assets like `tulsa-skyline-banner.png` or the gallery circuit image), with "Tech Hubs Q1 2026 Report" title and Black Tech Street logo.

2. **Table of Contents** -- Clickable anchor links to each section below:
   - ASPIRE Verbatims
   - Net Promoter Score
   - December 6 ASPIRE Workshop
   - December 13 LTF Student Workshop
   - ASPIRE Innovation Day Projects
   - Gallery

3. **ASPIRE Verbatims** -- Styled blockquote cards with participant testimonials pulled from the Dec 6 ASPIRE feedback CSV (the open-ended text fields). Each quote shows the text in italic with an attribution line ("- FirstName L.").

4. **Net Promoter Score (Combined)** -- A summary table showing NPS across the Dec events:
   - Row 1: Dec 6 ASPIRE Workshop (computed from `aspire-feedback-survey.csv` or the Dec 6 registration confidence data)
   - Row 2: Dec 13 LTF Student Workshop (computed from `aspire-ltf-feedback.csv`)
   - Each row shows: Score 5 count, Score 4 count, Score 3 count, Total Responses, NPS percentage
   - Uses the existing `NPSCard` component pattern but rendered as a clean table

5. **December 6 ASPIRE Workshop** -- Key metrics card (registrants, participants, attendance rate) pulled from the existing `Dec6AspireDashboard` data sources (`aspire-dec6-registration.csv` + `aspire-dec6-attendance.xlsx`). Compact version -- just the KPI cards and attendance rate, no full demographic drilldown.

6. **December 13 LTF Student Workshop** -- Key metrics (overall rating, engagement, content clarity, confidence before/after shift) from the existing `LTFDashboard` data source (`aspire-ltf-feedback.csv`). Compact version with the headline numbers.

7. **ASPIRE Innovation Day Projects** -- Cards for the 3 highlighted projects from the Notion page (Rise-Up Learning Hub, RV Revive Tulsa, Thrive Access Network). Static content cards with project name, brief description, and link to project files if available in `public/project-files/`.

8. **Gallery** -- Photo grid using existing Dec 6 gallery images (`aspire-dec6-01.jpg` through `aspire-dec6-05.jpg`).

## Design Style

- **Notion-inspired**: Clean, minimal, generous padding and whitespace
- Subtle card borders instead of heavy shadows
- Serif or display font for headings, clean sans-serif for body
- Uses the existing dark/light theme toggle
- Blockquote styling for verbatims (left border accent, slightly tinted background)
- Table styling for NPS comparison (clean borders, alternating row tint)

## Technical Details

### New Files

1. **`src/pages/TechHubsQ1Report.tsx`** -- Page component at `/techhubsq12026`. Renders the full report layout. Loads data from:
   - `aspire-dec6-registration.csv` + `aspire-dec6-attendance.xlsx` (Dec 6 metrics)
   - `aspire-ltf-feedback.csv` (LTF metrics and NPS)
   - Extracts verbatim quotes from feedback CSVs (open-ended response columns)

2. **`src/components/report/TechHubsReportContent.tsx`** -- Main content component containing all sections. Uses Papa Parse for CSV parsing and XLSX for the attendance spreadsheet (same pattern as existing dashboards).

### Modified Files

3. **`src/App.tsx`** -- Add route: `<Route path="/techhubsq12026" element={<TechHubsQ1Report />} />`

### Data Sources and NPS Calculation

The NPS for each event will be calculated using the same method as the existing dashboards:
- **Dec 6 ASPIRE**: Uses the overall rating question from feedback data. Rating 5 = Promoter, 4 = Passive, 1-3 = Detractor. NPS = %Promoters - %Detractors.
- **Dec 13 LTF**: Already calculated in `LTFDashboard` from `aspire-ltf-feedback.csv` using the same 5-point scale mapping.

Both NPS scores are displayed in a single comparison table, similar to the Notion page's NPS table format.

### Reused Patterns

- `Papa.parse` for CSV loading (same as all existing dashboards)
- `XLSX.read` for the Dec 6 attendance XLSX (same as `Dec6AspireDashboard`)
- `NPSCard` component styling for individual NPS display
- `MetricCard` component for KPI cards
- `ThemeToggle` for dark/light mode
- BTS logo header pattern (same as `Dec6Aspire.tsx`, `AspireLeadJan2026.tsx`)

### Verbatim Quote Extraction

The component will parse the feedback CSVs and extract non-empty values from open-ended columns (e.g., "What was the most valuable thing you learned?", "Any additional comments?"). It will display up to 8-10 curated quotes with first name + last initial attribution.

### Innovation Day Projects

Static content section with 3 project cards. Project names and descriptions are hardcoded based on the Notion page content (Rise-Up Learning Hub, RV Revive Tulsa, Thrive Access Network). Links to existing project files in `public/project-files/` where available.
