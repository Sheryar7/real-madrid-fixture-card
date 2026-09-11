# Real Madrid C.F. Match Center Card — Feature Rebuild

A high-performance, accessible, and responsive rebuild of the **Real Madrid C.F. Official Fixture & Match Center Card**. Built with Next.js 16 (App Router), TypeScript, Tailwind CSS, and powered by the Football-Data API.

---

## Features

- **Optimized Image Loading:** Leverages `next/image` with remote pattern domain configurations for external club crests (`crests.football-data.org`) to eliminate Layout Shifts (CLS).
- **Server-Side API Caching:** Next.js Route Handler (`/api/matches`) caches upstream responses for 5 minutes (`revalidate: 300`) to strictly adhere to Football-Data API free-tier rate limits (10 requests/minute).
- **Live / In-Play Match Engine:** Visual status indicators including pulsing red badges for `IN_PLAY`, `PAUSED`, and `LIVE` match states.
- **Reviewer Test Controls:** Interactive state switcher in the UI to force and test `Default`, `Loading`, `Error`, and `Empty` state representations on demand.
- **Accessibility & Mobile First:** Full keyboard accessibility (`Tab`, `Enter`, `Escape` modal trapping), backdrop scroll locking (`overflow: hidden`), and minimum 44×44px touch target compliance for mobile interactions.

---

## Tech Stack

- **Framework:** Next.js 16 (App Router with Turbopack)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **API:** Football-Data API v4

---

## Getting Started

### 1. Prerequisites
Ensure you have **Node.js 18.x** or higher installed on your system.

### 2. Environment Setup
Create a `.env.local` file in the root directory of the project and add your Football-Data API key:

```env
FOOTBALL_DATA_API_KEY=your_actual_api_key_here
```

### 3. Installation & Local Execution
Run the following commands in your terminal:

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

## Production Build & Verification
To verify the production build locally:

```bash
npm run build
npm run start
```

# Comparison with Original Feature

## Feature Rebuilt
Real Madrid C.F. Official Match Center & Fixture Card — A focused experience for browsing upcoming fixtures, finished scores, live match indicators, team crests, venues, and detailed match metadata.

## Omissions and Rationale
-**Full League Tables & Player Statistics:** Omitted to concentrate strictly on delivering a bulletproof, accessible fixture card component without unnecessary scope creep.
- **Ticketing & Checkout Workflows:** Omitted as third-party ticketing requires authenticated, external payment flows outside the scope of a single-feature UI rebuild.

## Key Improvements
- **Interactive Reviewer Test Controls:** Added a dedicated toolbar allowing reviewers to instantly toggle between Default, Loading, Error, and Empty UI states without modifying code or forcing network errors.
- **Enhanced Mobile Touch Targets & Accessibility:** Implemented strict keyboard trap controls (Escape to close modals), visible focus outlines, and minimum 44×44px touch targets across all interactive elements, exceeding the mobile usability standards of the original feature.