import { useState, useEffect, useCallback } from 'react';
import type { User, UserRole, Page, DashboardSubPage, SimulatedEmail, Notification, Case, Appointment, ActivityLog, Message, EvidenceDocument, Review, VerificationStatus, AppTheme, SiteContent, SupportMessage, EmergencyAlert } from '../types';
import { authService } from '../services/authService';
import { caseService } from '../services/caseService';
import { appointmentService } from '../services/appointmentService';
import { notificationService } from '../services/notificationService';
import { chatService } from '../services/chatService';
import { evidenceService } from '../services/evidenceService';
import { termsContent } from '../legal/terms';
import { privacyContent } from '../legal/privacy';

// Navigation history entry type
type NavigationHistoryEntry = {
    page: Page;
    subPage?: DashboardSubPage;
    caseId?: string | null;
};

export const useAppLogic = () => {
    // Navigation History Stack (for back button)
    const [navigationHistory, setNavigationHistory] = useState<NavigationHistoryEntry[]>([]);

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
    const [aiChatInitialPrompt, setAiChatInitialPrompt] = useState<string | null>(null);

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
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [evidenceDocuments, setEvidenceDocuments] = useState<EvidenceDocument[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
    const [typingLawyers, setTypingLawyers] = useState<Record<string, boolean>>({});
    const [chatTargetUser, setChatTargetUser] = useState<User | null>(null);
    const [supportMessages, setSupportMessages] = useState<SupportMessage[]>(() => {
        const stored = localStorage.getItem('cla-support-messages');
        return stored ? JSON.parse(stored) : [];
    });

    // Emergency Alerts State
    const [emergencyAlerts, setEmergencyAlerts] = useState<EmergencyAlert[]>(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('cla-emergency-alerts');
            return stored ? JSON.parse(stored) : [];
        }
        return [];
    });

    const sendEmergencyAlert = (location: { lat: number; lng: number; address?: string }) => {
        if (!user) return;

        const newAlert: EmergencyAlert = {
            id: `alert - ${Date.now()} `,
            userId: user.id,
            userName: user.name,
            userPhone: user.phone || 'N/A',
            location,
            timestamp: Date.now(),
            status: 'Active'
        };

        setEmergencyAlerts(prev => {
            const updated = [newAlert, ...prev];
            localStorage.setItem('cla-emergency-alerts', JSON.stringify(updated));
            return updated;
        });

        // Also create a high-priority notification for admins (simulated by adding to general notifications for now, 
        // in a real app this would be pushed to admin users)
        const adminNotification: Notification = {
            id: `notif - alert - ${Date.now()} `,
            userId: 'admin-1', // Assuming an admin ID or broadcast
            type: 'system',
            title: 'CRITICAL: Emergency Alert',
            body: `${user.name} has triggered an emergency alert!`,
            link: { page: 'overview' },
            timestamp: Date.now(),
            read: false,
            severity: 'critical'
        };
        // For demo, we just push it to the notifications array, assuming the current user might see it if they are admin, 
        // or it's just stored.
        setNotifications(prev => [adminNotification, ...prev]);

        setToast({ message: "Emergency Alert Sent! Help is on the way.", type: 'success' });
    };

    const resolveEmergencyAlert = (id: string, status: 'Resolved' | 'False Alarm') => {
        setEmergencyAlerts(prev => {
            const updated = prev.map(alert => alert.id === id ? { ...alert, status } : alert);
            localStorage.setItem('cla-emergency-alerts', JSON.stringify(updated));
            return updated;
        });
        setToast({ message: `Alert marked as ${status} `, type: 'success' });
    };

    const addSupportMessage = (msg: Omit<SupportMessage, 'id' | 'timestamp' | 'status'>) => {
        const newMsg: SupportMessage = {
            ...msg,
            id: Date.now().toString(),
            timestamp: Date.now(),
            status: 'New'
        };
        setSupportMessages(prev => {
            const updated = [newMsg, ...prev];
            localStorage.setItem('cla-support-messages', JSON.stringify(updated));
            return updated;
        });
    };


    // Site Content State
    const [siteContent, setSiteContent] = useState<SiteContent>(() => {
        const stored = localStorage.getItem('cla-site-content');
        if (stored) return JSON.parse(stored);
        return {
            about: {
                mission: 'To empower every citizen with the legal resources and support they need to navigate the complexities of the judicial system with confidence and ease.',
                vision: 'To create a digitally-integrated legal ecosystem in Bangladesh where finding legal help is as simple, transparent, and reliable as any modern digital service.',
                values: 'Integrity, Accessibility, and Innovation. We believe in a justice system that is fair, open, and accessible to everyone, regardless of their background or financial status.'
            },
            contact: {
                email: 'support@cla-bangladesh.com',
                phone: '+880 1234 567 890',
                address: '123 Justice Avenue, Dhaka, Bangladesh'
            },
            privacy: privacyContent,
            terms: termsContent
        };
    });

    const updateSiteContent = (newContent: Partial<SiteContent>) => {
        setSiteContent(prev => {
            const updated = { ...prev, ...newContent };
            localStorage.setItem('cla-site-content', JSON.stringify(updated));
            return updated;
        });
    };


    // Initialization
    // Poll for new messages every 5 seconds
    useEffect(() => {
        if (!user) return;

        const intervalId = setInterval(async () => {
            const newMessages = await chatService.getMessages();
            setMessages(prev => {
                // Only update if there are new messages to avoid re-renders
                if (newMessages.length !== prev.length) {
                    return newMessages;
                }
                // Check for last message timestamp difference
                const lastNew = newMessages[newMessages.length - 1];
                const lastPrev = prev[prev.length - 1];
                if (lastNew && lastPrev && lastNew.id !== lastPrev.id) {
                    return newMessages;
                }
                return prev;
            });
        }, 5000);

        return () => clearInterval(intervalId);
    }, [user]);

    const bootstrapUserState = useCallback(async (currentUser: User) => {
        setUser(currentUser);
        const [userCases, userAppointments, userNotifications, documents, userMessages] = await Promise.all([
            caseService.getUserCases(currentUser),
            appointmentService.getUserAppointments(currentUser.id, currentUser.role),
            notificationService.getUserNotifications(),
            evidenceService.getDocuments(),
            chatService.getMessages(), // Fetch messages for all users, not just admins
        ]);

        setCases(userCases);
        setAppointments(userAppointments);
        setNotifications(userNotifications);
        setEvidenceDocuments(documents);
        setMessages(userMessages); // Set messages for all users

        if (currentUser.role === 'admin') {
            const allUsers = await authService.getAllUsers();
            setUsers(allUsers);
            const fetchedCases = await caseService.getCases();
            setCases(fetchedCases);
            // Messages already fetched above for all users
        } else {
            setUsers([currentUser]);
        }
    }, []);

    useEffect(() => {
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
            authService.getCurrentUser().then(u => {
                if (u) {
                    bootstrapUserState(u);
                }
            });
        }
    }, [bootstrapUserState]);

    // Persist dashboard state
    useEffect(() => {
        localStorage.setItem('cla-last-subpage', dashboardSubPage);
        if (user) {
            if (selectedCaseId) {
                localStorage.setItem('cla-last-case-id', selectedCaseId);
            } else {
                localStorage.removeItem('cla-last-case-id');
            }
        }
    }, [dashboardSubPage, selectedCaseId, user]);

    // Navigation
    const addToHistory = useCallback((entry: NavigationHistoryEntry) => {
        setNavigationHistory(prev => {
            const newHistory = [...prev, entry];
            // Keep only last 10 entries
            return newHistory.slice(-10);
        });
    }, []);

    const handleSetCurrentPage = (page: Page) => {
        // Add current state to history before navigating
        if (currentPage !== page) {
            addToHistory({
                page: currentPage,
                subPage: currentPage === 'dashboard' ? dashboardSubPage : undefined,
                caseId: currentPage === 'dashboard' ? selectedCaseId : undefined
            });
        }
        setCurrentPage(page);
        window.scrollTo(0, 0);
    };

    const handleSetDashboardSubPage = (subPage: DashboardSubPage, caseId?: string | null) => {
        // Add current state to history before navigating
        addToHistory({
            page: 'dashboard',
            subPage: dashboardSubPage,
            caseId: selectedCaseId
        });
        setDashboardSubPage(subPage);
        if (caseId !== undefined) {
            setSelectedCaseId(caseId);
        }
    };

    const handleGoBack = () => {
        if (navigationHistory.length > 0) {
            const previousEntry = navigationHistory[navigationHistory.length - 1];
            // Remove it from history
            setNavigationHistory(prev => prev.slice(0, -1));

            // Restore the previous state WITHOUT adding to history
            setCurrentPage(previousEntry.page);
            if (previousEntry.subPage) {
                setDashboardSubPage(previousEntry.subPage);
            }
            if (previousEntry.caseId !== undefined) {
                setSelectedCaseId(previousEntry.caseId);
            }
            window.scrollTo(0, 0);
        }
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
            // Normalize role to lowercase for comparison (backend returns uppercase)
            const userRole = (foundUser.role as string).toLowerCase() as UserRole;
            if (userRole !== expectedRole) {
                if (expectedRole === 'admin' && userRole !== 'admin') return 'ROLE_MISMATCH';
                if (expectedRole === 'lawyer' && userRole !== 'lawyer') return 'ROLE_MISMATCH';
                if (expectedRole === 'citizen' && userRole !== 'citizen') return 'ROLE_MISMATCH';
            }

            // Normalize the role in the user object for consistency
            foundUser.role = userRole;

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

            await bootstrapUserState(foundUser);

            // Redirect to dashboard for all users, even if unverified
            handleSetCurrentPage('dashboard');

            // Default to overview on fresh login for better UX if empty
            if (!localStorage.getItem('cla-last-subpage')) {
                setDashboardSubPage('overview');
            }
            return foundUser;
        }
        return null;
    };

    const handleSignup = async (newUser: Omit<User, 'id' | 'avatar'>, options?: { verificationDocument?: File }): Promise<User | null> => {
        // Map User type to RegisterData expected by API
        const registerData = {
            email: newUser.email,
            phone_number: newUser.phone, // Map 'phone' to 'phone_number'
            password: newUser.password,
            name: newUser.name,
            role: newUser.role.toUpperCase() as 'CITIZEN' | 'LAWYER',
            language: newUser.language === 'Bangla' ? 'BN' as 'BN' : 'EN' as 'EN',
            lawyerId: newUser.lawyerId,
            bio: newUser.bio,
            experience: newUser.experience,
            verificationDocument: options?.verificationDocument,
        };

        const result = await authService.signup(registerData);
        if ('error' in result) return null;

        const { user: createdUser } = result;
        await bootstrapUserState(createdUser);

        // Simulate email for demo purposes (in real app, backend sends it)
        const email: SimulatedEmail = {
            id: `email - ${Date.now()} `,
            to: newUser.email,
            from: 'system@cla.com',
            subject: 'Verify your email',
            body: 'Please click the link to verify your email.',
            timestamp: Date.now(),
            read: false
        };
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
        setEmailVerificationPageStatus(status === 'verified' ? 'success' : status);
        if (status === 'verified' && verifiedUser) {
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
        if (result && result.success) {
            // Simulate email for demo
            const simEmail: SimulatedEmail = {
                id: `email - reset - ${Date.now()} `,
                to: email,
                from: 'support@cla.com',
                subject: 'Reset Password',
                body: 'Click here to reset your password.',
                timestamp: Date.now(),
                read: false
            };
            setSimulatedEmails(prev => [simEmail, ...prev]);
            // We don't get the user ID back from a standard reset request usually
            // setUserToReset(result.user.id); 
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

    const handleDocumentUpload = async (file: File, caseId: string): Promise<EvidenceDocument | null> => {
        try {
            const uploadedDoc = await evidenceService.uploadDocument(file, caseId);
            setEvidenceDocuments(prev => [uploadedDoc, ...prev]);

            if (user) {
                const newLog: ActivityLog = {
                    id: `act - ${Date.now()} `,
                    userId: user.id,
                    message: `You uploaded "${file.name}".`,
                    timestamp: 'Just now',
                    caseId,
                };
                setActivityLogs(prev => [newLog, ...prev]);
            }

            setToast({ message: 'Document uploaded successfully.', type: 'success' });
            return uploadedDoc;
        } catch (error) {
            console.error('Document upload failed', error);
            setToast({ message: 'Failed to upload document.', type: 'error' });
            return null;
        }
    };

    const handleDeleteDocument = async (docId: string) => {
        try {
            await evidenceService.deleteDocument(docId);
            setEvidenceDocuments(prev => prev.filter(d => d.id !== docId));
            setToast({ message: 'Document deleted.', type: 'success' });
        } catch (error) {
            console.error('Delete document error', error);
            setToast({ message: 'Failed to delete document.', type: 'error' });
        }
    };

    const handleSendMessage = async (receiverId: string, text: string, caseId?: string, attachment?: { name: string, url: string, size: number }) => {
        if (!user) return;

        // Optimistic update
        const tempId = `msg - ${Date.now()} `;
        const optimisticMessage: Message = {
            id: tempId,
            senderId: user.id,
            receiverId,
            text,
            timestamp: Date.now(),
            read: false,
            caseId,
            attachment
        };
        setMessages(prev => [...prev, optimisticMessage]);

        const sentMessage = await chatService.sendMessage(receiverId, text, caseId);

        if (sentMessage) {
            // Replace optimistic message with real one
            setMessages(prev => prev.map(m => m.id === tempId ? sentMessage : m));
        } else {
            // Revert optimistic update on failure
            setMessages(prev => prev.filter(m => m.id !== tempId));
            setToast({ message: 'Failed to send message.', type: 'error' });
        }

        // Simulate reply
        if (caseId) {
            setTypingLawyers(prev => ({ ...prev, [caseId]: true }));
            setTimeout(() => {
                setTypingLawyers(prev => ({ ...prev, [caseId]: false }));
                const reply: Message = {
                    id: `msg - reply - ${Date.now()} `,
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
                    id: `notif - ${Date.now()} `,
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

    const markAllNotificationsAsRead = async () => {
        if (!user) return;
        await notificationService.markAllAsRead();
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
            const updatedLawyerSuccess = await authService.addLawyerReview(reviewTarget.lawyerId, review);
            if (updatedLawyerSuccess) {
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
        setUser(prev => (prev && prev.id === updatedUser.id ? updatedUser : prev));
    };

    const deleteUser = async (userId: string) => {
        const success = await authService.deleteUser(userId);
        if (success) {
            setUsers(prev => prev.filter(u => u.id !== userId));
            setToast({ message: "User deleted successfully.", type: 'success' });
        } else {
            setToast({ message: "Failed to delete user.", type: 'error' });
        }
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
        setLegalPageContent({ title, content: type === 'terms' ? siteContent.terms : siteContent.privacy });
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
        navigationHistory, handleGoBack, handleSetDashboardSubPage,
        handleSetCurrentPage, handleLogin, handleSignup, onSimulateGoogleLogin, handleEmailVerification, clearSession, handleLogout, goToAuth,
        handleForgotPasswordRequest, handlePasswordReset, showLegalPage, setGoogleAuthOpen, handleReadEmail, handleHireLawyerClick,
        handleFindLawyerFromEmergency, handleLiveChatFromEmergency, handleMakeComplaint, setEmergencyHelpOpen, setEmergencyReportOpen,
        setComplaintModalTarget, setChatOpen, setGmailInboxOpen, setToast, setReviewTarget, handleReviewSubmit,
        setDashboardSubPage, setSelectedCaseId, handleNotificationNavigation, setInboxOpen, setNotificationsOpen, openInbox, openNotifications,
        markAllNotificationsAsRead, markMessagesAsRead, markConversationAsRead, handleDocumentUpload, handleDeleteDocument, handleSendMessage,
        setSelectedCaseForUpload, handleUpdateProfile, handleChangePassword, updateUserVerification, deleteUser, handleUpdateAppointment, toggleTheme, setTheme,
        siteContent, updateSiteContent,
        chatTargetUser, setChatTargetUser,
        supportMessages, addSupportMessage,
        aiChatInitialPrompt, setAiChatInitialPrompt,
        emergencyAlerts, sendEmergencyAlert, resolveEmergencyAlert
    };

};
