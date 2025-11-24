
import { useState, useEffect, useCallback } from 'react';
import type { User, UserRole, Page, DashboardSubPage, SimulatedEmail, Notification, Case, Appointment, ActivityLog, Message, EvidenceDocument, Review, VerificationStatus, AppTheme } from '../types';
import { ALL_USERS, CASES, EVIDENCE_DOCUMENTS, NOTIFICATIONS, APPOINTMENTS, ACTIVITY_LOGS, MESSAGES } from '../constants';
import { authService } from '../services/authService';
import { caseService } from '../services/caseService';
import { termsContent } from '../legal/terms';
import { privacyContent } from '../legal/privacy';

export const useAppLogic = () => {
    // State definitions
    const [user, setUser] = useState<User | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [currentPage, setCurrentPage] = useState<Page>('home');
    const [authPageMode, setAuthPageMode] = useState<'login' | 'signup' | 'admin-login'>('login');
    const [initialSignupRole, setInitialSignupRole] = useState<UserRole>('citizen');
    const [userToReset, setUserToReset] = useState<string | null>(null);
    const [legalPageContent, setLegalPageContent] = useState<{ title: string; content: string } | null>(null);
    const [emailVerificationPageStatus, setEmailVerificationPageStatus] = useState<'prompt' | 'success' | 'invalid' | 'expired'>('prompt');

    // Modals & UI State
    const [isEmergencyHelpOpen, setEmergencyHelpOpen] = useState(false);
    const [isEmergencyReportOpen, setEmergencyReportOpen] = useState(false);
    const [complaintModalTarget, setComplaintModalTarget] = useState<{ name: string; email: string } | null>(null);
    const [isChatOpen, setChatOpen] = useState(false);
    const [toast, setToast] = useState<{ message: string; type?: 'success' | 'error' } | null>(null);
    const [simulatedEmails, setSimulatedEmails] = useState<SimulatedEmail[]>([]);
    const [isGmailInboxOpen, setGmailInboxOpen] = useState(false);
    const [isGoogleAuthOpen, setGoogleAuthOpen] = useState(false);
    const [reviewTarget, setReviewTarget] = useState<{ lawyerId: string; source: { type: 'case' | 'appointment'; id: string } } | null>(null);
    const [isInboxOpen, setInboxOpen] = useState(false);
    const [isNotificationsOpen, setNotificationsOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);

    // Data State
    // Initialize from localStorage if available to remember last visited page
    const [dashboardSubPage, setDashboardSubPage] = useState<DashboardSubPage>(() => {
        if (typeof window !== 'undefined') {
            return (localStorage.getItem('cla-last-subpage') as DashboardSubPage) || 'overview';
        }
        return 'overview';
    });
    const [selectedCaseId, setSelectedCaseId] = useState<string | null>(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('cla-last-case-id') || null;
        }
        return null;
    });

    const [cases, setCases] = useState<Case[]>([]);
    const [appointments, setAppointments] = useState<Appointment[]>(APPOINTMENTS);
    const [messages, setMessages] = useState<Message[]>(MESSAGES);
    const [evidenceDocuments, setEvidenceDocuments] = useState<EvidenceDocument[]>(EVIDENCE_DOCUMENTS);
    const [notifications, setNotifications] = useState<Notification[]>(NOTIFICATIONS);
    const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(ACTIVITY_LOGS);
    const [typingLawyers, setTypingLawyers] = useState<Record<string, boolean>>({});

    // Initialization
    useEffect(() => {
        // Load users from localStorage or constant
        const storedUsers = localStorage.getItem('cla-users');
        if (storedUsers) {
            setUsers(JSON.parse(storedUsers));
        } else {
            setUsers(ALL_USERS);
            localStorage.setItem('cla-users', JSON.stringify(ALL_USERS));
        }

        // Check theme
        // Check theme
        if (localStorage.theme === 'dark') {
            setIsDarkMode(true);
            document.documentElement.classList.add('dark');
        } else {
            setIsDarkMode(false);
            document.documentElement.classList.remove('dark');
        }

        // Restore session
        const storedUserId = localStorage.getItem('cla-user-id') || sessionStorage.getItem('cla-user-id');
        if (storedUserId) {
            authService.getCurrentUser(storedUserId).then(u => {
                if (u) {
                    setUser(u);
                    caseService.getUserCases(u).then(setCases);
                }
            });
        }
    }, []);

    // Persist dashboard state
    useEffect(() => {
        if (user) {
            localStorage.setItem('cla-last-subpage', dashboardSubPage);
            if (selectedCaseId) {
                localStorage.setItem('cla-last-case-id', selectedCaseId);
            } else {
                localStorage.removeItem('cla-last-case-id');
            }
        }
    }, [dashboardSubPage, selectedCaseId, user]);

    // Navigation
    const handleSetCurrentPage = (page: Page) => {
        setCurrentPage(page);
        window.scrollTo(0, 0);
    };

    const goToAuth = (mode: 'login' | 'signup' | 'admin-login', options?: { signupRole?: UserRole }) => {
        setAuthPageMode(mode);
        if (options?.signupRole) {
            setInitialSignupRole(options.signupRole);
        }
        handleSetCurrentPage('login');
    };

    // Auth Functions
    const handleLogin = async (identifier: string, pass: string, rememberMe: boolean, expectedRole: UserRole): Promise<User | 'PENDING_EMAIL_VERIFICATION' | 'ROLE_MISMATCH' | null> => {
        const foundUser = await authService.login(identifier, pass);

        if (foundUser) {
            if (foundUser.role !== expectedRole) {
                if (expectedRole === 'admin' && foundUser.role !== 'admin') return 'ROLE_MISMATCH';
                if (expectedRole === 'lawyer' && foundUser.role !== 'lawyer') return 'ROLE_MISMATCH';
                if (expectedRole === 'citizen' && foundUser.role !== 'citizen') return 'ROLE_MISMATCH';
            }

            if (foundUser.verificationStatus === 'PendingEmailVerification') {
                const { updatedUser, email } = await authService.resendVerificationEmail(foundUser);
                setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
                setSimulatedEmails(prev => [email, ...prev]);
                return 'PENDING_EMAIL_VERIFICATION';
            }

            setUser(foundUser);
            if (rememberMe) {
                localStorage.setItem('cla-user-id', foundUser.id);
            } else {
                sessionStorage.setItem('cla-user-id', foundUser.id);
            }

            // Load user data
            const userCases = await caseService.getUserCases(foundUser);
            setCases(userCases);

            if (foundUser.verificationStatus === 'Verified') {
                handleSetCurrentPage('dashboard');
                // Don't override subpage here to allow persistence logic to work,
                // unless it's a fresh login with no history? 
                // Actually, let's default to overview on fresh login for better UX if empty
                if (!localStorage.getItem('cla-last-subpage')) {
                    setDashboardSubPage('overview');
                }
            }
            return foundUser;
        }
        return null;
    };

    const handleSignup = async (newUser: Omit<User, 'id' | 'avatar'>): Promise<User | null> => {
        const result = await authService.signup(newUser);
        if ('error' in result) return null;

        const { user: createdUser, email } = result;
        setUsers(prev => [...prev, createdUser]);
        setUser(createdUser); // Log in but in pending state
        setSimulatedEmails(prev => [email, ...prev]);
        // Will redirect to EmailVerificationPage via PageRenderer logic
        return createdUser;
    };

    const handleLogout = () => {
        setUser(null);
        localStorage.removeItem('cla-user-id');
        sessionStorage.removeItem('cla-user-id');
        // Clear persisted dashboard state on logout
        localStorage.removeItem('cla-last-subpage');
        localStorage.removeItem('cla-last-case-id');
        setDashboardSubPage('overview');
        setSelectedCaseId(null);

        handleSetCurrentPage('home');
    };

    const clearSession = handleLogout;

    const handleEmailVerification = async (token: string) => {
        const { user: verifiedUser, status } = await authService.verifyEmail(token);
        setEmailVerificationPageStatus(status);
        if (status === 'success' && verifiedUser) {
            setUsers(prev => prev.map(u => u.id === verifiedUser.id ? verifiedUser : u));
            if (user && user.id === verifiedUser.id) {
                setUser(verifiedUser);
            }
        }
        handleSetCurrentPage('email-verification');
    };

    const onSimulateGoogleLogin = (email: string) => {
        // For demo, find user by email or create a dummy one if not found, but strictly sticking to provided users for now
        const existingUser = users.find(u => u.email === email);
        if (existingUser) {
            setUser(existingUser);
            sessionStorage.setItem('cla-user-id', existingUser.id);
            caseService.getUserCases(existingUser).then(setCases);
            handleSetCurrentPage('dashboard');
        } else {
            setToast({ message: "Google account not linked to existing user demo.", type: 'error' });
        }
    };

    const handleForgotPasswordRequest = async (email: string): Promise<boolean> => {
        const result = await authService.requestPasswordReset(email);
        if (result) {
            setSimulatedEmails(prev => [result.email, ...prev]);
            setUserToReset(result.user.id);
            return true;
        }
        return false;
    };

    const handlePasswordReset = async (newPassword: string) => {
        if (userToReset) {
            await authService.resetPassword(userToReset, newPassword);
            setToast({ message: "Password reset successfully. Please login.", type: 'success' });
            handleSetCurrentPage('login');
            setUserToReset(null);
        }
    };

    // Dashboard Actions
    const handleHireLawyerClick = () => {
        setChatOpen(false);
        if (user) {
            setDashboardSubPage('find-lawyers');
            handleSetCurrentPage('dashboard');
        } else {
            goToAuth('login');
        }
    };

    const handleDocumentUpload = (file: File, caseId: string): EvidenceDocument => {
        const newDoc: EvidenceDocument = {
            id: `doc-${Date.now()}`,
            name: file.name,
            type: file.type,
            size: file.size,
            url: URL.createObjectURL(file),
            uploadedAt: new Date().toISOString(),
            caseId: caseId
        };
        setEvidenceDocuments(prev => [...prev, newDoc]);

        // Create activity log
        if (user) {
            const newLog: ActivityLog = {
                id: `act-${Date.now()}`,
                userId: user.id,
                message: `You uploaded "${file.name}".`,
                timestamp: 'Just now',
                caseId: caseId
            };
            setActivityLogs(prev => [newLog, ...prev]);
        }

        return newDoc;
    };

    const handleDeleteDocument = (docId: string) => {
        setEvidenceDocuments(prev => prev.filter(d => d.id !== docId));
        setToast({ message: "Document deleted.", type: "success" });
    };

    const handleSendMessage = (receiverId: string, text: string, caseId?: string, attachment?: { name: string, url: string, size: number }) => {
        if (!user) return;
        const newMessage: Message = {
            id: `msg-${Date.now()}`,
            senderId: user.id,
            receiverId,
            text,
            timestamp: Date.now(),
            read: false,
            caseId,
            attachment
        };
        setMessages(prev => [...prev, newMessage]);

        // Simulate reply
        if (caseId) {
            setTypingLawyers(prev => ({ ...prev, [caseId]: true }));
            setTimeout(() => {
                setTypingLawyers(prev => ({ ...prev, [caseId]: false }));
                const reply: Message = {
                    id: `msg-reply-${Date.now()}`,
                    senderId: receiverId,
                    receiverId: user.id,
                    text: "I have received your message. I will review it shortly.",
                    timestamp: Date.now(),
                    read: false,
                    caseId
                };
                setMessages(prev => [...prev, reply]);

                // Notification for reply
                const notif: Notification = {
                    id: `notif-${Date.now()}`,
                    userId: user.id,
                    type: 'new_message',
                    title: 'New Message',
                    body: `New message in case.`,
                    link: { page: 'cases', params: { caseId } },
                    timestamp: Date.now(),
                    read: false,
                    severity: 'normal'
                };
                setNotifications(prev => [notif, ...prev]);

            }, 3000);
        }
    };

    const markMessagesAsRead = () => {
        if (!user) return;
        setMessages(prev => prev.map(m => m.receiverId === user.id ? { ...m, read: true } : m));
    };

    const markConversationAsRead = (senderId: string) => {
        if (!user) return;
        setMessages(prev => prev.map(m => m.receiverId === user.id && m.senderId === senderId ? { ...m, read: true } : m));
    };

    const openInbox = () => {
        setInboxOpen(true);
        setNotificationsOpen(false);
    };

    const openNotifications = () => {
        setNotificationsOpen(true);
        setInboxOpen(false);
    };

    const markAllNotificationsAsRead = () => {
        if (!user) return;
        setNotifications(prev => prev.map(n => n.userId === user.id ? { ...n, read: true } : n));
    };

    const handleNotificationNavigation = (notification: Notification) => {
        if (notification.link) {
            if (notification.link.page === 'cases' && notification.link.params?.caseId) {
                setSelectedCaseId(notification.link.params.caseId);
                setDashboardSubPage('cases');
            } else {
                setDashboardSubPage(notification.link.page);
            }
            setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, read: true } : n));
        }
    };

    const handleReviewSubmit = async (rating: number, comment: string) => {
        if (reviewTarget && user) {
            const review: Review = {
                reviewerName: user.name,
                rating,
                comment,
                timestamp: Date.now()
            };
            const updatedLawyer = await authService.addLawyerReview(reviewTarget.lawyerId, review);
            if (updatedLawyer) {
                setUsers(prev => prev.map(u => u.id === updatedLawyer.id ? updatedLawyer : u));
                // Update case if reviewed
                if (reviewTarget.source.type === 'case') {
                    const updatedCase = await caseService.updateCase(reviewTarget.source.id, { reviewed: true });
                    if (updatedCase) {
                        setCases(prev => prev.map(c => c.id === updatedCase!.id ? updatedCase! : c));
                    }
                } else if (reviewTarget.source.type === 'appointment') {
                    // Handle appointment reviewed state if we had it in service/storage
                    const apptIndex = appointments.findIndex(a => a.id === reviewTarget.source.id);
                    if (apptIndex > -1) {
                        const updatedAppointments = [...appointments];
                        updatedAppointments[apptIndex].reviewed = true;
                        setAppointments(updatedAppointments);
                    }
                }

                setToast({ message: "Review submitted successfully!", type: 'success' });
            }
            setReviewTarget(null);
        }
    };

    const handleUpdateProfile = async (userId: string, data: Partial<User>) => {
        const updatedUser = await authService.updateUserProfile(userId, data);
        setUser(updatedUser);
        setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    };

    const handleChangePassword = async (userId: string, oldPass: string, newPass: string) => {
        return await authService.changePassword(userId, oldPass, newPass);
    };

    const updateUserVerification = async (userId: string, status: VerificationStatus) => {
        const updatedUser = await authService.updateUserVerificationStatus(userId, status);
        setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    };

    const handleUpdateAppointment = (id: string, data: Partial<Appointment>) => {
        setAppointments(prev => prev.map(a => a.id === id ? { ...a, ...data } : a));
    };

    const toggleTheme = () => {
        const newTheme = isDarkMode ? 'light' : 'dark';
        setTheme(newTheme);
    };

    const setTheme = (theme: AppTheme) => {
        if (theme === 'dark') {
            setIsDarkMode(true);
            document.documentElement.classList.add('dark');
            localStorage.theme = 'dark';
        } else if (theme === 'light') {
            setIsDarkMode(false);
            document.documentElement.classList.remove('dark');
            localStorage.theme = 'light';
        } else {
            localStorage.removeItem('theme');
            if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                setIsDarkMode(true);
                document.documentElement.classList.add('dark');
            } else {
                setIsDarkMode(false);
                document.documentElement.classList.remove('dark');
            }
        }
    };

    // Other Handlers
    const showLegalPage = (title: string, type: 'terms' | 'privacy') => {
        setLegalPageContent({ title, content: type === 'terms' ? termsContent : privacyContent });
        handleSetCurrentPage('legal');
    };

    const handleReadEmail = (id: string) => {
        setSimulatedEmails(prev => prev.map(e => e.id === id ? { ...e, read: true } : e));
    };

    const handleFindLawyerFromEmergency = () => {
        setEmergencyHelpOpen(false);
        handleHireLawyerClick();
    };

    const handleLiveChatFromEmergency = () => {
        setEmergencyHelpOpen(false);
        setChatOpen(true);
    };

    const handleMakeComplaint = (helpline: { name: string; email: string }) => {
        setEmergencyHelpOpen(false);
        setComplaintModalTarget(helpline);
    };

    const setSelectedCaseForUpload = () => {
        // Placeholder if needed logic differs
        setDashboardSubPage('cases');
    };

    return {
        user, users, currentPage, authPageMode, initialSignupRole, userToReset, legalPageContent, emailVerificationPageStatus,
        isEmergencyHelpOpen, isEmergencyReportOpen, complaintModalTarget, isChatOpen, toast, simulatedEmails, isGmailInboxOpen, isGoogleAuthOpen, reviewTarget,
        dashboardSubPage, cases, appointments, messages, evidenceDocuments, notifications, activityLogs, selectedCaseId, typingLawyers, isInboxOpen, isNotificationsOpen, isDarkMode,
        handleSetCurrentPage, handleLogin, handleSignup, onSimulateGoogleLogin, handleEmailVerification, clearSession, handleLogout, goToAuth,
        handleForgotPasswordRequest, handlePasswordReset, showLegalPage, setGoogleAuthOpen, handleReadEmail, handleHireLawyerClick,
        handleFindLawyerFromEmergency, handleLiveChatFromEmergency, handleMakeComplaint, setEmergencyHelpOpen, setEmergencyReportOpen,
        setComplaintModalTarget, setChatOpen, setGmailInboxOpen, setToast, setReviewTarget, handleReviewSubmit,
        setDashboardSubPage, setSelectedCaseId, handleNotificationNavigation, setInboxOpen, setNotificationsOpen, openInbox, openNotifications,
        markAllNotificationsAsRead, markMessagesAsRead, markConversationAsRead, handleDocumentUpload, handleDeleteDocument, handleSendMessage,
        setSelectedCaseForUpload, handleUpdateProfile, handleChangePassword, updateUserVerification, handleUpdateAppointment, toggleTheme, setTheme
    };
};
