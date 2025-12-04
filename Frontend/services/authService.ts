import apiClient from '../config/apiClient';
import type { User, UserRole, VerificationStatus } from '../types';

interface LoginResponse {
  user: any;
  access: string;
  refresh: string;
}

interface RegisterData {
  email: string;
  phone_number: string;
  password: string;
  name: string;
  role: 'CITIZEN' | 'LAWYER';
  language?: 'EN' | 'BN';
  lawyerId?: string;
  bio?: string;
  experience?: number;
  verificationDocument?: File;
  profilePhoto?: File;
}

const roleFromBackend = (value?: string): UserRole => {
  switch ((value || 'citizen').toLowerCase()) {
    case 'lawyer':
      return 'lawyer';
    case 'admin':
      return 'admin';
    default:
      return 'citizen';
  }
};

const mapVerificationStatus = (value?: string, isVerified?: boolean): VerificationStatus => {
  if (!value) {
    return isVerified ? 'Verified' : 'Pending';
  }
  switch (value.toUpperCase()) {
    case 'VERIFIED':
      return 'Verified';
    case 'REJECTED':
      return 'Rejected';
    case 'PENDING_EMAIL_VERIFICATION':
      return 'PendingEmailVerification';
    default:
      return isVerified ? 'Verified' : 'Pending';
  }
};

const toApiVerificationStatus = (status: VerificationStatus): 'VERIFIED' | 'REJECTED' | 'PENDING' => {
  switch (status) {
    case 'Verified':
      return 'VERIFIED';
    case 'Rejected':
      return 'REJECTED';
    default:
      return 'PENDING';
  }
};

const fallbackAvatar = (name: string, id?: string) =>
  `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name || id || 'CLA')}`;

const normalizeUser = (backendUser: any): User => {
  if (!backendUser) {
    throw new Error('Invalid user payload received from API');
  }

  const profile = backendUser.profile || {};
  const id = backendUser.id || backendUser.user_id;
  const email = backendUser.email;
  const name = backendUser.name || profile.full_name_en || profile.full_name || email?.split('@')[0] || 'User';
  const avatar = backendUser.avatar || profile.profile_photo_url || fallbackAvatar(name, id);

  return {
    id,
    name,
    email,
    role: roleFromBackend(backendUser.role),
    avatar,
    verificationStatus: mapVerificationStatus(backendUser.verification_status, backendUser.is_verified),
    phone: backendUser.phone || backendUser.phone_number || '',
    language: backendUser.language_preference === 'BN' ? 'Bangla' : 'English',
    theme: backendUser.theme_preference || 'system',
    bio: profile.bio_en || backendUser.bio || undefined,
    specializations: profile.specializations || backendUser.specializations,
    experience: profile.experience_years || backendUser.experience,
    location: profile.chamber_address || backendUser.location,
    fees: profile.consultation_fee_online || backendUser.fees,
    verificationDocFile: undefined,
    avatarFile: undefined,
  };
};

const persistSession = (user: User, access: string, refresh: string) => {
  localStorage.setItem('access_token', access);
  localStorage.setItem('refresh_token', refresh);
  localStorage.setItem('user', JSON.stringify(user));
};

const login = async (identifier: string, password: string): Promise<User | null> => {
  try {
    const trimmedIdentifier = identifier.trim();
    const loginPayload: Record<string, string> = {
      password,
      identifier: trimmedIdentifier,
    };

    if (trimmedIdentifier.includes('@')) {
      loginPayload.email = trimmedIdentifier;
    } else {
      loginPayload.phone_number = trimmedIdentifier;
    }

    const response = await apiClient.post<LoginResponse>('/auth/login/', loginPayload);

    const normalizedUser = normalizeUser(response.data.user);
    persistSession(normalizedUser, response.data.access, response.data.refresh);
    return normalizedUser;
  } catch (error: any) {
    console.error('Login error:', error.response?.data || error.message);
    return null;
  }
};

const signup = async (newUser: RegisterData): Promise<{ user: User } | { error: string }> => {
  try {
    const formData = new FormData();
    formData.append('email', newUser.email);
    formData.append('phone_number', newUser.phone_number);
    formData.append('password', newUser.password);
    formData.append('name', newUser.name);
    formData.append('role', newUser.role);
    formData.append('language', newUser.language || 'EN');
    if (newUser.lawyerId) formData.append('lawyerId', newUser.lawyerId);
    if (newUser.bio) formData.append('bio', newUser.bio);
    if (typeof newUser.experience === 'number') formData.append('experience', String(newUser.experience));
    if (newUser.profilePhoto) formData.append('profile_photo', newUser.profilePhoto);
    if (newUser.verificationDocument) formData.append('verification_document', newUser.verificationDocument);

    const response = await apiClient.post<LoginResponse>('/auth/register/', formData);
    const normalizedUser = normalizeUser(response.data.user);
    persistSession(normalizedUser, response.data.access, response.data.refresh);
    return { user: normalizedUser };
  } catch (error: any) {
    const errorMessage = error.response?.data?.error || 'An error occurred during registration';
    return { error: errorMessage };
  }
};

const getCurrentUser = async (): Promise<User | null> => {
  try {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      return JSON.parse(storedUser) as User;
    }

    const response = await apiClient.get('/auth/profile/');
    const normalizedUser = normalizeUser(response.data);
    localStorage.setItem('user', JSON.stringify(normalizedUser));
    return normalizedUser;
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
};

const buildProfileFormData = (data: Partial<User>): FormData => {
  const formData = new FormData();
  const append = (key: string, value?: string | number | boolean) => {
    if (value === undefined || value === null) return;
    formData.append(key, String(value));
  };

  append('name', data.name);
  append('phone_number', data.phone);
  append('preferred_language', data.language ? (data.language === 'Bangla' ? 'BN' : 'EN') : undefined);
  append('bio', data.bio);
  append('location', data.location);
  append('fees', data.fees);
  append('experience', data.experience);

  if (data.specializations && data.specializations.length > 0) {
    append('specializations', data.specializations.join(','));
  }

  if (data.avatarFile) {
    formData.append('avatar', data.avatarFile);
  }
  if (data.verificationDocFile) {
    formData.append('verification_document', data.verificationDocFile);
  }

  return formData;
};

const updateUserProfile = async (_userId: string, data: Partial<User>): Promise<User> => {
  try {
    const payload = buildProfileFormData(data);
    const response = await apiClient.patch('/auth/profile/update/', payload);
    const normalizedUser = normalizeUser(response.data);
    localStorage.setItem('user', JSON.stringify(normalizedUser));
    return normalizedUser;
  } catch (error: any) {
    console.error('Update profile error:', error.response?.data || error.message);
    throw error;
  }
};

const changePassword = async (_userId: string, oldPass: string, newPass: string): Promise<boolean> => {
  try {
    await apiClient.post('/auth/password/change/', {
      old_password: oldPass,
      new_password: newPass,
    });
    return true;
  } catch (error) {
    console.error('Change password error:', error);
    return false;
  }
};

const logout = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
};

const verifyEmail = async (token: string) => {
  try {
    await apiClient.post('/auth/verify-email/', { token });
    return { user: null, status: 'verified' as const };
  } catch (error) {
    console.error('Verify email error:', error);
    return { user: null, status: 'invalid' as const };
  }
};

const resendVerificationEmail = async (user: User) => {
  try {
    await apiClient.post('/auth/resend-verification/');
    return { updatedUser: user, email: {} as any };
  } catch (error) {
    console.error('Resend verification error:', error);
    throw error;
  }
};

const requestPasswordReset = async (email: string) => {
  try {
    await apiClient.post('/auth/password/reset/', { email });
    return { success: true };
  } catch (error) {
    console.error('Request password reset error:', error);
    return null;
  }
};

const resetPassword = async (token: string, newPassword: string) => {
  try {
    await apiClient.post('/auth/password/reset/confirm/', {
      new_password: newPassword,
      token,
    });
    return true;
  } catch (error) {
    console.error('Reset password error:', error);
    return false;
  }
};

const updateUserVerificationStatus = async (userId: string, status: VerificationStatus): Promise<User> => {
  try {
    const response = await apiClient.post(`/users/${userId}/verification/`, {
      status: toApiVerificationStatus(status),
    });
    const normalizedUser = normalizeUser(response.data);

    const storedUserRaw = localStorage.getItem('user');
    if (storedUserRaw) {
      try {
        const storedUser = JSON.parse(storedUserRaw) as User;
        if (storedUser.id === normalizedUser.id) {
          localStorage.setItem('user', JSON.stringify(normalizedUser));
        }
      } catch (parseError) {
        // ignore corrupted cache
      }
    }

    return normalizedUser;
  } catch (error: any) {
    console.error('Update verification error:', error.response?.data || error.message);
    throw error;
  }
};

const addLawyerReview = async (lawyerId: string, review: any) => {
  try {
    await apiClient.post('/lawyer-reviews/', {
      lawyer: lawyerId,
      rating: review.rating,
      comment: review.comment,
    });
    return { success: true };
  } catch (error) {
    console.error('Add review error:', error);
    return null;
  }
};

const deleteUser = async (userId: string): Promise<boolean> => {
  try {
    await apiClient.delete(`/users/${userId}/`);
    return true;
  } catch (error) {
    console.error('Delete user error:', error);
    return false;
  }
};

const getAllUsers = async (): Promise<User[]> => {
  try {
    const response = await apiClient.get('/users/');
    const payload = Array.isArray(response.data) ? response.data : response.data.results || [];
    return payload.map(normalizeUser);
  } catch (error) {
    console.error('Get all users error:', error);
    return [];
  }
};

export const authService = {
  login,
  signup,
  getCurrentUser,
  updateUserProfile,
  changePassword,
  logout,
  verifyEmail,
  resendVerificationEmail,
  requestPasswordReset,
  resetPassword,
  updateUserVerificationStatus,
  addLawyerReview,
  getAllUsers,
  deleteUser,
};
