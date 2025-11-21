
  # Motion Frontend
  Demo is live! The most current url will be in the About section of this repo on the right side of your screen ->

  React + Vite frontend for the Motion event platform. Users can create an account, verify their email, sign in, discover community events, search the web for events with AI, save favourites, and publish their own events.

  Motion talks to the Motion Backend (Cognito, API Gateway, Lambda). The following base URLs are baked into the app:

  - Core API: `https://qekks9l4k1.execute-api.us-east-2.amazonaws.com`
  - AI search: `https://uq65bozd66oybogxlvir2icqea0bzwxz.lambda-url.us-east-2.on.aws`

  Override them in a local `.env` file if your stage uses a different host or path:

  ```env
  VITE_API_BASE_URL=https://example.execute-api.us-east-2.amazonaws.com/prod
  VITE_API_SEARCH_AI_URL=https://example.lambda-url.us-east-2.on.aws
  ```

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
