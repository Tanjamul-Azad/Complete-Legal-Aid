<!--  ================================
      COMPLETE LEGAL AID – README
      ================================  -->

<div align="center">

<img src="https://img.shields.io/badge/Complete%20Legal%20Aid-CLA-1d3557?style=for-the-badge&logo=scale&logoColor=white" />

<br/><br/>

[![Typing SVG](https://readme-typing-svg.demolab.com?font=Fira+Code&weight=500&size=24&pause=1200&center=true&vCenter=true&width=800&lines=A+Digital+Justice+Bridge+for+Bangladesh;Verified+Lawyers+%7C+AI+Legal+Guide+%7C+Secure+Evidence+Vault;Emergency+Legal+Help+%7C+Case+Tracking+%7C+Citizen+First)](https://github.com/Tanjamul-Azad/Complete-Legal-Aid-CLA-)

<br/>

<img src="https://img.shields.io/github/stars/Tanjamul-Azad/Complete-Legal-Aid-CLA-?style=social" />
<img src="https://img.shields.io/github/forks/Tanjamul-Azad/Complete-Legal-Aid-CLA-?style=social" />

</div>

---

## ✨ Project Overview

**Complete Legal Aid (CLA)** is a **Legal & Judicial Communication Platform** that connects citizens, lawyers, NGOs, and (future) government agencies in a single digital hub.

The platform focuses on:

- ⚖️ **Accessible legal help** – simple flows for people with low tech/legal literacy  
- 🤝 **Trust & verification** – verified lawyer profiles, ratings, and transparent workflows  
- 🔐 **Privacy & safety** – secure evidence vault, role-based access, and emergency help  
- 🧠 **AI assistance** – bilingual (Bangla + English) legal explanations & smart guidance  

---

## 🚀 Core Features

### 🧑‍💼 For Citizens (Clients)

- 🔍 **Verified Lawyer Directory**
  - Filter by specialization (family, labor, criminal, cyber, etc.)
  - See ratings, reviews, experience, availability & languages  

- 📅 **Consultation Booking**
  - Book **in-person**, **phone**, or **video** sessions  
  - Real-time availability, reminders, and status updates  

- 📂 **Secure Evidence Vault**
  - Encrypted uploads (documents, images, audio, screenshots, etc.)
  - Evidence linked to cases; only visible to authorized lawyers  

- 📡 **Emergency Legal Helpline**
  - One-tap emergency reporting (e.g. police misconduct, domestic violence)
  - Optional anonymous reporting for safety  

- 📊 **Case Tracking Dashboard**
  - Real-time case status with timeline, milestones & next actions  
  - Central place for messages, files, and updates  

- 🤖 **AI Legal Assistant (BicharBot)**
  - Explains legal rights & laws in **simple Bangla + English**
  - Suggests relevant sections (e.g., Labour Act, DSA)  
  - Helps users prepare before meeting a lawyer  

---

### ⚖️ For Lawyers

- 📁 **Case Intake & Management**
  - See assigned cases with full client context, documents & history  
  - Structured status flow: Submitted → In Review → Scheduled → Resolved  

- 🗓️ **Consultation Management**
  - Set availability slots; manage appointment approvals  
  - Log call/meeting outcomes directly to each case  

- 💳 **Billing & Packages (MVP Toggle)**
  - Define service packages (consult-only, drafting, full representation)  
  - Track invoices & payment status (manual now, gateway-ready later)  

- 👩‍⚖️ **Lawyer Dashboard**
  - Overview of cases, workload, upcoming consultations  
  - License/renewal reminders (Bar Council, practice certificates, etc.)  

---

### 🛡️ For Admin / Platform Owners

- 📊 **Admin Console**
  - Manage users, roles, case categories, templates, feature flags  
  - Approve lawyers & handle reported issues  

- 📈 **Analytics & Reports**
  - KPIs: active cases, assignment time, SLA breaches, platform usage  
  - Export data (CSV) for reporting & research  

- 🧾 **Compliance & Audit**
  - Full audit logs (who did what, when, on which record)  
  - Configurable data retention and export policies  

---

## 🧠 Architecture & Concepts (MVP)

> Frontend-focused implementation with backend-ready structure

- React + TypeScript SPA (Vite)
- Context-based global state for:
  - Auth & roles (citizen, lawyer, admin)
  - Cases, appointments, notifications
  - UI state (modals, toasts, theme)
- Service layer (`services/*.ts`) to plug into real backend APIs later
- Components organized by domain (`citizen/`, `lawyer/`, `admin/`, `dashboard/`)

---

## 🛠️ Tech Stack

**Frontend**

- ⚛️ **React** (with TypeScript)
- ⚡ **Vite** as bundler
- 🎨 Utility-first styling (class-based, ready for Tailwind/shadcn integration)
- 🌗 Light/Dark theme toggle

**Architecture & Patterns**

- 📦 Modular components by role (citizen/lawyer/admin)
- 🧩 Context + custom hooks (`useAppLogic`) for shared logic
- 🧪 Mocked service layer to keep backend integration simple

---

## 📂 Folder Structure (High-Level)

```bash
complete-legal-aid-(cla)/
├─ App.tsx                 # Root app shell and routing
├─ index.tsx               # Entry point
├─ components/
│  ├─ Header.tsx
│  ├─ ThemeToggle.tsx
│  ├─ AiChatbot.tsx
│  ├─ EmergencyButton.tsx
│  ├─ ProfileDropdown.tsx
│  ├─ pages/
│  │  ├─ HomePage.tsx
│  │  ├─ LegalPage.tsx
│  │  ├─ LegalInsightsPage.tsx
│  │  ├─ AuthPage.tsx
│  │  ├─ LoginForm.tsx
│  │  ├─ SignupForm.tsx
│  │  ├─ AdminLoginForm.tsx
│  │  ├─ ContactPage.tsx
│  │  └─ AboutPage.tsx
│  ├─ dashboard/
│  │  ├─ DashboardPage.tsx
│  │  ├─ DashboardHeader.tsx
│  │  ├─ DashboardOverview.tsx
│  │  ├─ InboxPanel.tsx
│  │  ├─ NotificationsPanel.tsx
│  │  ├─ FilePreviewPanel.tsx
│  │  ├─ citizen/
│  │  │  ├─ CitizenOverview.tsx
│  │  │  ├─ CitizenCases.tsx
│  │  │  ├─ CitizenCaseDetail.tsx
│  │  │  ├─ CitizenFindLawyers.tsx
│  │  │  ├─ CitizenAppointments.tsx
│  │  │  ├─ CitizenVault.tsx
│  │  │  └─ CitizenBilling.tsx
│  │  ├─ lawyer/
│  │  │  ├─ LawyerOverview.tsx
│  │  │  ├─ LawyerCases.tsx
│  │  │  ├─ LawyerCaseDetail.tsx
│  │  │  ├─ LawyerClients.tsx
│  │  │  ├─ LawyerAppointments.tsx
│  │  │  ├─ LawyerVault.tsx
│  │  │  └─ LawyerBilling.tsx
│  │  └─ admin/
│  │     ├─ AdminOverview.tsx
│  │     ├─ AdminVerification.tsx
│  │     └─ DashboardVerification.tsx
│  ├─ ui/
│  │  ├─ Breadcrumb.tsx
│  │  ├─ ConfirmationModal.tsx
│  │  ├─ FormInputs.tsx
│  │  ├─ PasswordStrengthMeter.tsx
│  │  └─ Toast.tsx
├─ context/
│  └─ AppContext.tsx
├─ services/
│  ├─ authService.ts
│  ├─ caseService.ts
│  ├─ paymentService.ts
│  └─ geminiService.ts
├─ utils/
│  └─ translations.ts       # Bangla/English text helpers
├─ legal/
│  └─ terms.ts              # Legal terms & disclaimers
├─ constants.ts
├─ types.ts
├─ vite.config.ts
└─ tsconfig.json
▶️ Getting Started (Local Development)
1️⃣ Clone the Repository
git clone https://github.com/Tanjamul-Azad/Complete-Legal-Aid-CLA-.git
cd Complete-Legal-Aid-CLA-

2️⃣ Install Dependencies
npm install
# or
yarn install

3️⃣ Run the Dev Server
npm run dev
# or
yarn dev


Open your browser at the URL shown in the terminal (usually http://localhost:5173/).

🌐 Environment & Configuration (Optional)

If you integrate real backend / AI later, you can add:

VITE_API_BASE_URL=...
VITE_GEMINI_API_KEY=...


Inside a .env file at project root (and reference via import.meta.env in services/*.ts).

🧩 Key UX / Product Decisions

🇧🇩 Bangla-first experience, with English support for wider usability

👀 Clear case timeline with milestones, status, and next action for clients

🧾 Simple onboarding for first-time users who never hired a lawyer before

🧩 MVP now, scalable later – frontend structured so backend & mobile apps can plug in easily

🛣️ Roadmap

 Integrate real backend (auth, cases, files, billing)

 Add secure file storage & encryption

 Payment gateway integration (Bkash, Nagad, cards)

 Mobile app (React Native / Flutter)

 Government / court API integration (case status sync)

 Advanced AI: risk assessment, precedent search, document automation

🤝 Contributing

Contributions are welcome!

Fork the repo

Create a feature branch: git checkout -b feature/amazing-feature

Commit changes: git commit -m "Add amazing feature"

Push to branch: git push origin feature/amazing-feature

Open a Pull Request

📜 License

You can choose a license that fits your vision:

MIT – Open & flexible

AGPL / GPL – Stronger copyleft

Proprietary – If you plan a closed commercial product

Once decided, add LICENSE and update this section accordingly.

📧 Contact

Author / Maintainer:
MD. TANJAMUL AZAD
GitHub: @Tanjamul-Azad

If you’re interested in collaborating (law schools, NGOs, legal-tech teams), feel free to open an issue or reach out.

<div align="center">

“Justice should not depend on who you know, but on what you know and how easily you can reach help.”

<br/>

⭐ If you find this project meaningful, consider giving it a star on GitHub!

</div> ```