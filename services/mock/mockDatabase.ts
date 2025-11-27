/**
 * Mock Database Service
 * 
 * This service simulates a database layer for the application.
 * When integrating with a real backend, replace this with actual API calls.
 */

import type { User, Case, EvidenceDocument, Notification, Appointment, ActivityLog, Message } from '../../types';

// Default notification settings
const defaultNotificationSettings = {
    email: {
        caseUpdates: true,
        newMessages: true,
        appointmentReminders: true,
    },
    reminders: {
        oneDay: true,
        oneHour: true,
        tenMinutes: false,
    }
};

// Helper to get a date string for X days from today
const getDateFromToday = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
};

// ==================== MOCK DATA ====================

export const MOCK_USERS: User[] = [
    // --- Admins ---
    {
        id: 'admin1',
        name: 'Admin User',
        email: 'admin@cla.com',
        password: 'password123',
        phone: '+8801700000000',
        role: 'admin',
        avatar: 'https://picsum.photos/seed/admin/200',
        verificationStatus: 'Verified',
        theme: 'dark',
        notificationSettings: defaultNotificationSettings
    },
    // --- Citizens ---
    {
        id: 'user1',
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        phone: '+8801800000000',
        role: 'citizen',
        avatar: 'https://picsum.photos/seed/john/200',
        verificationStatus: 'Verified',
        theme: 'dark',
        notificationSettings: defaultNotificationSettings
    },
    {
        id: 'user2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: 'password123',
        phone: '+8801900000000',
        role: 'citizen',
        avatar: 'https://picsum.photos/seed/jane/200',
        verificationStatus: 'Pending',
        theme: 'light',
        notificationSettings: defaultNotificationSettings
    },
    // --- Lawyers ---
    {
        id: 'l1',
        name: 'Anisul Huq',
        email: 'anisul@law.com',
        password: 'password123',
        phone: '+8801500000000',
        lawyerId: 'BC/DHK/2009/101',
        role: 'lawyer',
        avatar: 'https://picsum.photos/seed/anisul/200',
        verificationStatus: 'Verified',
        specializations: ['Corporate Law', 'Litigation', 'Contract Law'],
        experience: 15,
        rating: 4.9,
        reviews: [
            { reviewerName: 'Jane Smith', rating: 5, comment: 'Excellent and very knowledgeable. Helped me resolve my corporate issue swiftly.', timestamp: Date.now() - 10 * 24 * 3600 * 1000 },
            { reviewerName: 'A. Rahman', rating: 4.8, comment: 'Very professional and to the point.', timestamp: Date.now() - 25 * 24 * 3600 * 1000 },
        ],
        bio: 'Anisul Huq is a seasoned corporate lawyer with extensive experience in high-stakes litigation. He is a senior partner at Huq & Associates.',
        location: 'Dhaka',
        fees: 5000,
        availability: {
            "2024-07-28": ["09:00", "11:00", "14:00"],
            "2024-07-29": ["10:00", "15:00"],
        },
        theme: 'dark',
        notificationSettings: defaultNotificationSettings
    },
    {
        id: 'l2',
        name: 'Barrister Sumon',
        email: 'sumon@law.com',
        password: 'password123',
        phone: '+8801600000000',
        lawyerId: 'BC/CTG/2012/205',
        role: 'lawyer',
        avatar: 'https://picsum.photos/seed/sumon/200',
        verificationStatus: 'Verified',
        specializations: ['Criminal Law', 'Human Rights'],
        experience: 12,
        rating: 4.8,
        reviews: [
            { reviewerName: 'John Doe', rating: 4.8, comment: 'Great at explaining complex criminal law matters. Highly recommended.', timestamp: Date.now() - 15 * 24 * 3600 * 1000 },
        ],
        bio: 'Known for his dedication to human rights, Barrister Sumon has a strong track record in criminal defense cases.',
        location: 'Chittagong',
        fees: 4000,
        availability: {
            "2024-07-28": ["10:00", "12:00", "16:00"],
            "2024-07-30": ["09:00", "11:00"],
        },
        theme: 'dark',
        notificationSettings: defaultNotificationSettings
    },
    {
        id: 'l3',
        name: 'Farida Yasmin',
        email: 'farida@law.com',
        password: 'password123',
        phone: '+8801300000000',
        lawyerId: 'BC/DHK/2016/312',
        role: 'lawyer',
        avatar: 'https://picsum.photos/seed/farida/200',
        verificationStatus: 'Verified',
        specializations: ['Family Law', 'Divorce', 'Child Custody'],
        experience: 8,
        rating: 4.9,
        reviews: [
            { reviewerName: 'John Doe', rating: 5, comment: 'Farida was compassionate and extremely effective in my family law case. I could not have asked for better representation.', timestamp: Date.now() - 5 * 24 * 3600 * 1000 },
            { reviewerName: 'S. Khanom', rating: 4.8, comment: 'Very professional and handled my sensitive case with great care.', timestamp: Date.now() - 30 * 24 * 3600 * 1000 },
        ],
        bio: 'Farida Yasmin is a compassionate and skilled family lawyer, specializing in sensitive matters like divorce and child custody.',
        location: 'Dhaka',
        fees: 3500,
        availability: {
            "2024-07-29": ["13:00", "14:00", "15:00"],
            "2024-07-31": ["10:00", "11:00"],
        },
        theme: 'dark',
        notificationSettings: defaultNotificationSettings
    },
    {
        id: 'l4',
        name: 'Rahim Afzal',
        email: 'rahim@law.com',
        password: 'password123',
        phone: '+8801400000000',
        lawyerId: 'BC/SYL/2014/451',
        role: 'lawyer',
        avatar: 'https://picsum.photos/seed/rahim/200',
        verificationStatus: 'Verified',
        specializations: ['Real Estate', 'Property Law'],
        experience: 10,
        rating: 4.7,
        reviews: [
            { reviewerName: 'Anonymous', rating: 4.7, comment: 'Helped me with a complicated property deed transfer. Everything went smoothly.', timestamp: Date.now() - 40 * 24 * 3600 * 1000 },
        ],
        bio: 'Rahim Afzal is an expert in all things real estate. He helps clients navigate complex property transactions and disputes with ease.',
        location: 'Sylhet',
        fees: 4500,
        availability: {
            "2024-07-28": ["13:00", "14:00", "17:00"],
            "2024-08-01": ["10:00", "11:00"],
        },
        theme: 'dark',
        notificationSettings: defaultNotificationSettings
    },
    {
        id: 'l5',
        name: 'Ayesha Khan',
        email: 'ayesha@law.com',
        password: 'password123',
        phone: '+8801990000000',
        lawyerId: 'BC/DHK/2023/887',
        role: 'lawyer',
        avatar: 'https://picsum.photos/seed/ayesha/200',
        verificationStatus: 'Pending',
        specializations: ['Cybersecurity Law', 'Intellectual Property'],
        experience: 5,
        rating: 0,
        reviews: [],
        bio: 'Ayesha Khan is a tech-savvy lawyer focusing on the emerging field of cybersecurity and IP law. Eager to help clients in the digital age.',
        location: 'Dhaka',
        fees: 3000,
        availability: {},
        verificationDocs: [{ name: 'Bar_Council_ID.pdf', url: '#' }],
        theme: 'dark',
        notificationSettings: defaultNotificationSettings
    }
];

export const MOCK_CASES: Case[] = [
    { id: 'c1', title: 'Land Dispute in Savar', description: 'A dispute over property boundaries with a neighbor. The opposing party has constructed a fence encroaching on my property.', status: 'In Review', submittedDate: '2023-10-15', lawyerId: 'l1', clientId: 'user1' },
    { id: 'c2', title: 'Bail Application for a relative', description: 'Need to file an urgent bail application for a family member detained in a civil matter.', status: 'Scheduled', submittedDate: '2023-11-01', lawyerId: 'l2', clientId: 'user1' },
    { id: 'c3', title: 'Child Custody Filing', description: 'Seeking primary custody of my son after separation. The hearing is approaching and documents need to be filed.', status: 'Resolved', submittedDate: '2023-09-20', lawyerId: 'l3', clientId: 'user1', reviewed: true },
    { id: 'c4', title: 'Contract Review for Startup', description: 'Legal review of a new partnership agreement before signing. Need to ensure all clauses are fair and standard.', status: 'Submitted', submittedDate: '2023-11-05', clientId: 'user1' },
    { id: 'c5', title: 'Rental Agreement Dispute', description: 'Dispute with landlord over security deposit.', status: 'Resolved', submittedDate: '2024-06-15', lawyerId: 'l4', clientId: 'user1', reviewed: false },
];

export const MOCK_EVIDENCE_DOCUMENTS: EvidenceDocument[] = [
    { id: 'doc1', name: 'Property_Deed.pdf', type: 'application/pdf', size: 1200000, url: '#', uploadedAt: '2023-10-16', caseId: 'c1' },
    { id: 'doc2', name: 'Neighbor_Encroachment.jpg', type: 'image/jpeg', size: 4500000, url: 'https://picsum.photos/seed/fence/400/300', uploadedAt: '2023-10-17', caseId: 'c1' },
    { id: 'doc3', name: 'Bail_Application_Draft.docx', type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', size: 45000, url: '#', uploadedAt: '2023-11-02', caseId: 'c2' },
];

export const MOCK_NOTIFICATIONS: Notification[] = [
    {
        id: 'n1',
        userId: 'user1',
        type: 'new_message',
        title: 'New message from Anisul Huq',
        body: 'Regarding your case "Land Dispute in Savar".',
        read: false,
        timestamp: Date.now() - 3600000,
        link: { page: 'cases', params: { caseId: 'c1' } },
        severity: 'normal'
    },
    {
        id: 'n2',
        userId: 'user1',
        type: 'appointment',
        title: 'Appointment Confirmed',
        body: 'Your appointment with Farida Yasmin is confirmed for tomorrow.',
        read: false,
        timestamp: Date.now() - 2 * 3600000,
        link: { page: 'appointments' },
        severity: 'normal'
    },
    {
        id: 'n3',
        userId: 'user1',
        type: 'deadline',
        title: 'Urgent: Document Submission Deadline',
        body: 'The deadline for submitting evidence for Case #c2 is in 2 days.',
        read: false,
        timestamp: Date.now() - 24 * 3600000,
        link: { page: 'cases', params: { caseId: 'c2' } },
        severity: 'critical'
    },
    {
        id: 'n4',
        userId: 'user1',
        type: 'system',
        title: 'Welcome to Complete Legal Aid!',
        body: 'Complete your profile to get started.',
        read: true,
        timestamp: Date.now() - 2 * 24 * 3600000,
        link: { page: 'settings' },
        severity: 'normal'
    },
    {
        id: 'n5',
        userId: 'user1',
        type: 'case_update',
        title: 'Case Status Updated',
        body: 'Your case "Bail Application for a relative" is now "Scheduled".',
        read: true,
        timestamp: Date.now() - 3 * 24 * 3600000,
        link: { page: 'cases', params: { caseId: 'c2' } },
        severity: 'normal'
    },
];

export const MOCK_APPOINTMENTS: Appointment[] = [
    // Past Appointments
    { id: 'appt-past1', clientId: 'user1', lawyerId: 'l3', title: 'Custody Hearing Prep', type: 'Consultation', date: '2024-07-15', time: '02:00 PM', duration: 60, mode: 'In-Person', status: 'Confirmed', reviewed: true, notes: 'Discussed custody arrangements and next steps.', caseId: 'c3' },
    { id: 'appt-past2', clientId: 'user1', lawyerId: 'l2', title: 'Bail Motion Discussion', type: 'Meeting', date: '2024-07-20', time: '11:30 AM', duration: 45, mode: 'Online', status: 'Confirmed', reviewed: false, notes: 'Preliminary discussion about the bail process.' },

    // Upcoming / Current Month Appointments (Dynamic for demo)
    { id: 'appt1', clientId: 'user1', lawyerId: 'l1', title: 'Land Dispute Consultation', type: 'Consultation', date: getDateFromToday(2), time: '11:00 AM', duration: 60, mode: 'Online', status: 'Confirmed', notes: 'Initial consultation regarding the Savar land dispute.', caseId: 'c1' },
    { id: 'appt2', clientId: 'user1', lawyerId: 'l3', title: 'Document Signing', type: 'Meeting', date: getDateFromToday(5), time: '02:30 PM', duration: 30, mode: 'In-Person', status: 'Confirmed' },
    { id: 'appt3', clientId: 'user1', lawyerId: 'l2', title: 'Bail Hearing', type: 'Hearing', date: getDateFromToday(8), time: '10:00 AM', duration: 120, mode: 'Online', status: 'Pending', notes: 'Court hearing for bail application.', caseId: 'c2' },
    { id: 'appt4', clientId: 'user1', lawyerId: 'l1', title: 'Submission Deadline', type: 'Deadline', date: getDateFromToday(0), time: '05:00 PM', duration: 0, mode: 'Online', status: 'Confirmed', notes: 'Submit all evidence for land dispute.' },
    { id: 'appt5', clientId: 'user1', lawyerId: 'l1', title: 'Team Briefing', type: 'Meeting', date: getDateFromToday(12), time: '09:00 AM', duration: 45, mode: 'Online', status: 'Confirmed', notes: 'Internal team meeting.' },
    { id: 'appt6', clientId: 'user1', lawyerId: 'l1', title: 'Arbitration Session', type: 'Hearing', date: getDateFromToday(15), time: '03:00 PM', duration: 90, mode: 'In-Person', status: 'Confirmed', notes: 'Arbitration with opposing party.' },
];

export const MOCK_ACTIVITY_LOGS: ActivityLog[] = [
    { id: 'act1', userId: 'user1', message: 'Lawyer "Anisul Huq" uploaded a document for Case #c1.', timestamp: '2h ago', caseId: 'c1' },
    { id: 'act2', userId: 'user1', message: 'Your case status for "Bail Application" was updated to Scheduled.', timestamp: '1d ago', caseId: 'c2' },
    { id: 'act3', userId: 'user1', message: 'You uploaded "Neighbor_Encroachment.jpg".', timestamp: '2d ago', caseId: 'c1' },
    { id: 'act4', userId: 'user1', message: 'Appointment with "Farida Yasmin" was confirmed.', timestamp: '3d ago' },
];

export const MOCK_MESSAGES: Message[] = [
    { id: 'msg1', senderId: 'l1', receiverId: 'user1', text: 'Hi John, I have reviewed the property deed you sent. Could you please provide the latest survey report?', timestamp: Date.now() - 3600000 * 24 * 2, read: true, caseId: 'c1' },
    { id: 'msg2', senderId: 'user1', receiverId: 'l1', text: 'Sure, I will upload it to the vault shortly.', timestamp: Date.now() - 3600000 * 24, read: true, caseId: 'c1' },
    { id: 'msg5', senderId: 'user1', receiverId: 'l1', text: 'I have just uploaded the survey report. Please let me know if you need anything else.', timestamp: Date.now() - 3600000 * 2, read: true, caseId: 'c1', attachment: { name: 'Survey_Report_Savar.pdf', url: '#', size: 2300000 } },
    { id: 'msg6', senderId: 'l1', receiverId: 'user1', text: 'Thank you, John. I have received it. I am preparing the initial draft of our legal response now.', timestamp: Date.now() - 3600000, read: false, caseId: 'c1' },
    { id: 'msg7', senderId: 'l1', receiverId: 'user1', text: 'We need to move quickly on this. I suggest we schedule a brief call tomorrow to discuss the strategy.', timestamp: Date.now() - 3500000, read: false, caseId: 'c1' },
    { id: 'msg3', senderId: 'l3', receiverId: 'user1', text: 'Just a reminder about our appointment tomorrow. Please be ready with all the necessary documents.', timestamp: Date.now() - 86400000, read: true },
    { id: 'msg4', senderId: 'admin1', receiverId: 'user1', text: 'Welcome to CLA! We are happy to have you on board. Let us know if you need any assistance.', timestamp: Date.now() - 172800000, read: true },
];
