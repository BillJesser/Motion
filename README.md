
  # Motion Frontend

  React + Vite frontend for the Motion event platform. Users can create an account, verify their email, sign in, discover community events, search the web for events with AI, save favourites, and publish their own events.

  Deployed preview: https://motion-eight-silk.vercel.app/signin

  ## Getting started

  ```bash
  npm install
  npm run dev
  ```

  The dev server runs on http://localhost:5173 by default.

  ## Features

  - Full Cognito auth flow (signup, verify code, sign in, forgot/reset password)
  - Persistent sessions with automatic logout when tokens expire
  - Protected application shell with navigation for:
    - Discover (community events + AI sourced events with long-running progress indicator)
    - Saved events (manage motion + AI bookmarks)
    - My events (events created by the signed-in user)
    - Create event (publish a new community event)
  - API integrations covering every endpoint in the provided backend contract
  - Optional geolocation to search near the user’s current position
  - Centralised fetch helper that attaches the correct base URL and bearer tokens

  ## File tour

  - `src/api/` – typed wrappers around backend endpoints
  - `src/context/AuthContext.tsx` – auth state, token persistence, and helper actions
  - `src/layouts/AppLayout.tsx` – authenticated shell + navigation
  - `src/pages/app/` – screen-level components for discover, saved, my events, and creation flows
  - `src/components/events/` – shared cards for Motion + AI events

  ## Notes

  - The AI search endpoint can take a minute. The UI shows a long-running progress bar while waiting.
  - Saved AI events are tracked locally by source URL/title so the Discover page knows when you’ve already stored one.
  - Coordinates are optional when creating events. If omitted, the backend geocodes the address.
