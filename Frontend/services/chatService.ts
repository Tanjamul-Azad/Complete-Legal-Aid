import apiClient from '../config/apiClient';
import { Message } from '../types';

interface ChatMessageApi {
    message_id: number;
    case?: string | null;
    sender: string;
    receiver?: string | null;
    message_text: string;
    attachment?: string | null;
    sent_at: string;
    is_read: boolean;
}

const mapApiToMessage = (apiMsg: ChatMessageApi): Message => ({
    id: apiMsg.message_id.toString(),
    senderId: apiMsg.sender,
    receiverId: apiMsg.receiver || '', // Handle null receiver if necessary
    text: apiMsg.message_text,
    timestamp: new Date(apiMsg.sent_at).getTime(),
    read: apiMsg.is_read,
    caseId: apiMsg.case || undefined,
    // Attachment handling would go here if backend returns details
});

const getMessages = async (): Promise<Message[]> => {
    try {
        const response = await apiClient.get<ChatMessageApi[]>('/chat-messages/');
        // Handle pagination if response is { results: [...] }
        const data = Array.isArray(response.data) ? response.data : (response.data as any).results || [];
        return data.map(mapApiToMessage);
    } catch (error) {
        console.error('Get messages error:', error);
        return [];
    }
};

const sendMessage = async (receiverId: string, text: string, caseId?: string, attachmentId?: string): Promise<Message | null> => {
    try {
        const payload: any = {
            message_text: text,
            receiver: receiverId,
        };
        if (caseId) payload.case = caseId;
        if (attachmentId) payload.attachment = attachmentId;

        const response = await apiClient.post<ChatMessageApi>('/chat-messages/', payload);
        return mapApiToMessage(response.data);
    } catch (error) {
        console.error('Send message error:', error);
        return null;
    }
};

export const chatService = {
    getMessages,
    sendMessage,
};
