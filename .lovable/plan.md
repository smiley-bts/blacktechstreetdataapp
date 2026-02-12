

# CSV-First Event Attendance System with Actual vs. Non-Duplicate Tabs

## Overview

Since the CRM was wiped clean, we're rebuilding event tracking from the ground up using the uploaded CSV files as the **source of truth**. Each event will have its own attendance data parsed directly from CSV, with a tab system showing "Actual" (raw rows) vs "Non-Duplicate" (deduplicated unique individuals).

## Data Files to Import

| File | Event | Format | Key Details |
|------|-------|--------|-------------|
| `June_ASPIRE_Day_1.csv` | June ASPIRE Day 1 | First Name, Last Name, Attendance (Yes) | 109 raw rows, has dupes (e.g., Tiffany Brown, Phillipa Rosman appear twice) |
| `June_ASPIRE_2nd_Day_Attendance-2.xlsx` | June ASPIRE Day 2 | First Name, Last Name, Day 2 Attendance | ~80 raw rows, has dupes |
| `All_Attendance_No_Duplicates_.xlsx_-_June_ASPIRE_Day_2.csv` | June ASPIRE Day 2 (NonDupe) | First Name, Last Name, Attendance | 8 unique-to-Day-2 attendees |
| `Sept_27th_Attendance_...csv` | Sept 27 Build Day | Full check-in format with emails | 208 RSVPs, `Total check-ins >= 1` = attended |
| `ASPIRE_December_6th_Check_In_...csv` | Dec 6 Workshop | Full check-in format with emails | 144 rows, `Total check-ins >= 1` = attended |
| `ASPIRE_Lead_the_Future_...csv` | Dec 13 LTF | Student feedback submissions | 25 responses (youth event) |

## What "Actual vs NonDupe" Means

For each event, two views:
- **Actual**: Total raw attendance rows (including people who signed in multiple times or appear on multiple sheets)
- **Non-Duplicate**: Unique individuals only, deduplicated by name (case-insensitive, trimmed). For files with emails, deduplication is by email.

## Architecture

### New Files

1. **`src/hooks/useEventAttendanceCSV.ts`** -- A single hook that loads and parses all event attendance CSVs. Returns per-event data with both raw counts and deduplicated lists.

2. **`src/components/crm/EventAttendanceTabs.tsx`** -- A reusable component that renders "Actual" and "Non-Duplicate" tabs for any event, showing:
   - KPI cards (Actual count, NonDupe count, Duplicate rate)
   - Attendee name list in each tab

3. **Copy uploaded files to `public/attendance/`** -- All 6 files stored as CSVs in the public directory for client-side parsing.

### Modified Files

4. **`src/pages/EventBreakdown.tsx`** -- Refactor the event configs to pull from CSV data instead of the now-empty contacts table. Add the Actual/NonDupe tab component to each event view.

5. **`src/components/crm/EventsDashboard.tsx`** -- Update summary counts to use CSV-sourced data instead of contacts.

## Deduplication Logic

- **June Day 1**: Deduplicate by `(firstName + lastName)` lowercased/trimmed. Rows with "Attendance" in the third column are duplicates of existing "Yes" rows.
- **June Day 2**: Same name-based dedup. The separate "No Duplicates" file provides the 8 people who attended Day 2 but NOT Day 1 (cross-event dedup).
- **Sept 27**: Deduplicate by email (lowercased). Attended = `Total check-ins >= 1`.
- **Dec 6**: Deduplicate by email (lowercased). Attended = `Total check-ins >= 1`.
- **Dec 13 LTF**: Each feedback submission = 1 attendee (25 students). Already unique by Submission ID.

## Tab UI Per Event

Each event breakdown page will show:

```text
+------------------+--------------------+
| Actual (109)     | Non-Duplicate (87) |
+------------------+--------------------+

KPI Cards:
- Total Sign-ins: 109
- Unique Attendees: 87  
- Duplicate Rate: 20%

[Attendee List Table]
```

For multi-day events (June ASPIRE), sub-tabs for Day 1 and Day 2:

```text
+--------+--------+
| Day 1  | Day 2  |
+--------+--------+

Within each day:
+------------------+--------------------+
| Actual (109)     | Non-Duplicate (87) |
+------------------+--------------------+
```

## Technical Details

### File: `src/hooks/useEventAttendanceCSV.ts`
- Uses Papa Parse to load CSVs from `public/attendance/`
- Uses xlsx library for the June Day 2 xlsx file (converted to CSV first)
- Returns a structured object per event with `{ rawRows, deduplicatedRows, rawCount, dedupeCount }`
- Dedup key: email when available, otherwise `firstName+lastName` normalized

### File: `src/components/crm/EventAttendanceTabs.tsx`
- Takes `rawRows` and `deduplicatedRows` as props
- Renders Tabs component with "Actual" and "Non-Duplicate" triggers
- Each tab shows a simple table of names (and emails when available)
- KPI summary at top

### File: `src/pages/EventBreakdown.tsx`
- Remove dependency on `useContacts()` for attendance counts
- Import `useEventAttendanceCSV()` instead
- Integrate `EventAttendanceTabs` into each event's detail view
- Keep existing event configs but source counts from CSV data

### File: `public/attendance/` (new directory)
- `june-aspire-day1.csv`
- `june-aspire-day2.csv` (converted from xlsx)
- `june-aspire-day2-nodupe.csv`
- `sept27-attendance.csv`
- `dec6-attendance.csv`
- `ltf-dec13-feedback.csv`

