/**
 * Constants and Configuration
 * 
 * This file re-exports mock data for backward compatibility.
 * In the future, these will be replaced with API calls.
 */

import {
  MOCK_USERS,
  MOCK_CASES,
  MOCK_EVIDENCE_DOCUMENTS,
  MOCK_NOTIFICATIONS,
  MOCK_APPOINTMENTS,
  MOCK_ACTIVITY_LOGS,
  MOCK_MESSAGES
} from './services/mock/mockDatabase';

// Re-export for backward compatibility
// TODO: Remove these exports when migrating to real backend
export const ALL_USERS = MOCK_USERS;
export const CASES = MOCK_CASES;
export const EVIDENCE_DOCUMENTS = MOCK_EVIDENCE_DOCUMENTS;
export const NOTIFICATIONS = MOCK_NOTIFICATIONS;
export const APPOINTMENTS = MOCK_APPOINTMENTS;
export const ACTIVITY_LOGS = MOCK_ACTIVITY_LOGS;
export const MESSAGES = MOCK_MESSAGES;
