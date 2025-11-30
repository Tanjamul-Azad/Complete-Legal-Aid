# Complete Legal Aid (CLA) - Comprehensive Setup Guide

## 🚀 Quick Start (Automated)

**For fastest setup, use the automated script:**

```bash
cd /path/to/your/project
./run_local.sh
```

This single command will:
- ✅ Check all prerequisites
- ✅ Setup backend (venv, dependencies, database, migrations, superuser)
- ✅ Setup frontend (npm install, environment)
- ✅ Start both servers automatically

Press `Ctrl+C` to stop all servers.

**Available options:**
```bash
./run_local.sh                  # Full setup and run
./run_local.sh --setup-only     # Only setup, don't start servers
./run_local.sh --backend-only   # Only start backend
./run_local.sh --frontend-only  # Only start frontend
./run_local.sh --skip-setup     # Skip setup, start servers
./run_local.sh --help           # Show help
```

---

## 📋 Table of Contents

1. [Quick Start (Automated)](#-quick-start-automated)
2. [Overview](#overview)
3. [Prerequisites](#prerequisites)
4. [Backend Setup (Manual)](#backend-setup)
5. [Frontend Setup (Manual)](#frontend-setup)
6. [Running the Application](#running-the-application)
7. [Testing & Verification](#testing--verification)
8. [Configuration Details](#configuration-details)
9. [Troubleshooting](#troubleshooting)
10. [Project Structure](#project-structure)
11. [API Documentation](#api-documentation)

---

## 🎯 Overview

**Complete Legal Aid (CLA)** is a full-stack legal-tech platform connecting citizens with legal services in Bangladesh.

**Tech Stack:**
- **Frontend**: React 19, TypeScript, Vite, Axios
- **Backend**: Django 5.0, Django REST Framework
- **Database**: MySQL 8.0
- **Authentication**: JWT (Simple JWT)
- **AI Integration**: Google Gemini API

---

## 📦 Prerequisites

### Required Software

1. **Python 3.10+**
   ```bash
   python3 --version
   ```
   Install from: https://www.python.org/downloads/

2. **Node.js 18+ and npm**
   ```bash
   node --version
   npm --version
   ```
   Install from: https://nodejs.org/

3. **MySQL 8.0+**
   ```bash
   mysql --version
   ```
   Install from: https://dev.mysql.com/downloads/mysql/
   
   Or via Homebrew (macOS):
   ```bash
   brew install mysql
   brew services start mysql
   ```

4. **Git** (for version control)
   ```bash
   git --version
   ```

---

## 🔧 Backend Setup (Manual)

**Note:** You can skip manual setup by using `./run_local.sh` (see Quick Start above)

### Step 1: Navigate to Backend Directory

```bash
cd /path/to/your/project/Backend
```

### Step 2: Create Python Virtual Environment

```bash
# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Verify activation (you should see (venv) in your terminal prompt)
which python
```

### Step 3: Install Python Dependencies

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

**Dependencies installed:**
- Django >= 5.0
- djangorestframework >= 3.14
- PyMySQL >= 1.1.0
- django-cors-headers >= 4.3
- python-dotenv >= 1.0
- PyJWT >= 2.8
- djangorestframework-simplejwt >= 5.3

### Step 4: Configure Environment Variables

Create a `.env` file in the Backend directory:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Django Configuration
DJANGO_SECRET_KEY=your-super-secret-key-change-this-in-production
DEBUG=True

# Database Configuration
DB_NAME=complete_legal_aid
DB_USER=root
DB_PASSWORD=12345678
DB_HOST=localhost
DB_PORT=3306
```

**⚠️ Important:** Change `DJANGO_SECRET_KEY` for production!

### Step 5: Set Up MySQL Database

**Option A: Using create_db.py script**

```bash
python create_db.py
```

This will:
- Connect to MySQL
- Create `complete_legal_aid` database
- Configure UTF-8 encoding

**Option B: Manual MySQL setup**

```bash
# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE complete_legal_aid CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Verify
SHOW DATABASES;

# Exit
EXIT;
```

### Step 6: Run Database Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

This creates **23 data models** including:
- User (custom user model)
- CitizenProfile, LawyerProfile, AdminProfile
- Case, CaseDocument, CaseUpdate
- Appointment, Review, Payment
- Notification, AuditLog, EmergencyReport
- And more...

### Step 6b: Seed Baseline Lawyer Data (Optional but Recommended)

Populate the searchable lawyer directory and legal specialization list in one step:

```bash
python manage.py seed_lawyers
```

This command safely upserts:
- Core legal specializations (family, criminal defense, property, corporate)
- Four verified lawyer profiles with bios, locations, and consultation fees

Feel free to rerun the command; it keeps data in sync without duplicating entries.

### Step 7: Create Superuser

**Option A: Using create_superuser.py script**

```bash
python create_superuser.py
```

**Option B: Manual creation**

```bash
python manage.py createsuperuser
```

Enter:
- Email: `admin@cla.bd`
- Phone: `01700000000`
- Password: `admin123`

### Step 8: Start Backend Server

```bash
python manage.py runserver
```

**✅ Backend is now running at:**
- API Root: http://localhost:8000/api/
- Admin Panel: http://localhost:8000/admin/

---

## ⚛️ Frontend Setup (Manual)

**Note:** You can skip manual setup by using `./run_local.sh` (see Quick Start above)

### Step 1: Navigate to Frontend Directory

```bash
cd /path/to/your/project/Frontend
```

### Step 2: Install Node Dependencies

```bash
npm install
```

**Key dependencies installed:**
- react: ^19.2.0
- react-dom: ^19.2.0
- axios: ^1.7.0
- jwt-decode: ^4.0.0
- @google/genai: ^1.28.0
- recharts: ^3.5.0
- vite: ^6.2.0
- typescript: ~5.8.2

### Step 3: Configure Environment Variables

Create `.env` file:

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Backend API URL
VITE_API_BASE_URL=http://localhost:8000/api

# Gemini AI API Key (for AI Chatbot)
VITE_GEMINI_API_KEY=your-gemini-api-key-here
```

**Get Gemini API Key:** https://aistudio.google.com/app/apikey

### Step 4: Start Frontend Development Server

```bash
npm run dev
```

**✅ Frontend is now running at:**
- Development Server: http://localhost:3000
- With HTTPS: https://localhost:3000

**Note:** The vite config is set to run on port 3000 (not 5173)

---

## 🚀 Running the Application

You need **TWO terminal windows** running simultaneously:

### Terminal 1: Backend Server

```bash
cd /path/to/your/project/Backend
source venv/bin/activate
python manage.py runserver
```

Keep this running at: **http://localhost:8000**

### Terminal 2: Frontend Server

```bash
cd /path/to/your/project/Frontend
npm run dev
```

Keep this running at: **http://localhost:3000**

---

## ✅ Testing & Verification

### 1. Access the Application

Open your browser and navigate to: **http://localhost:3000**

### 2. Login as Superuser (Admin)

1. Click "Login" or "Admin Login"
2. Enter credentials:
   - **Email:** `admin@cla.bd`
   - **Password:** `admin123`
3. You should be redirected to the Admin Dashboard

### 3. Test User Registration

1. Click "Sign Up"
2. Fill in the registration form:
   - **Full Name:** Test User
   - **Email:** test@example.com
   - **Phone Number:** 01700000001
   - **Password:** test1234
   - **Role:** Citizen or Lawyer
3. Submit the form
4. Check for successful registration and auto-login

### 4. Test API Endpoints (Manual Testing)

Open a new terminal and test with curl:

```bash
# Test API root
curl http://localhost:8000/api/

# Test user registration
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "phone_number": "01800000001",
    "password": "secure123",
    "role": "CITIZEN"
  }'

# Test login
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@cla.bd",
    "password": "admin123"
  }'
```

### 5. Monitor API Calls in Browser

1. Open Browser DevTools (F12)
2. Go to **Network** tab
3. Filter by **XHR** or **Fetch**
4. Perform actions (login, register, etc.)
5. Verify:
   - API calls to `http://localhost:8000/api/`
   - Authorization headers with JWT tokens
   - Response status codes (200, 201, 400, etc.)

### 6. Test JWT Token Refresh

JWT tokens automatically refresh when expired:
- **Access Token Lifetime:** 1 hour
- **Refresh Token Lifetime:** 7 days
- Refresh happens automatically via axios interceptor

---

## ⚙️ Configuration Details

### Backend Configuration

**File:** `Backend/cla_backend/settings.py`

#### Database Configuration
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'complete_legal_aid',
        'USER': 'root',
        'PASSWORD': '12345678',
        'HOST': 'localhost',
        'PORT': '3306',
        'OPTIONS': {
            'init_command': "SET sql_mode='STRICT_TRANS_TABLES'",
            'charset': 'utf8mb4',
        },
    }
}
```

#### CORS Settings
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",    # Vite dev server
    "https://localhost:3000",   # HTTPS variant
]
CORS_ALLOW_CREDENTIALS = True
```

#### JWT Settings
```python
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': True,
    'ALGORITHM': 'HS256',
    'AUTH_HEADER_TYPES': ('Bearer',),
}
```

#### REST Framework Settings
```python
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.AllowAny',
    ),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 50,
}
```

### Frontend Configuration

**File:** `Frontend/config/apiClient.ts`

```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatic token injection
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Automatic token refresh on 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Attempt token refresh
      const refreshToken = localStorage.getItem('refresh_token');
      // ... refresh logic ...
    }
    return Promise.reject(error);
  }
);
```

**File:** `Frontend/vite.config.ts`

```typescript
export default defineConfig({
  server: {
    port: 3000,
    host: '0.0.0.0'
  },
  plugins: [react(), basicSsl()],
  base: '/Complete-Legal-Aid/',
  define: {
    'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
  }
});
```

---

## 🔧 Troubleshooting

### Backend Issues

#### 1. Database Connection Error

**Problem:** `django.db.utils.OperationalError: (2003, "Can't connect to MySQL server")`

**Solutions:**
```bash
# Check if MySQL is running
brew services list

# Start MySQL
brew services start mysql

# Test MySQL connection
mysql -u root -p

# Verify credentials in Backend/.env
cat Backend/.env
```

#### 2. Port 8000 Already in Use

**Problem:** `Error: That port is already in use`

**Solution:**
```bash
# Find process using port 8000
lsof -ti:8000

# Kill the process
lsof -ti:8000 | xargs kill -9

# Or use a different port
python manage.py runserver 8001
```

#### 3. Migration Errors

**Problem:** Migration conflicts or errors

**Solutions:**
```bash
# Reset migrations (⚠️ destroys data)
python manage.py migrate api zero
python manage.py migrate --fake api zero
rm -rf api/migrations/0*.py

# Recreate migrations
python manage.py makemigrations
python manage.py migrate

# Or fake migrations if models match DB
python manage.py migrate --fake
```

#### 4. Module Not Found

**Problem:** `ModuleNotFoundError: No module named 'rest_framework'`

**Solution:**
```bash
# Ensure virtual environment is activated
source venv/bin/activate

# Reinstall dependencies
pip install -r requirements.txt

# Verify installation
pip list
```

### Frontend Issues

#### 1. npm Command Not Found

**Problem:** `zsh: command not found: npm`

**Solution:**
```bash
# Install Node.js from https://nodejs.org/
# Or via Homebrew
brew install node

# Verify installation
node --version
npm --version
```

#### 2. Cannot Connect to Backend

**Problem:** `Network Error` or `ERR_CONNECTION_REFUSED`

**Solutions:**
- Ensure backend is running on port 8000
- Check `VITE_API_BASE_URL` in `Frontend/.env`
- Verify CORS settings in `Backend/cla_backend/settings.py`
- Check browser console for specific errors

#### 3. CORS Errors

**Problem:** `Access to XMLHttpRequest blocked by CORS policy`

**Solution:**

In `Backend/cla_backend/settings.py`, add your frontend URL:
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "https://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
```

Restart backend server after changes.

#### 4. Vite Build Errors

**Problem:** TypeScript or build errors

**Solutions:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf node_modules/.vite

# Restart dev server
npm run dev
```

#### 5. Environment Variables Not Loading

**Problem:** `undefined` values for environment variables

**Solution:**
- Ensure `.env` file exists in Frontend directory
- Variables must start with `VITE_`
- Restart dev server after changing `.env`
- Access with `import.meta.env.VITE_VARIABLE_NAME`

### Common Issues

#### 1. JWT Token Expired

**Problem:** 401 errors after inactivity

**Solution:** The app automatically refreshes tokens, but if it fails:
```javascript
// Clear tokens and re-login
localStorage.removeItem('access_token');
localStorage.removeItem('refresh_token');
localStorage.removeItem('user');
// Navigate to login page
```

#### 2. SSL Certificate Errors (Development)

**Problem:** Browser warns about self-signed certificate

**Solution:**
- Click "Advanced" → "Proceed to localhost (unsafe)" in browser
- Or disable HTTPS in development by removing `basicSsl()` from `vite.config.ts`

---

## 📁 Project Structure

```
Software/
├── README.md                   # Project overview and documentation
├── SETUP_GUIDE.md              # This file
│
├── Backend/                    # Django REST API
│   ├── .env                    # Environment variables (create from .env.example)
│   ├── .env.example            # Template for environment variables
│   ├── manage.py               # Django management script
│   ├── requirements.txt        # Python dependencies
│   ├── create_db.py            # Database creation script
│   ├── create_superuser.py     # Superuser creation script
│   ├── venv/                   # Python virtual environment
│   │
│   ├── cla_backend/            # Django project settings
│   │   ├── __init__.py
│   │   ├── settings.py         # Main configuration (DB, CORS, JWT, REST)
│   │   ├── urls.py             # Root URL configuration
│   │   ├── wsgi.py             # WSGI application
│   │   └── asgi.py             # ASGI application
│   │
│   └── api/                    # Main Django app
│       ├── __init__.py
│       ├── apps.py             # App configuration
│       ├── models.py           # 23 data models (User, Case, Lawyer, etc.)
│       ├── serializers.py      # DRF serializers
│       ├── views.py            # API ViewSets
│       ├── auth_views.py       # Authentication endpoints
│       ├── urls.py             # API routes
│       └── migrations/         # Database migrations
│
└── Frontend/                   # React + TypeScript + Vite
    ├── .env                    # Environment variables (create from .env.example)
    ├── .env.example            # Template for environment variables
    ├── package.json            # Node dependencies and scripts
    ├── tsconfig.json           # TypeScript configuration
    ├── vite.config.ts          # Vite bundler configuration
    ├── index.html              # HTML entry point
    ├── index.tsx               # React entry point
    ├── App.tsx                 # Root React component
    ├── types.ts                # TypeScript type definitions
    ├── constants.ts            # App constants
    ├── metadata.json           # App metadata
    │
    ├── config/                 # Configuration files
    │   └── apiClient.ts        # Axios instance with interceptors
    │
    ├── context/                # React Context providers
    │   └── AppContext.tsx      # Global app state management
    │
    ├── hooks/                  # Custom React hooks
    │   └── useAppLogic.ts      # Main application logic hook
    │
    ├── services/               # API service layer
    │   ├── authService.ts      # Authentication API calls
    │   ├── caseService.ts      # Case management API calls
    │   ├── lawyerService.ts    # Lawyer-related API calls
    │   ├── appointmentService.ts # Appointment booking API calls
    │   ├── notificationService.ts # Notification API calls
    │   ├── paymentService.ts   # Payment processing API calls
    │   ├── geminiService.ts    # Google Gemini AI integration
    │   └── mock/
    │       └── mockDatabase.ts # Mock data for development
    │
    ├── components/             # React components
    │   ├── Header.tsx
    │   ├── Footer.tsx
    │   ├── Logo.tsx
    │   ├── BackButton.tsx
    │   ├── ThemeToggle.tsx
    │   ├── ProfileDropdown.tsx
    │   ├── EmergencyButton.tsx
    │   ├── AiChatbot.tsx
    │   ├── ComplaintModal.tsx
    │   ├── EmergencyHelpModal.tsx
    │   ├── EmergencyReportModal.tsx
    │   ├── AppPages.tsx
    │   ├── icons.tsx
    │   │
    │   ├── pages/              # Page components
    │   │   ├── HomePage.tsx
    │   │   ├── AuthPage.tsx
    │   │   ├── LoginForm.tsx
    │   │   ├── SignupForm.tsx
    │   │   ├── AdminLoginForm.tsx
    │   │   ├── AboutPage.tsx
    │   │   ├── CareersPage.tsx
    │   │   ├── ContactPage.tsx
    │   │   ├── LegalPage.tsx
    │   │   ├── LegalInsightsPage.tsx
    │   │   ├── EmailVerificationPage.tsx
    │   │   ├── PendingVerificationPage.tsx
    │   │   └── ResetPasswordPage.tsx
    │   │
    │   ├── dashboard/          # Dashboard components
    │   │   ├── DashboardPage.tsx
    │   │   ├── DashboardHeader.tsx
    │   │   ├── DashboardOverview.tsx
    │   │   ├── StatCard.tsx
    │   │   ├── InboxPanel.tsx
    │   │   ├── NotificationsPanel.tsx
    │   │   ├── AppointmentDetailPanel.tsx
    │   │   ├── FilePreviewPanel.tsx
    │   │   ├── SecureChatWidget.tsx
    │   │   ├── ReviewModal.tsx
    │   │   │
    │   │   ├── admin/          # Admin dashboard
    │   │   │   ├── AdminOverview.tsx
    │   │   │   ├── AdminCases.tsx
    │   │   │   ├── AdminAuditLogs.tsx
    │   │   │   ├── AdminContentManager.tsx
    │   │   │   └── ...
    │   │   │
    │   │   ├── citizen/        # Citizen dashboard
    │   │   └── lawyer/         # Lawyer dashboard
    │   │
    │   ├── lawyers/            # Lawyer-related components
    │   │   ├── LawyerProfileCard.tsx
    │   │   └── LawyerProfileModal.tsx
    │   │
    │   ├── admin/              # Admin components
    │   │   └── UserProfileDetailModal.tsx
    │   │
    │   ├── modals/             # Modal components
    │   │   ├── SimulatedGmailInbox.tsx
    │   │   └── SimulatedGoogleAuthModal.tsx
    │   │
    │   └── ui/                 # Reusable UI components
    │       ├── FormInputs.tsx
    │       ├── Toast.tsx
    │       ├── Breadcrumb.tsx
    │       ├── ConfirmationModal.tsx
    │       └── PasswordStrengthMeter.tsx
    │
    ├── legal/                  # Legal documents
    │   ├── terms.ts            # Terms of service
    │   └── privacy.ts          # Privacy policy
    │
    └── utils/                  # Utility functions
        └── translations.ts     # i18n translations (Bangla/English)
```

---

## 📚 API Documentation

### Base URL

```
http://localhost:8000/api/
```

### Authentication Endpoints

#### 1. Register User

```http
POST /api/auth/register/
Content-Type: application/json

{
  "email": "user@example.com",
  "phone_number": "01700000000",
  "password": "securepass123",
  "role": "CITIZEN"  // or "LAWYER", "ADMIN", "NGO_SUPPORT"
}

Response: 201 Created
{
  "user": {
    "user_id": "uuid",
    "email": "user@example.com",
    "phone_number": "01700000000",
    "role": "CITIZEN"
  },
  "access": "jwt_access_token",
  "refresh": "jwt_refresh_token"
}
```

#### 2. Login

```http
POST /api/auth/login/
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepass123"
}

Response: 200 OK
{
  "access": "jwt_access_token",
  "refresh": "jwt_refresh_token",
  "user": {
    "user_id": "uuid",
    "email": "user@example.com",
    "role": "CITIZEN"
  }
}
```

#### 3. Refresh Token

```http
POST /api/auth/token/refresh/
Content-Type: application/json

{
  "refresh": "jwt_refresh_token"
}

Response: 200 OK
{
  "access": "new_jwt_access_token"
}
```

#### 4. Get User Profile

```http
GET /api/auth/profile/
Authorization: Bearer jwt_access_token

Response: 200 OK
{
  "user_id": "uuid",
  "email": "user@example.com",
  "phone_number": "01700000000",
  "role": "CITIZEN",
  "is_verified": true,
  "language_preference": "BN"
}
```

### Data Models (23 Total)

1. **User** - Custom user model with roles
2. **CitizenProfile** - Citizen user details
3. **LawyerProfile** - Lawyer credentials and specializations
4. **AdminProfile** - Admin user details
5. **Case** - Legal case information
6. **CaseDocument** - Case-related documents
7. **CaseUpdate** - Case status updates
8. **Appointment** - Consultation bookings
9. **Review** - Lawyer reviews and ratings
10. **Payment** - Payment transactions
11. **Notification** - User notifications
12. **AuditLog** - System audit trails
13. **EmergencyReport** - Emergency legal reports
14. **LegalSpecialization** - Lawyer practice areas
15. **Message** - Secure messaging
16. **DocumentVault** - Encrypted document storage
17. **VerificationRequest** - Lawyer verification requests
18. **Complaint** - User complaints
19. **ChatSession** - AI chatbot sessions
20. **AIQuery** - AI assistant queries
21. **SystemSettings** - App configuration
22. **FAQ** - Frequently asked questions
23. **LegalResource** - Legal information resources

### Admin Panel

Access at: **http://localhost:8000/admin/**

Login with superuser credentials:
- Email: `admin@cla.bd`
- Password: `admin123`

From admin panel you can:
- Manage users, cases, appointments
- View audit logs
- Approve lawyer verifications
- Manage system settings
- Monitor payments and transactions

---

## 🎯 Next Steps After Setup

### 1. Seed Demo Data (Optional)

Create sample data through admin panel or Django shell:

```bash
python manage.py shell
```

```python
from api.models import *

# Create a sample lawyer
lawyer_user = User.objects.create_user(
    email='lawyer@example.com',
    phone_number='01711111111',
    password='lawyer123',
    role='LAWYER',
    is_active=True,
    is_verified=True
)

lawyer_profile = LawyerProfile.objects.create(
    user=lawyer_user,
    bar_registration_number='BAR-12345',
    years_of_experience=5,
    hourly_rate=1000.00,
    bio='Experienced criminal lawyer'
)
```

### 2. Test All Features

- ✅ User registration (Citizen & Lawyer)
- ✅ Email verification flow
- ✅ Login with JWT authentication
- ✅ Token refresh mechanism
- ✅ Profile management
- ✅ Case creation and tracking
- ✅ Lawyer search and filtering
- ✅ Appointment booking
- ✅ Document upload to vault
- ✅ Secure messaging
- ✅ Payment processing
- ✅ Notifications
- ✅ AI chatbot (with Gemini API)
- ✅ Emergency reporting
- ✅ Admin dashboard features

### 3. Customize Configuration

Update settings for your needs:
- Change JWT token lifetime
- Configure email backend (SMTP)
- Set up file storage (S3, Cloud Storage)
- Configure payment gateway
- Add custom middleware
- Implement rate limiting

### 4. Deploy to Production

**Backend Deployment Options:**
- Google Cloud Run
- AWS Elastic Beanstalk
- Heroku
- DigitalOcean App Platform

**Frontend Deployment Options:**
- Vercel
- Netlify
- GitHub Pages
- Firebase Hosting

**Database Deployment Options:**
- Google Cloud SQL
- AWS RDS
- PlanetScale
- DigitalOcean Managed MySQL

**Before deploying:**
- Set `DEBUG=False` in production
- Generate strong `SECRET_KEY`
- Configure allowed hosts
- Set up HTTPS/SSL
- Configure CORS for production domain
- Set up database backups
- Configure logging and monitoring

---

## 🔒 Security Considerations

1. **Never commit .env files** to version control
2. **Change default credentials** immediately
3. **Use strong SECRET_KEY** in production
4. **Enable HTTPS** for production
5. **Implement rate limiting** on API endpoints
6. **Sanitize user inputs** to prevent XSS/SQL injection
7. **Keep dependencies updated** (`pip-audit`, `npm audit`)
8. **Enable 2FA** for admin accounts
9. **Regular security audits** and penetration testing
10. **Implement proper logging** and monitoring

---

## 📞 Important URLs & Credentials

### URLs

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000/api/
- **Admin Panel:** http://localhost:8000/admin/
- **API Documentation:** http://localhost:8000/api/ (DRF Browsable API)

### Credentials

**Superuser (Admin):**
- Email: `admin@cla.bd`
- Password: `admin123`
- Role: Admin

**Database:**
- Name: `complete_legal_aid`
- User: `root`
- Password: `12345678`
- Host: `localhost`
- Port: `3306`

---

## 📝 Additional Resources

- **Django Documentation:** https://docs.djangoproject.com/
- **Django REST Framework:** https://www.django-rest-framework.org/
- **React Documentation:** https://react.dev/
- **Vite Documentation:** https://vitejs.dev/
- **MySQL Documentation:** https://dev.mysql.com/doc/
- **JWT Authentication:** https://jwt.io/

---

## 🐛 Getting Help

If you encounter issues:

1. Check this guide's troubleshooting section
2. Review error messages in terminal/console
3. Check browser DevTools Network tab
4. Review Django logs
5. Verify environment variables
6. Ensure all services are running

---

**Setup completed successfully! 🎉**

Your Complete Legal Aid platform is now ready for development and testing.

---

##  Sample User Credentials (Bengali Data)

The system includes sample users with Bengali names for testing purposes. Use these credentials to test different user roles:

### Admin Account
- **Email:** admin@cla.bd
- **Password:** admin123
- **Role:** Admin (Superuser)

---

###  Sample Lawyers

#### 1. Advocate Mahmudur Rahman Chowdhury (?????? ????? ???? ???)
- **Email:** adv.chowdhury@example.com
- **Phone:** +8801711111111
- **Password:** Lawyer@123
- **Bar Council No:** DHK/2015/12345
- **Specialization:** Family Law, Civil Law
- **Chamber:** Supreme Court Bar Association, Dhaka
- **Online Fee:** 1,500 | **Offline Fee:** 3,000

#### 2. Advocate Nasrin Akter (?????? ???? ????)
- **Email:** adv.akter@example.com
- **Phone:** +8801811111112
- **Password:** Lawyer@123
- **Bar Council No:** CTG/2017/23456
- **Specialization:** Women Rights, Family Law
- **Chamber:** Chittagong Bar Association, Chittagong
- **Online Fee:** 1,200 | **Offline Fee:** 2,500

#### 3. Advocate Abdul Karim Sheikh (?????? ???? ??? ??)
- **Email:** adv.karim@example.com
- **Phone:** +8801911111113
- **Password:** Lawyer@123
- **Bar Council No:** RAJ/2012/34567
- **Specialization:** Criminal Law
- **Chamber:** Rajshahi Judge Court, Rajshahi
- **Online Fee:** 1,800 | **Offline Fee:** 3,500

#### 4. Advocate Farzana Islam (?????? ???? ????)
- **Email:** adv.islam@example.com
- **Phone:** +8801611111114
- **Password:** Lawyer@123
- **Bar Council No:** KHL/2016/45678
- **Specialization:** Property Law, Civil Law
- **Chamber:** Khulna District Court, Khulna
- **Online Fee:** 1,000 | **Offline Fee:** 2,000

#### 5. Advocate Mizanur Rahman (?????? ???? ????)
- **Email:** adv.rahman@example.com
- **Phone:** +8801511111115
- **Password:** Lawyer@123
- **Bar Council No:** SYL/2014/56789
- **Specialization:** Labor Law, Civil Law
- **Chamber:** Sylhet Bar Association, Sylhet
- **Online Fee:** 1,300 | **Offline Fee:** 2,800

#### 6. Advocate Tahmina Begum (?????? ???? ???)
- **Email:** adv.begum@example.com
- **Phone:** +8801711111116
- **Password:** Lawyer@123
- **Bar Council No:** DHK/2018/67890
- **Specialization:** Family Law, Women Rights
- **Chamber:** Dhaka Chief Metropolitan Court, Dhaka
- **Online Fee:** 900 | **Offline Fee:** 1,800

---

###  Sample Citizens

#### 1. Abdur Rahman (???? ????)
- **Email:** rahman.citizen@example.com
- **Phone:** +8801712345671
- **Password:** Citizen@123
- **Location:** Dhaka, Dhanmondi
- **NID:** 1234567890

#### 2. Fatema Sultana (??? ????)
- **Email:** sultana.citizen@example.com
- **Phone:** +8801812345672
- **Password:** Citizen@123
- **Location:** Chittagong, Nasirabad
- **NID:** 1234567891

#### 3. Md. Kamal Islam (?. ??? ????)
- **Email:** islam.citizen@example.com
- **Phone:** +8801912345673
- **Password:** Citizen@123
- **Location:** Rajshahi, Shaheb Bazar
- **NID:** 1234567892

#### 4. Ayesha Begum (??? ???)
- **Email:** begum.citizen@example.com
- **Phone:** +8801612345674
- **Password:** Citizen@123
- **Location:** Khulna, Royal Para
- **NID:** 1234567893

#### 5. Imran Hossain (???? ???)
- **Email:** hossain.citizen@example.com
- **Phone:** +8801512345675
- **Password:** Citizen@123
- **Location:** Sylhet, Zindabazar
- **NID:** 1234567894

---

###  How to Add Sample Data

If the sample data hasn't been loaded yet, run this command:

**On Windows (PowerShell):**
```powershell
cd Backend
.\venv\Scripts\activate
python add_sample_data.py
```

**On macOS/Linux:**
```bash
cd Backend
source venv/bin/activate
python add_sample_data.py
```

This will create:
-  6 verified lawyer accounts with Bengali names
-  5 citizen accounts with Bengali names
-  Legal specializations (Family Law, Criminal Law, Civil Law, etc.)
-  All accounts are pre-verified and ready to use

The credentials are also saved to `Backend/sample_credentials.txt` for your reference.

---

** Your Complete Legal Aid platform is now fully set up with Bengali sample data!**

You can now test the application with realistic Bengali user data.
