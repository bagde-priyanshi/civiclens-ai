<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />

# CivicLens AI
**Real-time civic audit platform with geospatial mapping and gamified trust scoring**

🔗 [Live Demo](https://civiclens-ai-616275286275.asia-southeast1.run.app)
</div>

---

## What it does
CivicLens AI is a community-driven urban accountability platform where citizens can report, review, and verify municipal issues — potholes, broken streetlights, sanitation blockages, and more. Every contribution builds your **Civic Trust Score**, turning responsible citizenship into an engaging, gamified experience.

## Features
- 🗺️ **Live Geospatial Ledger Map** — Real-time civic issue pins powered by Leaflet.js with intelligent regional snapping across major cities (Mumbai, London, Tokyo, New York, and more)
- 🎯 **Civic Trust Engine** — Dynamic Trust Score (0–100) calculated from verified reports, community votes, and consistency rating
- 📊 **Dashboard & Leaderboard** — Sliding analytics drawer with ledger logs and citizen rankings
- 🗳️ **Community Voting** — Upvote or flag issues reported by other citizens to maintain ledger integrity
- 🌗 **Light & Dark Theme** — Warm Slate design system with CartoDB map tiles adapting to both modes
- 🔔 **Toast Notifications** — Stacked real-time alerts for civic actions and ledger updates

## Tech Stack
| Layer | Technology |
|---|---|
| Frontend | React 18+ (TypeScript) |
| Build Tool | Vite |
| Styling | Tailwind CSS |
| Maps | Leaflet.js |
| Animations | Framer Motion |
| Icons | Lucide React |
| AI | Google Gemini API |
| Deployment | Google Cloud Run |

## Project Structure
src/

├── App.tsx                  # Main controller, map state, region managers

├── index.css                # Tailwind directives and dark mode layers

├── types.ts                 # TypeScript data structures

└── components/

├── Navbar.tsx           # Municipal navigation, search, theme toggle

├── ProfileModal.tsx     # Trust Score radar chart and stats

├── DashboardDrawer.tsx  # Analytics, leaderboard, ledger logs

├── IssueDetailSheet.tsx # Issue details and community voting

├── ToastContainer.tsx   # Notification system

└── HelpGuideModal.tsx   # Onboarding guide
## Run Locally
**Prerequisites:** Node.js

1. Install dependencies:
```bash
   npm install
```

2. Set your Gemini API key in `.env.local`:
GEMINI_API_KEY=your_key_here

3. Start the app:
```bash
   npm run dev
```

## Built At
Vibe2Ship — 29 June 2026
