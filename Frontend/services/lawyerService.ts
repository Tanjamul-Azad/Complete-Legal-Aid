import apiClient from '../config/apiClient';
import type { User, VerificationStatus } from '../types';

interface PaginatedResponse<T> {
  results: T[];
}

interface LawyerProfileApi {
  profile_id: string;
  user_id: string;
  user: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string | null;
  verification_status: string;
  bar_council_number?: string;
  bio_en?: string | null;
  bio_bn?: string | null;
  chamber_address?: string | null;
  location?: string | null;
  consultation_fee_online?: string | number | null;
  consultation_fee_offline?: string | number | null;
  rating_average?: string | number | null;
  total_reviews: number;
  license_issue_date?: string;
  specializations?: string[];
  experience_years?: number | null;
  availability?: Record<string, string[]>;
}

interface LegalSpecializationApi {
  specialization_id: number;
  name_en: string;
  name_bn?: string;
  slug: string;
  description_en?: string | null;
  description_bn?: string | null;
}

export interface LegalSpecialization {
  slug: string;
  name_en: string;
  name_bn?: string;
  description_en?: string | null;
  description_bn?: string | null;
}

interface LawyerQueryParams {
  specialization?: string;
  location?: string;
  q?: string;
}

const mapVerificationStatus = (status?: string): VerificationStatus => {
  switch ((status || '').toUpperCase()) {
    case 'VERIFIED':
      return 'Verified';
    case 'REJECTED':
      return 'Rejected';
    default:
      return 'Pending';
  }
};

const fallbackAvatar = (name: string) => {
  const initials = encodeURIComponent(name || 'Lawyer');
  return `https://ui-avatars.com/api/?name=${initials}&background=FBBF24&color=111827`;
};

const toNumber = (value?: string | number | null): number => {
  if (value === null || value === undefined) {
    return 0;
  }
  const numeric = typeof value === 'string' ? parseFloat(value) : value;
  return Number.isFinite(numeric) ? Number(numeric) : 0;
};

const mapLawyerProfileToUser = (profile: LawyerProfileApi): User => {
  const normalizedName = profile.name || profile.email.split('@')[0];
  const consultationFee = profile.consultation_fee_online ?? profile.consultation_fee_offline;

  return {
    id: profile.user_id || profile.profile_id,
    profileId: profile.profile_id, // Add LawyerProfile ID for appointments
    name: normalizedName,
    email: profile.email,
    role: 'lawyer',
    avatar: profile.avatar || fallbackAvatar(normalizedName),
    verificationStatus: mapVerificationStatus(profile.verification_status),
    phone: profile.phone,
    specializations: profile.specializations || [],
    experience: profile.experience_years ?? undefined,
    rating: toNumber(profile.rating_average),
    reviews: [],
    bio: profile.bio_en || profile.bio_bn || undefined,
    location: profile.location || profile.chamber_address || undefined,
    fees: toNumber(consultationFee),
    lawyerId: profile.bar_council_number,
    availability: profile.availability,
  };
};

const unwrapResults = <T>(payload: PaginatedResponse<T> | PaginatedResponse<T>['results'] | T[]): T[] => {
  if (Array.isArray(payload)) {
    return payload as T[];
  }
  if ('results' in payload) {
    return payload.results;
  }
  return [];
};

const buildQueryParams = (filters?: LawyerQueryParams) => {
  if (!filters) return undefined;
  const params: Record<string, string> = {};
  if (filters.specialization) params.specialization = filters.specialization;
  if (filters.location) params.location = filters.location;
  if (filters.q) params.q = filters.q;
  return Object.keys(params).length ? params : undefined;
};

const getAllLawyers = async (filters?: LawyerQueryParams): Promise<User[]> => {
  try {
    const response = await apiClient.get<PaginatedResponse<LawyerProfileApi> | LawyerProfileApi[]>(
      '/lawyer-profiles/',
      {
        params: buildQueryParams(filters),
      },
    );
    const records = unwrapResults(response.data);
    return records.map(mapLawyerProfileToUser);
  } catch (error) {
    console.error('Get lawyers error:', error);
    return [];
  }
};

const getLawyerById = async (lawyerId: string): Promise<User | null> => {
  try {
    const response = await apiClient.get<LawyerProfileApi>(`/lawyer-profiles/${lawyerId}/`);
    return mapLawyerProfileToUser(response.data);
  } catch (error) {
    console.error('Get lawyer by ID error:', error);
    return null;
  }
};

const getLegalSpecializations = async (): Promise<LegalSpecialization[]> => {
  try {
    const response = await apiClient.get<PaginatedResponse<LegalSpecializationApi> | LegalSpecializationApi[]>(
      '/legal-specializations/',
    );
    const payload = unwrapResults(response.data);
    return payload.map((spec) => ({
      slug: spec.slug,
      name_en: spec.name_en,
      name_bn: spec.name_bn,
      description_en: spec.description_en,
      description_bn: spec.description_bn,
    }));
  } catch (error) {
    console.error('Get specializations error:', error);
    return [];
  }
};

interface LawyerReview {
  reviewerName: string;
  rating: number;
  comment: string;
  timestamp?: number;
}

const addLawyerReview = async (lawyerId: string, review: LawyerReview): Promise<boolean> => {
  try {
    await apiClient.post('/lawyer-reviews/', {
      lawyer: lawyerId,
      rating: review.rating,
      comment: review.comment,
      reviewer_name: review.reviewerName,
    });
    return true;
  } catch (error) {
    console.error('Add lawyer review error:', error);
    return false;
  }
};

const updateSchedule = async (schedule: Record<string, { active: boolean; start: string; end: string }>): Promise<boolean> => {
  try {
    await apiClient.post('/lawyer-profiles/update-schedule/', { schedule });
    return true;
  } catch (error) {
    console.error('Update schedule error:', error);
    return false;
  }
};

export const lawyerService = {
  getAllLawyers,
  getLawyerById,
  getLegalSpecializations,
  addLawyerReview,
  updateSchedule,
};
