
import { useContext } from 'react';
import type { Page } from './types';
import { AppContext, AppProvider } from './context/AppContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './components/pages/HomePage';
import { AboutPage } from './components/pages/AboutPage';
import { ContactPage } from './components/pages/ContactPage';
import { CareersPage } from './components/pages/CareersPage';
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
import { SparklesIcon } from './components/icons';
import { Toast } from './components/ui/Toast';
import { SimulatedGoogleAuthModal } from './components/modals/SimulatedGoogleAuthModal';
import { SimulatedGmailInbox } from './components/modals/SimulatedGmailInbox';



const PageRenderer = () => {
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
        case 'careers':
            return <CareersPage setCurrentPage={handleSetCurrentPage} />;
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

const AppContent = () => {
    const context = useContext(AppContext);
    if (!context) return null;

    const {
        currentPage, isEmergencyHelpOpen, isEmergencyReportOpen, complaintModalTarget, isChatOpen, toast, simulatedEmails, isGmailInboxOpen, isGoogleAuthOpen, users, reviewTarget,
        onSimulateGoogleLogin, handleEmailVerification, handleReadEmail, handleHireLawyerClick, handleFindLawyerFromEmergency, handleLiveChatFromEmergency, handleMakeComplaint, setEmergencyHelpOpen, setEmergencyReportOpen, setComplaintModalTarget, setChatOpen, setGoogleAuthOpen, setGmailInboxOpen, setToast, handleSetCurrentPage, setReviewTarget, handleReviewSubmit,
        aiChatInitialPrompt, setAiChatInitialPrompt
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
            {!isDashboard && <EmergencyButton onClick={() => setEmergencyHelpOpen(true)} />}

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

            <AiChatbot
                isOpen={isChatOpen}
                setIsOpen={setChatOpen}
                onHireLawyerClick={handleHireLawyerClick}
                initialPrompt={aiChatInitialPrompt}
                onInitialPromptSent={() => setAiChatInitialPrompt(null)}
            />

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


const App = () => (
    <AppProvider>
        <AppContent />
    </AppProvider>
);

export default App;
