import apiClient from '../config/apiClient';
import type { Appointment } from '../types';

const APPOINTMENT_STATUS_MAP: Record<string, Appointment['status']> = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  COMPLETED: 'Confirmed',
  CANCELLED: 'Cancelled',
  RESCHEDULED: 'Pending',
};

const toClientAppointmentStatus = (value?: string): Appointment['status'] => {
  if (!value) return 'Pending';
  return APPOINTMENT_STATUS_MAP[value.toUpperCase()] || 'Pending';
};

const toApiAppointmentStatus = (value?: Appointment['status']): string | undefined => {
  switch (value) {
    case 'Confirmed':
      return 'CONFIRMED';
    case 'Cancelled':
      return 'CANCELLED';
    case 'Pending':
      return 'PENDING';
    default:
      return undefined;
  }
};

const normalizeAppointment = (payload: any): Appointment => {
  const start: string = payload.scheduled_start;
  const end: string = payload.scheduled_end;
  const durationMinutes = start && end ? Math.max(0, Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60000)) : 60;

  return {
    id: payload.booking_id || payload.id,
    clientId: payload.citizen,
    lawyerId: payload.lawyer,
    title: payload.title || 'Consultation',
    type: 'Consultation',
    date: start ? start.slice(0, 10) : new Date().toISOString().slice(0, 10),
    time: start ? start.slice(11, 16) : '09:00',
    duration: durationMinutes,
    mode: payload.meeting_link ? 'Online' : 'In-Person',
    status: toClientAppointmentStatus(payload.status),
    reviewed: payload.reviewed ?? false,
    notes: payload.notes || payload.location,
    caseId: payload.case,
  };
};

const parseTime = (timeStr: string): string => {
  const [time, modifier] = timeStr.split(' ');
  let [hours, minutes] = time.split(':');

  // Convert to 24-hour format
  if (modifier === 'AM') {
    if (hours === '12') {
      hours = '00'; // 12 AM is 00:xx in 24-hour format
    }
  } else if (modifier === 'PM') {
    if (hours !== '12') {
      hours = (parseInt(hours, 10) + 12).toString(); // 1 PM = 13, 2 PM = 14, etc.
    }
    // 12 PM stays as 12
  }

  return `${hours.padStart(2, '0')}:${minutes}`;
};

const serializeAppointmentPayload = (data: Partial<Appointment>) => {
  const payload: Record<string, unknown> = {};
  if (data.clientId) payload.citizen = data.clientId;
  if (data.lawyerId) payload.lawyer = data.lawyerId;
  if (data.caseId) payload.case = data.caseId;
  if (data.date && data.time) {
    // Convert "03:00 PM" to "15:00"
    const time24 = parseTime(data.time);
    const startIso = new Date(`${data.date}T${time24}:00`).toISOString();
    payload.scheduled_start = startIso;
    if (data.duration) {
      payload.scheduled_end = new Date(new Date(startIso).getTime() + data.duration * 60000).toISOString();
    }
  }
  if (data.mode === 'Online') payload.meeting_link = data.notes || 'https://meet.completelegalaid.com';
  if (data.mode === 'In-Person') payload.location = data.notes;
  const apiStatus = toApiAppointmentStatus(data.status);
  if (apiStatus) payload.status = apiStatus;
  return payload;
};

const getUserAppointments = async (userId: string, role: string): Promise<Appointment[]> => {
  try {
    const response = await apiClient.get('/consultation-bookings/', {
      params: {
        ...(role === 'citizen' && { clientId: userId }),
        ...(role === 'lawyer' && { lawyerId: userId }),
      },
    });

    const payload = Array.isArray(response.data) ? response.data : response.data.results || [];
    return payload.map(normalizeAppointment);
  } catch (error) {
    console.error('Get appointments error:', error);
    return [];
  }
};

const createAppointment = async (appointmentData: Partial<Appointment>): Promise<Appointment | null> => {
  try {
    const response = await apiClient.post('/consultation-bookings/', serializeAppointmentPayload(appointmentData));
    return normalizeAppointment(response.data);
  } catch (error) {
    console.error('Create appointment error:', error);
    return null;
  }
};

const updateAppointment = async (appointmentId: string, data: Partial<Appointment>): Promise<Appointment | null> => {
  try {
    const response = await apiClient.patch(`/consultation-bookings/${appointmentId}/`, serializeAppointmentPayload(data));
    return normalizeAppointment(response.data);
  } catch (error) {
    console.error('Update appointment error:', error);
    return null;
  }
};

const getLawyerAvailability = async (lawyerId: string): Promise<any[]> => {
  try {
    const response = await apiClient.get('/lawyer-availability-slots/', {
      params: { lawyer: lawyerId },
    });

    return response.data.results || response.data;
  } catch (error) {
    console.error('Get lawyer availability error:', error);
    return [];
  }
};

export const appointmentService = {
  getUserAppointments,
  createAppointment,
  updateAppointment,
  getLawyerAvailability,
};
