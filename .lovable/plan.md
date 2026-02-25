

## Demo Mode for Admin Login

### What this does
Adds a "Demo Mode" button to the login page that bypasses authentication entirely and drops you into the admin dashboard with a mock admin profile. No credentials needed -- just click and go.

### How it works

1. **Auth.tsx** -- Add a "Enter Demo Mode" button below the login form that sets a `demo-mode` flag in localStorage and navigates to `/admin-dashboard`.

2. **useAuth.ts** -- When `demo-mode` is set in localStorage, return a fake user/profile with admin role so all protected routes pass. The mock profile will use display name "Demo Admin" with admin role.

3. **ProtectedRoute.tsx** -- No changes needed since it already checks `useAuth()` which will return the demo user.

4. **Logout behavior** -- When signing out, clear the `demo-mode` flag from localStorage so it doesn't persist.

### Technical details

**useAuth.ts changes:**
- At the top of the hook, check `localStorage.getItem('demo-mode')`
- If set, return a synthetic user object, skip all database calls, set `isAdmin: true`, `loading: false`
- In `signOut`, add `localStorage.removeItem('demo-mode')`

**Auth.tsx changes:**
- Add a `handleDemoMode` function that sets `localStorage.setItem('demo-mode', 'true')` and navigates to `/admin-dashboard`
- Render a secondary button labeled "Enter Demo Mode" with a muted style below the sign-in button
- Add a small note like "No credentials required" under the button

### Limitations
- Demo mode uses no real auth session, so any database operations requiring RLS authentication will fail
- Edge function calls that check auth tokens will not work
- This is purely for UI/navigation testing

