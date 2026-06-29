# CivicLens AI: Project Documentation

**CivicLens AI** is a modern, high-fidelity web platform designed to empower active citizens to audit, report, and validate local community infrastructure and environmental issues. Combining interactive GIS maps, crowdsourced validation, and algorithmic trust scoring, the application serves as a transparent civic ledger.

---

## 🗺️ Key Features

### 1. Interactive Civic Map
- **Map-First Interface**: Powered by high-performance Leaflet coordinates, allowing real-time panning, location tracking, and area auditing.
- **Dynamic Area Identification**: Instantly updates geographic focus with fluid visual status updates.
- **Multi-State Markers**: Colored beacons representing infrastructure faults, green area requests, road hazards, and environmental needs.

### 2. Civic Trust Balance Ledger
- **Multi-Dimensional Trust Scores**: A high-fidelity visual progress tracker and custom SVG radar chart inside the Profile view.
- **Score Indicators**:
  - **Accuracy (Reports Verified)**: Measurement of issues confirmed by other active citizens.
  - **Votes (Community Engagement)**: Active participation rate in validating reports.
  - **Consistency**: Historical auditing patterns and frequency.

### 3. Citizen Collaboration Engine
- **Instant Issue Reporting**: Streamlined submission sheets with customizable categories, urgency tiers, and description logs.
- **Crowdsourced Validation**: Quick upvote/downvote and verification triggers to confirm or flag community issues.
- **Dynamic Feedback**: Real-time toast notifications capturing interaction success and score gains.

### 4. Optimized Adaptability
- **Light & Dark Mode**: A unified visual state engine offering standard daylight mode or a refined, dark slate theme optimized for high readability and night-time field reports.
- **Responsive Navigation**: Compact utility drawers and adaptive viewports built desktop-first with elegant mobile layout scaling.

---

## 🛠️ Tech Stack & Structure

- **Frontend Framework**: React 18+ (TypeScript) built on Vite.
- **Interactive Map**: Leaflet JS with custom CartoDB tiles.
- **Styling**: Tailwind CSS utility classes with optimized variables for theme synchronization.
- **State Management**: React state hooks with client-side persistence (`localStorage`).
