<div align="center">

<img src="https://img.shields.io/badge/Complete%20Legal%20Aid-CLA-003566?style=for-the-badge&logo=scale&logoColor=white"/>

# 🧑‍⚖️ **Complete Legal Aid (CLA)**  
### **A Digital Justice Bridge for Bangladesh**

[![Typing SVG](https://readme-typing-svg.demolab.com?font=Fira+Code&size=22&pause=1200&color=00C49A&center=true&vCenter=true&width=900&lines=Legal+Help+Made+Simple+%26+Accessible;AI+Assistance+%7C+Secure+Vault+%7C+Booking+%7C+Case+Tracking;Citizen-First+Legal+Technology+Platform.)](#)

<br/>

<img src="https://img.shields.io/github/stars/Tanjamul-Azad/Complete-Legal-Aid-CLA-?style=social"/>
<img src="https://img.shields.io/github/forks/Tanjamul-Azad/Complete-Legal-Aid-CLA-?style=social"/>

</div>

---

# 🚀 **Project Overview**

**Complete Legal Aid (CLA)** is a **full-stack legal-tech platform** built to make justice accessible to every citizen in Bangladesh.

It provides:

- ⚖️ Verified lawyer search + transparent profiles  
- 📅 Consultation booking (in-person / phone / video)  
- 🔐 Secure evidence vault with encryption  
- 🧠 AI legal assistant (Bangla + English)  
- 🚨 Emergency legal reporting  
- 📊 Case tracking & updates  
- 🛡️ Admin dashboard, logs & verification  

This system bridges **citizens → lawyers → NGOs → admins** into one trusted digital hub.

---

# 🛠️ **Tech Stack**

<div align="center">

| Layer | Tools Used |
|------|------------|
| **Frontend** | React, Vite, TypeScript, Vanilla JS, HTML, CSS |
| **Backend** | Django, Django REST Framework |
| **Database** | MySQL, Cloud SQL / Cloud MySQL Manager |
| **AI / NLP** | Python Services, Gemini/OpenAI API |
| **Cloud Deployment** | Cloud Compute, Cloud Run, Docker |
| **Networking** | HTTPS/HTTP, REST API, CORS security |
| **Other** | JWT Auth, Encryption, CI/CD Ready |

</div>

---

# ✨ **Core Platform Features**

## 🧑‍💼 For Citizens
- 🔍 Verified Lawyer Directory (filter by specialization, rating, language)
- 📅 Real-time Booking (in-person / call / video)
- 🔐 Encrypted Evidence Vault (upload + lawyer access control)
- 🧠 AI Legal Assistant (Bangla + English)
- 📡 Emergency Legal Helpline (anonymous optional)
- 📊 Case Timeline with milestones & next action
- 📝 Lawyer Ratings & Reviews

---

## ⚖️ For Lawyers
- 📁 Case Management Dashboard  
- 👨‍💼 Accept/decline bookings + manage availability  
- 📄 View client documents securely  
- 💳 Billing (future-ready)  
- 📈 License validity tracker  
- 🔔 Notifications & reminders  

---

## 🛡️ For Admins
- 👮 Lawyer verification panel  
- 📝 Case oversight + audit logs  
- 📊 System usage analytics  
- 🗂️ Category & template management  
- ⚠️ Emergency report monitoring  

---

# 🗂️ **Folder Structure**

```bash
Complete-Legal-Aid/
├── components/           # UI Components (Modals, Dashboard, etc.)
├── context/              # React Context (Global State)
├── hooks/                # Custom Hooks (useAppLogic, etc.)
├── services/             # API & Mock Services
│   ├── mock/             # Mock Database & Data
│   └── ...
├── legal/                # Legal Content (Privacy, Terms)
├── utils/                # Utility Functions
├── App.tsx               # Main Application Component
├── constants.ts          # App Constants
├── types.ts              # TypeScript Definitions
├── index.html            # Entry HTML
└── vite.config.ts        # Vite Configuration
```
## 🤖 AI Legal Assistant

Helps citizens understand the law in **simple Bangla**:

- Labor law (termination, workplace rights)
- Cyber law (DSA issues, privacy violations)
- Family law (divorce, maintenance, custody)
- Criminal & civil basics

**Supports:**

✔️ Q/A  
✔️ Document summary  
✔️ Risk analysis  
✔️ Next-steps guidance  
✔️ Lawyer recommendation  

---

## 🔐 Secure Evidence Vault

- End-to-end encrypted uploads  
- Virus scan + MIME validation  
- Time-limited secure share links  
- Access only after lawyer approval  
- Audit log for every file action  

**Supported file types:**  
`PDF, DOCX, JPG, PNG, MP3`

---

## 📅 Consultation Booking Flow

1. User selects a lawyer  
2. System displays **live availability**  
3. User books a slot → Lawyer receives request  
4. Lawyer accepts/declines  
5. System sends notifications  
6. Meeting summary is stored with the case  

---

## 📡 Emergency Legal Helpline

- Anonymous reporting  
- Fast evidence upload  
- Auto-routing to NGOs / support teams  
- Priority alert to verified responders  

---

## 🛣️ Roadmap

- [ ] Payment gateway (Bkash, Nagad, Cards)  
- [ ] Lawyer income analytics  
- [ ] Full chat with voice notes  
- [ ] Mobile App (React Native)  
- [ ] Court integration (future)  
- [ ] Advanced AI for contracts & forms  

---

## ▶️ Getting Started (Local Development)

Follow these steps to set up and run the project locally.

### **1️⃣ Prerequisites**
- Node.js (v16 or higher)
- npm or yarn

### **2️⃣ Clone the Repository**
```bash
git clone https://github.com/Tanjamul-Azad/Complete-Legal-Aid.git
cd Complete-Legal-Aid
```

### **3️⃣ Install Dependencies**
```bash
npm install
# or
yarn install
```

### **4️⃣ Configure Environment Variables**
The application requires an API key for the AI features.
1. Create a `.env` file in the root directory.
2. Copy the contents of `.env.example` into `.env`.
3. Add your Gemini API key:
```env
VITE_GEMINI_API_KEY=your_api_key_here
```

### **5️⃣ Run Development Server**
```bash
npm run dev
```
The application will start at `http://localhost:5173` (or the port shown in your terminal).

### **6️⃣ Build for Production**
To create an optimized production build:
```bash
npm run build
```
The output will be in the `dist` directory.
