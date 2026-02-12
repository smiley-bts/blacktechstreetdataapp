

# Wipe and Re-import: Full Data Reset Plan

## Phase 1: Export Current Data (Immediate)

Before touching anything, we'll build a one-click export that downloads ALL current database data as a JSON backup file. This includes:

- **contacts** (3,243 records) -- the main data to preserve
- **contact_tags** (0 records)
- **contact_notes** (1 record)
- **contact_overrides** (0 records)
- **participants** (0 records)
- **participant_emails** (0 records)
- **event_attendance** (0 records)
- **merge_history** (0 records)
- **project_archives** (0 records)

**What we'll do:** Update the existing `exportAllData()` function in `useDataIntegrity.ts` to also include the legacy `contacts`, `contact_tags`, `contact_notes`, and `contact_overrides` tables. Then trigger the download immediately.

## Phase 2: Wipe All Tables

After the export is downloaded, we'll clear all data from every CRM-related table:

1. `contact_notes`
2. `contact_tags`
3. `contact_overrides`
4. `contacts`
5. `participant_emails`
6. `event_attendance`
7. `merge_history`
8. `participants`

Project archives will be left alone (they're project data, not contact/attendee data). We'll create a backend function to handle the bulk delete securely.

## Phase 3: Ready for Re-import

Once wiped, the system will be clean and ready for fresh CSV imports into the participant-centric tables.

---

## Technical Details

### File Changes

1. **`src/hooks/useDataIntegrity.ts`** -- Update `exportAllData()` to include legacy tables (`contacts`, `contact_tags`, `contact_notes`, `contact_overrides`) in the export payload.

2. **`supabase/functions/wipe-crm-data/index.ts`** -- New backend function that truncates all CRM tables in the correct order (respecting any implicit dependencies). Admin-only, authenticated.

3. **`supabase/config.toml`** -- Register the new edge function with `verify_jwt = false` (auth checked in code).

4. **`src/components/admin/DataIntegrityPanel.tsx`** -- Add a "Wipe All Data" button with a confirmation dialog that calls the new backend function.

### Rollback Strategy

If the new approach doesn't work out:
- Revert the code to a previous version using Lovable's history
- Re-import the downloaded JSON backup using the existing import tools or a simple script

