
# CRM Homepage and Tab Redesign

## The Problem

The CRM currently has 8 tabs, but most of them show empty data because the database was wiped. The Overview, Contacts, and Attendees tabs all query empty database tables while the real data lives in CSV files. This creates a confusing experience where some tabs work (Events, AI Assistant) and others show zeros.

## Verified Data Counts

Here are the confirmed numbers from the actual CSV files:

### Sign-Up / Registration Data (public/signups/)
| Event | File Lines | Registrants (approx) |
|-------|-----------|---------------------|
| June ASPIRE (June 27-28) | 351 lines | ~307 unique registrants |
| Sept 27 Build Day | 156 lines | ~152 registrants |
| Dec 6 Workshop | 184 lines | ~180 registrants |

### Attendance Data (public/attendance/)
| Event | File Lines | Notes |
|-------|-----------|-------|
| June Day 1 | 110 lines | Name-based dedup (~109 sign-ins) |
| June Day 2 | Separate file | Name-based dedup |
| June Combined | Both days merged | ~79 unique attendees (name dedup) |
| Sept 27 | 209 lines | Email-based dedup, checkins >= 1 filter |
| Dec 6 | Separate file | Email-based dedup, checkins >= 1 filter |
| LTF Dec 13 | Feedback submissions | Each submission = 1 attendee |

### Cross-Referenced (Registrants vs Attendees)
These numbers are computed at runtime by matching sign-up emails/names against attendance records. The AI Assistant previously confirmed:
- June: ~307 registrants, ~79 unique attendees, ~228 no-shows
- Dec 6: ~151 registrants with demographic data, ~58% Black/African American

## Redesigned Tab Structure

Simplify from 8 tabs down to 5 focused tabs:

```text
[ Dashboard ]  [ Events ]  [ People ]  [ AI Assistant ]  [ Reports ]
```

### Tab 1: Dashboard (replaces "Overview")
The homepage. Pulls all KPIs directly from CSV data instead of the empty database.

**New KPI cards (CSV-sourced):**
- Total Registrants (across all 3 events)
- Total Unique Attendees (across all events)
- Overall Attendance Rate (attendees / registrants)
- Total Events Held (4)

**Charts section:**
- Attendance funnel: Registrants -> Attendees per event (horizontal bar)
- Demographic snapshot: Top-level race and role breakdown across all registrants

**Quick links:** Jump to any event, open AI Assistant

### Tab 2: Events (keep as-is, mostly working)
The existing EventsDashboard with the timeline cards. Already CSV-sourced and functional. Each card links to /events/{eventKey} for breakdowns with demographic comparison charts.

One addition: show registrant count alongside attendee count on each event card (currently only shows attendees).

### Tab 3: People (merge of Contacts + Attendees)
A single searchable table combining:
- Registrant data from sign-up CSVs (name, email, phone, demographics)
- Attendance status per event (attended/no-show)
- Source tag (which sign-up form they came from)

This replaces the broken "Contacts" and "Attendees" tabs. Filter by event, by attendance status (attended vs no-show), by demographic fields.

### Tab 4: AI Assistant (keep as-is, working)
The existing AIChatPanel. No changes needed.

### Tab 5: Reports (keep, but simplify)
Keep the SavedReports component and add a quick "Grant Summary" card that shows key G-ACE metrics pulled from the quarterly report text file.

## Removed/Merged Tabs
- **Attendees tab** -> merged into People
- **Contacts tab** -> merged into People
- **Feedback tab** -> accessible from event breakdown pages (already works at /dec6aspire, etc.)
- **Projects tab** -> accessible from event breakdown pages and Reports

## Technical Changes

### New Files
1. **src/hooks/useCSVDashboardMetrics.ts** - Hook that loads all sign-up and attendance CSVs, computes aggregate KPIs (total registrants, total attendees, attendance rates, demographic summaries) using Papa Parse. Single source of truth for the Dashboard tab.

2. **src/components/crm/CSVDashboardHero.tsx** - Replacement for DashboardHero that renders KPI cards from useCSVDashboardMetrics instead of querying the empty database.

3. **src/components/crm/AttendanceFunnelChart.tsx** - Recharts horizontal bar chart showing registrants vs attendees per event.

4. **src/components/crm/PeopleDashboard.tsx** - New unified people table. Loads all 3 sign-up CSVs, cross-references with attendance CSVs, and displays a searchable/filterable table with columns: Name, Email, Events Registered, Events Attended, Role, Age, Race. Includes filters for event and attendance status.

### Modified Files
5. **src/components/crm/CRMDashboard.tsx** - Major refactor:
   - Remove tabs: attendees, contacts, feedback, projects
   - Rename "overview" to "dashboard"
   - Add "people" tab
   - Simplify header (remove broken database-dependent actions: Sync All, Auto-merge, Import, Deduplication)
   - Remove dependencies on useContacts, useAutoDeduplication, useEventAutoSync (database-dependent hooks)
   - Reduce TabsList from 8 columns to 5

6. **src/components/crm/EventsDashboard.tsx** - Add registrant count from sign-up CSVs alongside existing attendee count on each event card. Show "X registered, Y attended" format.

7. **src/components/crm/QuickStats.tsx** - Refactor to use useCSVDashboardMetrics instead of useParticipantMetrics (which queries empty database).

### Unchanged Files
- AIChatPanel.tsx (working)
- useAIChat.ts (working)
- useEventAttendanceCSV.ts (working)
- useSignupDemographics.ts (working)
- DemographicComparisonCharts.tsx (working)
- All event breakdown pages (working)
