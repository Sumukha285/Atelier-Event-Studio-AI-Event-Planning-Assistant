# Atelier Event Studio — GenAI-Powered Event Planning Assistant

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Google GenAI SDK](https://img.shields.io/badge/Google_GenAI_SDK-@google/genai-4285F4?logo=google&logoColor=white)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

**Atelier Event Studio** is an enterprise-grade, zero-trust, GenAI-powered event planning web application built to help users organize **Weddings, Birthdays, and Community Events**. Powered by **Google AI Studio** and the **Google GenAI SDK (`@google/genai`)**, the platform transforms high-level event constraints into a structured, actionable execution blueprint—complete with bespoke creative concepts, proportional budget ledgers, backwards-planned timelines, and vendor vetting checklists.

---

## Key Features & Problem Alignment

### 1. Personalized Concept & Ideation Studio (`IdeationSection.tsx`)
* **Multi-Event Support:** Pre-configured presets and tailored AI generation for **Weddings**, **Birthdays**, and **Community Events**.
* **AI Theme Packages:** Generates 3 distinct, customizable concept packages based on guest count, location setting, target date, and vibe.
* **Visual & Culinary Styling:** Each concept includes a 4-color hex palette (rendered as interactive swatches), decor styling, catering/menu ideas, and guest entertainment activities.

### 2. Smart Budget Allocator & Ledger (`BudgetSection.tsx`)
* **Proportional Financial Modeling:** Automatically distributes the total budget across event-specific categories (e.g., prioritizing Venue & Catering for Weddings, or Permits, Audio/Visual, and Crowd Logistics for Community Events).
* **10% Contingency Guardrail:** Automatically reserves a mandatory 10% contingency buffer to protect against unexpected costs.
* **Real-Time Variance Tracking:** Tracks *Estimated* vs. *Actual* spend using integer-cent precision math (`Math.round(val * 100) / 100`) to prevent IEEE 754 floating-point drift, paired with an **AI Rebalance** feature for cost-saving DIY suggestions.

### 3. Chronological Timeline & Run-of-Show (`TimelineSection.tsx`)
* **Backwards-Planned Countdown:** Generates milestone checklists across *6 Months, 3 Months, 1 Month, and 1 Week Out*, tagged with priority levels (`CRITICAL`, `HIGH`, `NORMAL`).
* **Day-Of Itinerary:** Builds an hour-by-hour execution schedule covering vendor load-in, main ceremonies/activities, catering service, and teardown.

### 4. Vendor Checklist & Compliance Vetting Engine (`VendorSection.tsx`)
* **AI Vetting Questions & Red Flags:** Generates 3–5 custom vetting questions and contract red flags (e.g., overtime fees, cancellation clauses, weather backups) per vendor category.
* **Municipal & Safety Compliance:** Dynamically injects local permit, noise ordinance, sanitation, and crowd-safety checklists for **Community Events**.

### 5. Contextual Event Co-Pilot (`CoPilotDrawer.tsx`)
* **State-Aware AI Assistant:** A slide-out conversational drawer that reads a compressed snapshot of the active event state (remaining budget, pending tasks, shortlisted vendors) to answer custom planning questions and draft vendor inquiry emails.

### 6. Master Plan Export & Self-Diagnostics (`ExportModal.tsx` & `DiagnosticsModal.tsx`)
* **One-Click Plan Export:** Exports the complete event blueprint to clean Markdown or JSON for sharing with family, clients, or organizing committees.
* **In-App Diagnostics Runner:** Includes a built-in diagnostic verification modal and automated unit test suite verifying security sanitization, budget math, and state transitions.

---

## System Architecture

```mermaid
graph TD
    User([User / Event Planner]) --> App[App.tsx + ErrorBoundary]
    App --> Hook[useEventPlanner Hook / State Machine]
    
    subgraph UI_Modules [Modular View Layer]
        App --> Sidebar[AppSidebar.tsx]
        App --> Header[AppHeaderBar.tsx]
        App --> Ideation[IdeationSection.tsx]
        App --> Budget[BudgetSection.tsx]
        App --> Timeline[TimelineSection.tsx]
        App --> Vendor[VendorSection.tsx]
        App --> CoPilot[CoPilotDrawer.tsx]
        App --> Modals[ExportModal / DiagnosticsModal]
    end

    Hook --> Security[security.utils.ts: XSS Strip + XML Sandboxing + Clamping]
    Hook --> Domain[domain.utils.ts: O-N Single-Pass Memoized Math]
    Hook --> Storage[(Safe Schema-Validated localStorage)]
    
    Security --> GeminiService[gemini.service.ts]
    GeminiService --> Cache{O-1 Parameter Hash Cache}
    Cache -- Cache Hit 0ms --> Hook
    Cache -- Cache Miss --> SDK[@google/genai SDK + responseSchema]
    SDK --> GeminiAPI((Google Gemini 2.5 Flash / Pro))




Getting Started
Prerequisites
Node.js >= 18.x

A Google Gemini API Key from Google AI Studio

Installation & Local Development
Clone the repository:

Bash
git clone [https://github.com/your-username/atelier-event-studio.git](https://github.com/your-username/atelier-event-studio.git)
cd atelier-event-studio
Install dependencies:

Bash
npm install
Configure environment variables:
Create a .env file in the project root and add your Gemini API key:

Code snippet
GEMINI_API_KEY=your_google_gemini_api_key_here
Start the development server:

Bash
npm run dev
Run the automated test suite:

Bash
npm test
License
Licensed under the Apache License 2.0. See the LICENSE file for details.


<FollowUp label="Want a concise GitHub repository 'About' description and topic tags to pair
