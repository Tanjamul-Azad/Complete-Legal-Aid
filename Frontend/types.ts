
export interface Review {
  reviewerName: string;
  rating: number; // 1 to 5
  comment: string;
  timestamp: number;
}

export type UserRole = 'citizen' | 'lawyer' | 'admin';
export type VerificationStatus = 'Verified' | 'Pending' | 'Rejected' | 'PendingEmailVerification';
export interface SiteContent {
  about: {
    mission: string;
    vision: string;
    values: string;
  };
  contact: {
    email: string;
    phone: string;
    address: string;
  };
  privacy: string;
  terms: string;
}

export type DashboardSubPage = 'overview' | 'cases' | 'vault' | 'settings' | 'appointments' | 'profile' | 'verification' | 'notifications' | 'find-lawyers' | 'clients' | 'billing' | 'messages' | 'content-management' | 'support' | 'audit-logs' | 'system-logs' | 'admin-users' | 'admin-cases';

export type AppTheme = 'light' | 'dark' | 'system';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // For simulation purposes, optional for Google Sign-In
  role: UserRole;
  avatar: string;
  avatarFile?: File; // Local-only handle for uploads
  verificationStatus: VerificationStatus;
  verificationDocFile?: File;

  // New detailed fields
  phone?: string;
  language?: 'Bangla' | 'English';
  theme?: AppTheme;
  notificationSettings?: {
    email: {
      caseUpdates: boolean;
      newMessages: boolean;
      appointmentReminders: boolean;
    };
    reminders: {
      oneDay: boolean;
      oneHour: boolean;
      tenMinutes: boolean;
    }
  };
  availability?: Record<string, string[]>; // { "2023-10-27": ["10:00", "11:00"] }

  // Verification fields
  verificationToken?: string;
  verificationTokenExpires?: number;

  // Lawyer-specific properties
  specializations?: string[];
  experience?: number;
  rating?: number;
  reviews?: Review[];
  bio?: string;
  location?: string;
  fees?: number;
  verificationDocs?: { name: string; url: string }[];
  lawyerId?: string; // Bar Council ID
  communicationMode?: 'Email' | 'Phone' | 'Both';
  profileId?: string; // LawyerProfile ID for booking appointments
}


export interface Case {
  id: string;
  title: string;
  description: string;
  status: 'Submitted' | 'In Review' | 'Scheduled' | 'Resolved';
  submittedDate: string;
  lawyerId?: string;
  clientId: string;
  reviewed?: boolean;
}

export interface EvidenceDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: string;
  caseId: string;
}


export type Page = 'home' | 'about' | 'contact' | 'find-lawyers' | 'dashboard' | 'login' | 'reset-password' | 'legal' | 'email-verification' | 'insights' | 'careers';

export interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
  error?: boolean;
  originalPrompt?: string;
}

export interface SimulatedEmail {
  id: string;
  to: string; // Added 'to' property
  from: string;
  subject: string;
  body: string;
  read: boolean;
  timestamp: number;
  action?: {
    type: 'VERIFY_EMAIL' | 'RESET_PASSWORD';
    token: string;
    buttonText: string;
  }
}

export type NotificationType = 'case_update' | 'new_message' | 'appointment' | 'system' | 'deadline' | 'verification';
export type NotificationSeverity = 'normal' | 'warning' | 'critical';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body?: string;
  link: { page: DashboardSubPage; params?: any };
  timestamp: number;
  read: boolean;
  severity: NotificationSeverity;
}

export type AppointmentType = 'Hearing' | 'Consultation' | 'Deadline' | 'Review' | 'Meeting';

export interface Appointment {
  id: string;
  clientId: string;
  lawyerId: string;
  title?: string; // Added title for calendar view
  type?: AppointmentType; // Added type for color coding
  date: string; // ISO Date string YYYY-MM-DD
  time: string;
  duration?: number; // in minutes
  mode: 'Online' | 'In-Person';
  status: 'Confirmed' | 'Pending' | 'Cancelled';
  reviewed?: boolean;
  notes?: string;
  caseId?: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: number;
  read: boolean;
  caseId?: string;
  attachment?: {
    name: string;
    url: string;
    size: number;
  };
}

export interface SupportMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  timestamp: number;
  status: 'New' | 'Read' | 'Replied';
}

export interface ActivityLog {
  id: string;
  userId: string;
  message: string;
  timestamp: string; // e.g., "2h ago"
  caseId?: string;
}

export interface EmergencyAlert {
  id: string;
  userId: string;
  userName: string;
  userPhone?: string;
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  timestamp: number;
  status: 'Active' | 'Resolved' | 'False Alarm';
}