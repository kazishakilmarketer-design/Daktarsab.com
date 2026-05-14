

# ডাক্তার সাব (Doctor Saab) — Health-Tech SaaS App

## Overview
A trusted digital clinic experience for Bangladeshi users — a mobile-first AI health consultation app with a professional medical UI themed in Emerald and Soft Slate.

---

## Pages & Layout

### 1. Main App Layout
- **Header**: Centered "ডাক্তার সাব" logo/branding with medical emerald theme. A circular "Character Slot" frame on the top-right for the AI doctor avatar (placeholder for your custom image upload).
- **Responsive layout**: On desktop, a sidebar + chat + results panel side-by-side. On mobile, sidebar collapses into a top sheet/drawer, results appear as a bottom sheet.

### 2. Patient Profile Sidebar
A clean card-based form with:
- **Age** input field
- **Gender** selector (পুরুষ/মহিলা/অন্যান্য)
- **Location** dropdown — District/Area selection
- **Monthly Income Slider** — determines treatment tier (সরকারি/মাঝারি/প্রিমিয়াম)
- All values stored in React state, ready for future API integration

### 3. Main Chat Interface
- Modern chat window with message bubbles
  - **User messages**: Right-aligned, blue bubbles
  - **Doctor Saab messages**: Left-aligned, white/emerald bubbles with the doctor avatar
- Chat input bar at the bottom with send button
- **Quick Action buttons** below input: "জরুরি সাহায্য", "কাছের হাসপাতাল", "টেস্টের খরচ"
- Smooth animated entry for new chat bubbles
- Placeholder/mock responses to demonstrate the flow

### 4. Results Panel (Dynamic)
A slide-over panel (desktop) / bottom sheet (mobile) triggered by chat actions, showing:
- **Specialist Recommendation** card
- **Hospital List** filtered by user's income tier and location
- **Cost Estimation Table** for recommended medical tests
- Animated entry for result cards

---

## Design & Theme
- **Primary color**: Medical Emerald (#10b981) with soft slate backgrounds
- **Typography**: Clean, readable — supporting Bangla text throughout
- **Cards & shadows**: Soft elevation for a clinical, trustworthy feel
- **Mobile-first**: Optimized for Bangladeshi mobile users

## Animations
- Smooth fade/slide-in for chat bubbles using Framer Motion
- Animated slide-over for results panel
- Subtle hover effects on quick action buttons

## Technical Notes
- All user inputs (age, gender, location, income) managed via React hooks, ready for Gemini API integration
- Clear placeholder functions and comments marking API integration points
- Mock data for hospitals, costs, and specialist recommendations to demonstrate the UI
- No backend needed initially — purely frontend with state management

