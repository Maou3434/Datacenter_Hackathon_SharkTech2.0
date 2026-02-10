Setup Google Sign-in (client-side)

1. Create a Google Cloud OAuth 2.0 Client ID (type: Web application).
2. Add authorized origins (e.g., http://localhost:5173) and redirect URIs if needed.
3. Copy the client ID and create a `.env` file in `frontend/` mirroring `.env.example`:

VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
VITE_BACKEND_URL=http://localhost:5000

4. Start the frontend dev server:

```bash
cd frontend
npm install
npm run dev
```

Notes:
- This implementation uses Google Identity Services (client-side). Tokens are stored in `localStorage` for the session. For production, verify tokens server-side.
- The `/marketplace` route is protected; unauthenticated users will see a Google Sign-in button.
 - This repo now sends the ID token to the backend `POST /api/auth/signin` to create a server-side session cookie. Ensure the backend `GOOGLE_CLIENT_ID` matches the frontend `VITE_GOOGLE_CLIENT_ID` and that your Google OAuth client has the frontend origin listed under "Authorized JavaScript origins" (e.g. `http://localhost:3000`).
 - You do not need to add redirect URIs for Google Identity Services' token/one-tap approach, but you MUST add the frontend origin under Authorized JavaScript origins in the OAuth client settings.
