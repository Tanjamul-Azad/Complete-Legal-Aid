
import React, { useContext } from 'react';
import type { Page } from './types';
import { AppContext, AppProvider } from './context/AppContext';
import { Header } from './components/Header';
import { HomePage } from './components/pages/HomePage';
import { AboutPage } from './components/pages/AboutPage';
import { ContactPage } from './components/pages/ContactPage';
import { DashboardPage } from './components/dashboard/DashboardPage';
import { AuthPage } from './components/pages/AuthPage';
import { PendingVerificationPage } from './components/pages/PendingVerificationPage';
import { ResetPasswordPage } from './components/pages/ResetPasswordPage';
import { LegalPage } from './components/pages/LegalPage';
import { EmailVerificationPage } from './components/pages/EmailVerificationPage';
import { LegalInsightsPage } from './components/pages/LegalInsightsPage';
import { AiChatbot } from './components/AiChatbot';
import { EmergencyButton } from './components/EmergencyButton';
import { EmergencyHelpModal } from './components/EmergencyHelpModal';
import { EmergencyReportModal } from './components/EmergencyReportModal';
import { ComplaintModal } from './components/ComplaintModal';
import { ReviewModal } from './components/dashboard/ReviewModal';
import { ScaleIcon, CloseIcon, SparklesIcon } from './components/icons';
import { Toast } from './components/ui/Toast';

// --- Simulation Modals ---

const SimulatedGoogleAuthModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onLogin: (email: string) => void;
    users: any[];
}> = ({ isOpen, onClose, onLogin, users }) => {
    if (!isOpen) return null;
    const simUsers = users.filter(u => u.role !== 'admin').slice(0, 2);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[101]">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-sm">
                <div className="p-4 border-b text-center">
                    <h2 className="text-xl font-medium text-gray-800">Choose an account</h2>
                    <p className="text-sm text-gray-600">to continue to Complete Legal Aid</p>
                </div>
                <div className="p-2">
                    <ul className="divide-y">
                        {simUsers.map(user => (
                            <li key={user.id}>
                                <button onClick={() => { onLogin(user.email); onClose(); }} className="w-full text-left flex items-center space-x-4 p-3 hover:bg-gray-100 rounded-lg">
                                    <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full" />
                                    <div>
                                        <p className="font-medium text-gray-900">{user.name}</p>
                                        <p className="text-sm text-gray-500">{user.email}</p>
                                    </div>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="p-4 border-t">
                    <button onClick={onClose} className="text-sm font-medium text-blue-600 hover:bg-gray-100 p-2 rounded-md w-full">
                        Use another account
                    </button>
                </div>
            </div>
        </div>
    );
};

const SimulatedGmailInbox: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    emails: any[];
    onReadEmail: (id: string) => void;
    setCurrentPage: (page: Page) => void;
    onVerifyClick: (token: string) => void;
}> = ({ isOpen, onClose, emails, onReadEmail, setCurrentPage, onVerifyClick }) => {
    if (!isOpen) return null;

    const handleActionClick = (email: any) => {
        onReadEmail(email.id);
        if (email.action?.type === 'RESET_PASSWORD') {
            setCurrentPage('reset-password');
        } else if (email.action?.type === 'VERIFY_EMAIL') {
            onVerifyClick(email.action.token);
        }
        onClose();
    };


    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[101] animate-fade-in p-4">
            <div className="bg-cla-bg dark:bg-cla-surface-dark rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
                <header className="p-4 border-b border-cla-border dark:border-cla-border-dark flex justify-between items-center">
                    <h2 className="text-xl font-bold text-cla-text dark:text-cla-text-dark">Simulated Inbox</h2>
                     <button onClick={onClose} className="text-cla-text-muted dark:text-cla-text-muted-dark hover:text-cla-text dark:hover:text-cla-text-dark">
                        <CloseIcon />
                    </button>
                </header>
                <div className="flex-1 overflow-y-auto">
                    {emails.length === 0 ? (
                        <p className="p-6 text-center text-cla-text-muted dark:text-cla-text-muted-dark">Your inbox is empty.</p>
                    ) : (
                        <ul>
                            {emails.slice().reverse().map(email => (
                                <li key={email.id} className={`p-4 border-b border-cla-border dark:border-cla-border-dark ${!email.read ? 'bg-cla-gold/10' : ''}`}>
                                    <p className="font-bold text-cla-text dark:text-cla-text-dark">{email.from}</p>
                                    <p className="font-medium text-cla-text dark:text-cla-text-dark">{email.subject}</p>
                                    <div className="mt-2 text-sm text-cla-text-muted dark:text-cla-text-muted-dark" dangerouslySetInnerHTML={{ __html: email.body }} />
                                    {email.action && (
                                         <button onClick={() => handleActionClick(email)} className="mt-2 text-sm text-blue-500 hover:underline">
                                             {email.action.buttonText}
                                         </button>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};


const Footer: React.FC = () => {
    const context = useContext(AppContext);
    if (!context) return null;
    const { handleSetCurrentPage, showLegalPage } = context;
    
    const handleLinkClick = (e: React.MouseEvent, page: Page) => {
        e.preventDefault();
        handleSetCurrentPage(page);
    };

    return (
        // Dark footer for professional anchor look in both themes
        <footer className="bg-[#020617] text-slate-300 border-t border-slate-800">
            <div className="container mx-auto px-6 max-w-[1200px] py-16">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                    {/* CLA Info */}
                    <div className="md:col-span-2 pr-8">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="h-8 w-8 rounded-md bg-cla-gold flex items-center justify-center text-white font-bold">CLA</div>
                            <span className="text-2xl font-bold text-white tracking-tight font-serif">Complete Legal Aid</span>
                        </div>
                        <p className="text-sm leading-relaxed text-slate-400 max-w-md">
                            Complete Legal Aid (CLA) is a pioneering platform bridging the gap between citizens and justice. We combine expert legal representation with cutting-edge AI technology.
                        </p>
                    </div>

                    {/* Information */}
                    <div>
                        <h3 className="text-white font-bold mb-6 tracking-wide uppercase text-xs">Information</h3>
                        <ul className="space-y-3 text-sm text-slate-400">
                            <li>House #123, Road #5, Block #C</li>
                            <li>Dhaka, Bangladesh</li>
                            <li><a href="mailto:connect@cla-bangladesh.com" className="hover:text-white transition-colors">connect@cla-bangladesh.com</a></li>
                            <li>+880 1712 345678</li>
                        </ul>
                    </div>

                    {/* Useful Links */}
                    <div>
                        <h3 className="text-white font-bold mb-6 tracking-wide uppercase text-xs">Useful Links</h3>
                        <ul className="space-y-3 text-sm text-slate-400">
                            <li><button onClick={(e) => handleLinkClick(e, 'contact')} className="hover:text-cla-gold transition-colors">Contact Us</button></li>
                            <li><button onClick={(e) => handleLinkClick(e, 'about')} className="hover:text-cla-gold transition-colors">FAQ</button></li>
                            <li><button onClick={(e) => handleLinkClick(e, 'about')} className="hover:text-cla-gold transition-colors">Help</button></li>
                            <li><button onClick={(e) => handleLinkClick(e, 'insights')} className="hover:text-cla-gold transition-colors">Legal Insights</button></li>
                        </ul>
                    </div>
                </div>
                 <div className="mt-16 border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-slate-500">
                    <p>&copy; {new Date().getFullYear()} COMPLETE LEGAL AID. All Rights Reserved.</p>
                    <div className="flex space-x-6 mt-4 md:mt-0">
                        <button onClick={() => showLegalPage('Terms & Conditions', 'terms')} className="hover:text-cla-gold transition-colors">Terms & Conditions</button>
                        <button onClick={() => showLegalPage('Privacy Policy', 'privacy')} className="hover:text-cla-gold transition-colors">Privacy Policy</button>
                    </div>
                </div>
            </div>
        </footer>
    );
};


const PageRenderer: React.FC = () => {
    const context = useContext(AppContext);
    if (!context) return null;
    
    const {
        currentPage, user, authPageMode, initialSignupRole, userToReset, legalPageContent, emailVerificationPageStatus,
        handleSetCurrentPage, handleLogin, handleSignup, onSimulateGoogleLogin, handleEmailVerification, clearSession, handleLogout, goToAuth, handleForgotPasswordRequest, handlePasswordReset, showLegalPage, setGoogleAuthOpen
    } = context;

    // Handle unverified user states first
    if (user) {
        if (user.verificationStatus === 'PendingEmailVerification') {
            return <EmailVerificationPage status="prompt" setCurrentPage={handleSetCurrentPage} />;
        }
        if (user.verificationStatus === 'Pending') {
            return <PendingVerificationPage user={user} logout={handleLogout} />;
        }
    }

    switch (currentPage) {
        case 'home':
            return <HomePage setCurrentPage={handleSetCurrentPage} openEmergencyModal={() => context.setEmergencyHelpOpen(true)} goToAuth={goToAuth} />;
        case 'about':
            return <AboutPage setCurrentPage={handleSetCurrentPage} />;
        case 'contact':
            return <ContactPage setCurrentPage={handleSetCurrentPage} />;
        case 'login':
            return <AuthPage onLogin={handleLogin} onSignup={handleSignup} onSimulateGoogleLogin={onSimulateGoogleLogin} openGoogleAuth={() => setGoogleAuthOpen(true)} defaultMode={authPageMode} initialSignupRole={initialSignupRole} onForgotPassword={handleForgotPasswordRequest} setCurrentPage={handleSetCurrentPage} showLegalPage={showLegalPage} onLogout={clearSession} />;
        case 'reset-password':
            return userToReset ? <ResetPasswordPage onReset={handlePasswordReset} /> : <AuthPage onLogin={handleLogin} onSignup={handleSignup} onSimulateGoogleLogin={onSimulateGoogleLogin} openGoogleAuth={() => setGoogleAuthOpen(true)} defaultMode="login" initialSignupRole="citizen" onForgotPassword={handleForgotPasswordRequest} setCurrentPage={handleSetCurrentPage} showLegalPage={showLegalPage} onLogout={clearSession} />;
        case 'legal':
            return legalPageContent ? <LegalPage setCurrentPage={handleSetCurrentPage} title={legalPageContent.title} content={legalPageContent.content} /> : <HomePage setCurrentPage={handleSetCurrentPage} openEmergencyModal={() => context.setEmergencyHelpOpen(true)} goToAuth={goToAuth} />;
        case 'email-verification':
            return <EmailVerificationPage status={emailVerificationPageStatus} setCurrentPage={handleSetCurrentPage} />;
        case 'insights':
            return <LegalInsightsPage setCurrentPage={handleSetCurrentPage} />;
        case 'dashboard':
            return user ? <DashboardPage /> : <AuthPage onLogin={handleLogin} onSignup={handleSignup} onSimulateGoogleLogin={onSimulateGoogleLogin} openGoogleAuth={() => setGoogleAuthOpen(true)} defaultMode="login" initialSignupRole="citizen" onForgotPassword={handleForgotPasswordRequest} setCurrentPage={handleSetCurrentPage} showLegalPage={showLegalPage} onLogout={clearSession} />;
        default:
            return <HomePage setCurrentPage={handleSetCurrentPage} openEmergencyModal={() => context.setEmergencyHelpOpen(true)} goToAuth={goToAuth} />;
    }
};

const AppContent: React.FC = () => {
    const context = useContext(AppContext);
    if (!context) return null;
    
    const {
        currentPage, isEmergencyHelpOpen, isEmergencyReportOpen, complaintModalTarget, isChatOpen, toast, simulatedEmails, isGmailInboxOpen, isGoogleAuthOpen, users, reviewTarget,
        onSimulateGoogleLogin, handleEmailVerification, handleReadEmail, handleHireLawyerClick, handleFindLawyerFromEmergency, handleLiveChatFromEmergency, handleMakeComplaint, setEmergencyHelpOpen, setEmergencyReportOpen, setComplaintModalTarget, setChatOpen, setGoogleAuthOpen, setGmailInboxOpen, setToast, handleSetCurrentPage, setReviewTarget, handleReviewSubmit
    } = context;

    const isDashboard = currentPage === 'dashboard';
    const lawyerToReview = users.find(u => u.id === reviewTarget?.lawyerId);

    return (
        <div className={`bg-cla-bg dark:bg-cla-bg-dark text-cla-text dark:text-cla-text-dark font-sans ${isDashboard ? 'h-screen overflow-hidden' : 'flex flex-col min-h-screen'}`}>
            {isDashboard ? null : <Header />}
            
            <main className={isDashboard ? 'h-full' : 'flex-1 flex flex-col'}>
                <PageRenderer />
            </main>

            {isDashboard ? null : <Footer />}

            {/* Floating Buttons & Modals that can appear on any page */}
            {!isDashboard && <EmergencyButton onClick={() => setEmergencyHelpOpen(true)} /> }
            
            {!isDashboard && !isChatOpen && (
                 <button
                    onClick={() => setChatOpen(true)}
                    className="ai-assistant-btn glow"
                >
                    <SparklesIcon className="w-5 h-5" />
                    AI Assistant
                </button>
            )}

            <EmergencyHelpModal
                isOpen={isEmergencyHelpOpen}
                onClose={() => setEmergencyHelpOpen(false)}
                onReport={() => {
                    setEmergencyHelpOpen(false);
                    setEmergencyReportOpen(true);
                }}
                onFindLawyer={handleFindLawyerFromEmergency}
                onLiveChat={handleLiveChatFromEmergency}
                onMakeComplaint={handleMakeComplaint}
            />
            <EmergencyReportModal
                isOpen={isEmergencyReportOpen}
                onClose={() => setEmergencyReportOpen(false)}
            />
             {complaintModalTarget && (
                <ComplaintModal
                    isOpen={!!complaintModalTarget}
                    onClose={() => setComplaintModalTarget(null)}
                    helplineName={complaintModalTarget.name}
                    recipientEmail={complaintModalTarget.email}
                />
            )}

            <AiChatbot isOpen={isChatOpen} setIsOpen={setChatOpen} onHireLawyerClick={handleHireLawyerClick} />
            
            <Toast show={!!toast} message={toast?.message || ''} type={toast?.type} onDismiss={() => setToast(null)} />

            <SimulatedGoogleAuthModal
                isOpen={isGoogleAuthOpen}
                onClose={() => setGoogleAuthOpen(false)}
                onLogin={onSimulateGoogleLogin}
                users={users}
            />
             <SimulatedGmailInbox
                isOpen={isGmailInboxOpen}
                onClose={() => setGmailInboxOpen(false)}
                emails={simulatedEmails}
                onReadEmail={handleReadEmail}
                setCurrentPage={handleSetCurrentPage}
                onVerifyClick={handleEmailVerification}
            />
            <ReviewModal 
                isOpen={!!reviewTarget}
                onClose={() => setReviewTarget(null)}
                onSubmit={handleReviewSubmit}
                lawyerName={lawyerToReview?.name || ''}
            />
        </div>
    );
};


const App: React.FC = () => (
    <AppProvider>
        <AppContent />
    </AppProvider>
);

export default App;
