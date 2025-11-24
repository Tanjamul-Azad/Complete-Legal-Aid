
import { ALL_USERS } from '../constants';
import type { User, VerificationStatus, SimulatedEmail, Review } from '../types';

// In a real app, this would be an API layer. Here, it simulates a database.
let usersDB: User[] = (() => {
    try {
        const storedUsers = localStorage.getItem('cla-users');
        return storedUsers ? JSON.parse(storedUsers) : [...ALL_USERS];
    } catch (error) {
        console.error("Failed to parse users from localStorage", error);
        return [...ALL_USERS];
    }
})();

const syncToLocalStorage = () => {
    try {
        localStorage.setItem('cla-users', JSON.stringify(usersDB));
    } catch (error) {
        console.error("Failed to save users to localStorage", error);
    }
};

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
const generateToken = () => Math.random().toString(36).substring(2);

const sanitizeUser = (user: User): User => {
    const { password, ...sanitized } = user;
    return sanitized;
};

const login = async (identifier: string, pass: string): Promise<User | null> => {
    await delay(500);
    const foundUser = usersDB.find(u => (u.email === identifier || u.phone === identifier) && u.password === pass);
    return foundUser ? sanitizeUser(foundUser) : null;
};

const resendVerificationEmail = async (user: User): Promise<{ updatedUser: User, email: SimulatedEmail }> => {
    const newVerificationToken = generateToken();
    const newExpiry = Date.now() + 24 * 60 * 60 * 1000;
    let updatedUser: User | null = null;
    
    usersDB = usersDB.map(u => {
        if (u.id === user.id) {
            updatedUser = { ...u, verificationToken: newVerificationToken, verificationTokenExpires: newExpiry };
            return updatedUser;
        }
        return u;
    });
    syncToLocalStorage();

    const verificationEmail: SimulatedEmail = {
        id: `email-${Date.now()}`,
        from: 'Complete Legal Aid Security',
        subject: 'Verify Your Email Address (New Link)',
        body: `<p>Hello ${updatedUser!.name},</p><p>Here is your new verification link. Please click the button below to activate your account.</p><p>This link will expire in 24 hours.</p>`,
        read: false,
        timestamp: Date.now(),
        action: {
            type: 'VERIFY_EMAIL',
            token: newVerificationToken,
            buttonText: 'Verify Your Email Address'
        }
    };

    return { updatedUser: sanitizeUser(updatedUser!), email: verificationEmail };
};

const signup = async (newUser: Omit<User, 'id' | 'avatar'>): Promise<{ user: User, email: SimulatedEmail } | { error: string }> => {
    await delay(700);
    if (usersDB.some(u => u.email === newUser.email)) {
        return { error: 'An account with this email already exists.' };
    }
    
    const verificationToken = generateToken();
    const verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000;

    const createdUser: User = {
        ...newUser,
        id: `user-${Date.now()}`,
        avatar: `https://picsum.photos/seed/${Date.now()}/200`,
        verificationStatus: 'PendingEmailVerification',
        verificationToken,
        verificationTokenExpires,
    };
    
    usersDB.push(createdUser);
    syncToLocalStorage();
    
    const verificationEmail: SimulatedEmail = {
        id: `email-${Date.now()}`,
        from: 'Complete Legal Aid Security',
        subject: 'Verify Your Email Address',
        body: `<p>Hello ${createdUser.name},</p><p>Welcome to Complete Legal Aid! Please click the button below to verify your email address and activate your account.</p><p>This link will expire in 24 hours.</p>`,
        read: false,
        timestamp: Date.now(),
        action: {
            type: 'VERIFY_EMAIL',
            token: createdUser.verificationToken!,
            buttonText: 'Verify Your Email Address'
        }
    };
    
    return { user: sanitizeUser(createdUser), email: verificationEmail };
};

const verifyEmail = async (token: string): Promise<{ user: User | null; status: 'success' | 'invalid' | 'expired' }> => {
    await delay(400);
    const userToVerify = usersDB.find(u => u.verificationToken === token);
    
    if (!userToVerify) {
        return { user: null, status: 'invalid' };
    }
    if (userToVerify.verificationTokenExpires && Date.now() > userToVerify.verificationTokenExpires) {
        return { user: sanitizeUser(userToVerify), status: 'expired' };
    }
    
    const newStatus: VerificationStatus = userToVerify.role === 'citizen' ? 'Verified' : 'Pending';
    let updatedUser: User | null = null;
    
    usersDB = usersDB.map(u => {
        if (u.id === userToVerify.id) {
            updatedUser = { ...u, verificationStatus: newStatus, verificationToken: undefined, verificationTokenExpires: undefined };
            return updatedUser;
        }
        return u;
    });
    syncToLocalStorage();

    return { user: sanitizeUser(updatedUser!), status: 'success' };
};

const getCurrentUser = async (userId: string): Promise<User | null> => {
    const user = usersDB.find(u => u.id === userId);
    return user ? sanitizeUser(user) : null;
};

const requestPasswordReset = async (email: string): Promise<{ user: User, email: SimulatedEmail } | null> => {
    const foundUser = usersDB.find(u => u.email === email);
    if (foundUser) {
        const resetEmail: SimulatedEmail = {
            id: `email-${Date.now()}`,
            from: 'Complete Legal Aid Security',
            subject: 'Reset Your Password',
            body: `<p>Hello ${foundUser.name},</p><p>We received a request to reset your password. Click the link below to set a new one. If you did not make this request, you can safely ignore this email.</p>`,
            read: false,
            timestamp: Date.now(),
            action: {
                type: 'RESET_PASSWORD',
                token: `reset-token-for-${foundUser.id}`,
                buttonText: 'Click here to reset your password'
            }
        };
        return { user: sanitizeUser(foundUser), email: resetEmail };
    }
    return null;
};

const resetPassword = async (userId: string, newPassword: string): Promise<boolean> => {
    let success = false;
    usersDB = usersDB.map(u => {
        if (u.id === userId) {
            success = true;
            return { ...u, password: newPassword };
        }
        return u;
    });
    if (success) syncToLocalStorage();
    return success;
};

const updateUserProfile = async (userId: string, data: Partial<User>): Promise<User> => {
    let updatedUser: User | null = null;
    usersDB = usersDB.map(u => {
        if (u.id === userId) {
            updatedUser = { ...u, ...data };
            return updatedUser;
        }
        return u;
    });
    if (updatedUser) syncToLocalStorage();
    return sanitizeUser(updatedUser!);
};

const changePassword = async (userId: string, oldPass: string, newPass: string): Promise<boolean> => {
    const userToUpdate = usersDB.find(u => u.id === userId);
    if (userToUpdate && userToUpdate.password === oldPass) {
        usersDB = usersDB.map(u => u.id === userId ? { ...u, password: newPass } : u);
        syncToLocalStorage();
        return true;
    }
    return false;
};

const updateUserVerificationStatus = async (userId: string, status: VerificationStatus): Promise<User> => {
    let updatedUser: User | null = null;
    usersDB = usersDB.map(u => {
        if (u.id === userId) {
            updatedUser = { ...u, verificationStatus: status };
            return updatedUser;
        }
        return u;
    });
    if (updatedUser) syncToLocalStorage();
    return sanitizeUser(updatedUser!);
};

const addLawyerReview = async (lawyerId: string, review: Review): Promise<User | null> => {
    let updatedLawyer: User | null = null;
    usersDB = usersDB.map(u => {
        if (u.id === lawyerId && u.role === 'lawyer') {
            const newReviews = [...(u.reviews || []), review];
            const totalRating = newReviews.reduce((sum, r) => sum + r.rating, 0);
            const newAverageRating = totalRating / newReviews.length;

            updatedLawyer = { 
                ...u, 
                reviews: newReviews,
                rating: parseFloat(newAverageRating.toFixed(1)),
            };
            return updatedLawyer;
        }
        return u;
    });

    if (updatedLawyer) {
        syncToLocalStorage();
        return sanitizeUser(updatedLawyer);
    }
    return null;
};

export const authService = {
    login,
    signup,
    verifyEmail,
    resendVerificationEmail,
    getCurrentUser,
    requestPasswordReset,
    resetPassword,
    updateUserProfile,
    changePassword,
    updateUserVerificationStatus,
    addLawyerReview,
};