import apiClient from '../config/apiClient';
import type { Case, User } from '../types';

const CASE_STATUS_MAP: Record<string, Case['status']> = {
  SUBMITTED: 'Submitted',
  IN_REVIEW: 'In Review',
  DOC_REQUESTED: 'In Review',
  SCHEDULED: 'Scheduled',
  RESOLVED: 'Resolved',
  CLOSED: 'Resolved',
};

const toClientStatus = (value?: string): Case['status'] => {
  if (!value) return 'Submitted';
  return CASE_STATUS_MAP[value.toUpperCase()] || 'Submitted';
};

const toApiStatus = (value?: Case['status']): string | undefined => {
  switch (value) {
    case 'In Review':
      return 'IN_REVIEW';
    case 'Scheduled':
      return 'SCHEDULED';
    case 'Resolved':
      return 'RESOLVED';
    case 'Submitted':
      return 'SUBMITTED';
    default:
      return undefined;
  }
};

const normalizeCase = (payload: any): Case => ({
  id: payload.case_id || payload.id,
  title: payload.title,
  description: payload.description,
  status: toClientStatus(payload.status),
  submittedDate: payload.submission_date || payload.created_at || new Date().toISOString(),
  lawyerId: payload.assigned_lawyer,
  clientId: payload.citizen,
  reviewed: payload.reviewed ?? false,
});

const serializeCasePayload = (data: Partial<Case>) => {
  const payload: Record<string, unknown> = {};
  if (data.title !== undefined) payload.title = data.title;
  if (data.description !== undefined) payload.description = data.description;
  const apiStatus = toApiStatus(data.status);
  if (apiStatus) payload.status = apiStatus;
  if (data.lawyerId !== undefined) payload.assigned_lawyer = data.lawyerId;
  if (data.clientId !== undefined) payload.citizen = data.clientId;
  return payload;
};

const getUserCases = async (user: User): Promise<Case[]> => {
  try {
    const response = await apiClient.get('/cases/', {
      params: {
        ...(user.role === 'citizen' && { clientId: user.id }),
        ...(user.role === 'lawyer' && { lawyerId: user.id }),
      },
    });
    const payload = Array.isArray(response.data) ? response.data : response.data.results || [];
    return payload.map(normalizeCase);
  } catch (error) {
    console.error('Get user cases error:', error);
    return [];
  }
};

const getCaseById = async (caseId: string): Promise<Case | null> => {
  try {
    const response = await apiClient.get(`/cases/${caseId}/`);
    return normalizeCase(response.data);
  } catch (error) {
    console.error('Get case by ID error:', error);
    return null;
  }
};

const createCase = async (caseData: Partial<Case>): Promise<Case | null> => {
  try {
    const response = await apiClient.post('/cases/', serializeCasePayload(caseData));
    return normalizeCase(response.data);
  } catch (error) {
    console.error('Create case error:', error);
    return null;
  }
};

const updateCase = async (caseId: string, data: Partial<Case>): Promise<Case | null> => {
  try {
    const response = await apiClient.patch(`/cases/${caseId}/`, serializeCasePayload(data));
    return normalizeCase(response.data);
  } catch (error) {
    console.error('Update case error:', error);
    return null;
  }
};

const deleteCase = async (caseId: string): Promise<boolean> => {
  try {
    await apiClient.delete(`/cases/${caseId}/`);
    return true;
  } catch (error) {
    console.error('Delete case error:', error);
    return false;
  }
};

const getCases = async (): Promise<Case[]> => {
  try {
    const response = await apiClient.get('/cases/');
    const payload = Array.isArray(response.data) ? response.data : response.data.results || [];
    return payload.map(normalizeCase);
  } catch (error) {
    console.error('Get all cases error:', error);
    return [];
  }
};

export const caseService = {
  getUserCases,
  getCases,
  getCaseById,
  createCase,
  updateCase,
  deleteCase,
};