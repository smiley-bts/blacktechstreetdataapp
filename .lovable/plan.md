

# AI Data Assistant for the CRM

## What You'll Get

A ChatGPT-style AI assistant tab in the CRM that can answer natural language questions about your program data -- sign-ups, attendance, demographics, and the G-ACE quarterly report. It will know the difference between registrants (who signed up) and attendees (who actually showed up).

Examples of questions it can answer:
- "How many people signed up for the June ASPIRE but didn't attend?"
- "What's the racial breakdown of Dec 6 attendees?"
- "How many unique individuals achieved AI fluency?" (G-ACE Q25)
- "What percentage of Sept 27 registrants were working professionals?"
- "Show me the income distribution of all registrants across events"

## Data Architecture

### Sign-Up CSVs (New -- Registrants who may or may not have attended)

| File | Event | Records |
|------|-------|---------|
| June sign-up CSV | June ASPIRE | ~350 registrants |
| Sept 27 sign-up CSV | Sept 27 Build Day | ~155 registrants |
| Dec 6 registration CSV | Dec 6 Workshop | ~183 registrants |

These will be stored in `public/signups/` separately from the attendance files in `public/attendance/`.

### Existing Attendance CSVs (Already uploaded)
- June Day 1, Day 2, Day 2 NoDupe
- Sept 27 check-in
- Dec 6 check-in
- Dec 13 LTF feedback

### G-ACE Quarterly Report
The PDF content (questions 24-73 about community impact, demographics, cohorts, workforce readiness) will be embedded as a text file for the AI to reference.

## How It Works

1. When a user asks a question, the frontend sends their message to a backend function
2. The backend function loads all the CSV/text data, builds a structured context summary, and sends it along with the user's question to the AI
3. The AI streams back a response token-by-token, displayed in real time
4. The chatbot maintains conversation history so follow-up questions work naturally

## New Files

### 1. `public/signups/june-aspire-signup.csv`
Copy of the uploaded June sign-up file.

### 2. `public/signups/sept27-signup.csv`
Copy of the uploaded Sept 27 sign-up file.

### 3. `public/signups/dec6-registration.csv`
Copy of the uploaded Dec 6 registration file.

### 4. `public/signups/g-ace-quarterly-report.txt`
Plain text extraction of the G-ACE PDF (questions 24-73 about participant demographics, AI fluency, digital literacy, cohorts, workforce readiness).

### 5. `supabase/functions/chat/index.ts`
Backend function that:
- Receives user messages
- Loads and summarizes all CSV data (sign-ups, attendance) into a structured context
- Pre-computes key metrics: registrant counts, attendee counts, no-show counts, demographic breakdowns per event
- Sends context + conversation to the Lovable AI Gateway (google/gemini-3-flash-preview)
- Streams the response back via SSE
- Handles 429/402 rate limit errors gracefully

### 6. `src/components/crm/AIChatPanel.tsx`
A ChatGPT-style UI component with:
- Message history display with user/assistant bubbles
- Markdown rendering for AI responses (tables, lists, bold)
- Streaming token-by-token display
- Text input with send button
- Loading indicator while AI is thinking
- Suggested starter questions (e.g., "Who signed up but didn't attend June ASPIRE?")

### 7. `src/hooks/useAIChat.ts`
React hook managing:
- Message state (conversation history)
- SSE streaming logic
- Loading/error states
- Rate limit error handling with toast notifications

## Modified Files

### 8. `src/components/crm/CRMDashboard.tsx`
- Add an "AI Assistant" tab (8th tab) with a Bot/Sparkles icon
- Position it after Reports tab
- Renders `<AIChatPanel />`

### 9. `supabase/config.toml`
- Register the new `chat` function with `verify_jwt = false`

## AI Context Strategy

The backend function will pre-compute a data summary before each AI call. This avoids sending raw CSV rows (which would blow up the context window) and instead sends a structured briefing like:

```
ASPIRE PROGRAM DATA SUMMARY:

JUNE ASPIRE (June 27-28, 2025):
- Registrants: 348 unique sign-ups
- Day 1 Attendees: 87 unique
- Day 2 Attendees: 72 unique  
- No-shows: 261 (75% drop-off)
- Demographics (Registrants): 
  Age: 25-34 (28%), 35-44 (35%), 45-54 (22%)...
  Race: Black/African American (72%), White (8%)...
  Role: Working Professional (40%), Entrepreneur (25%)...
  Income: $25k-$49k (30%), $50k-$74k (25%)...

SEPT 27 BUILD DAY:
- Registrants: 155 sign-ups
- Attendees: 68 unique (check-ins >= 1)
...

G-ACE QUARTERLY REPORT (Q24-73):
[Full text of questions and answers]
```

This keeps the AI context efficient (~3-5K tokens) while giving it everything it needs to answer questions accurately.
