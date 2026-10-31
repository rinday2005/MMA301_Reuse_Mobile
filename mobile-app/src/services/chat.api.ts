import api from './api';

export interface ChatMessage {
  _id: string;
  conversationId: string;
  sender: {
    _id: string;
    fullName: string;
    avatarUrl?: string;
    role: string;
  };
  recipient: string;
  content: string;
  images?: string[];
  isRead: boolean;
  createdAt: string;
}

export interface Conversation {
  _id: string;
  participants: Array<{
    _id: string;
    fullName: string;
    avatarUrl?: string;
    role: string;
  }>;
  lastMessage?: ChatMessage | string;
  updatedAt: string;
}

/**
 * Lấy conversation giữa user hiện tại và Shop Owner
 * GET /api/chat/conversation
 */
export const getMyConversationApi = async (): Promise<Conversation | null> => {
  try {
    const res = await api.get('/chat/conversation');
    return res.data?.data || res.data || null;
  } catch (error) {
    console.warn('Could not fetch chat conversation:', error);
    return null;
  }
};

/**
 * Lấy danh sách conversations của user
 * GET /api/chat/conversations
 */
export const getConversationsApi = async (): Promise<Conversation[]> => {
  try {
    const res = await api.get('/chat/conversations');
    const data = res.data?.data || res.data;
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.warn('Could not fetch conversations:', error);
    return [];
  }
};

/**
 * Chi tiết conversation theo ID
 * GET /api/chat/conversations/:id
 */
export const getConversationByIdApi = async (id: string): Promise<Conversation | null> => {
  try {
    const res = await api.get(`/chat/conversations/${id}`);
    return res.data?.data || res.data || null;
  } catch (error) {
    console.warn('Could not fetch conversation detail:', error);
    return null;
  }
};

/**
 * Lấy tin nhắn theo conversation
 * GET /api/chat/conversations/:id/messages
 */
export const getMessagesApi = async (
  conversationId: string,
  page: number = 1,
  limit: number = 50
): Promise<ChatMessage[]> => {
  try {
    const res = await api.get(`/chat/conversations/${conversationId}/messages`, {
      params: { page, limit },
    });
    const data = res.data?.data || res.data;
    if (Array.isArray(data)) return data;
    if (data?.messages && Array.isArray(data.messages)) return data.messages;
    return [];
  } catch (error) {
    console.warn('Could not fetch messages:', error);
    return [];
  }
};

/**
 * Gửi tin nhắn mới
 * POST /api/chat/conversations/:id/messages
 */
export const sendMessageApi = async (
  conversationId: string,
  content: string,
  images?: string[]
): Promise<ChatMessage | null> => {
  const res = await api.post(`/chat/conversations/${conversationId}/messages`, {
    content,
    images: images || [],
  });
  return res.data?.data || res.data || null;
};

export default {
  getMyConversationApi,
  getConversationsApi,
  getConversationByIdApi,
  getMessagesApi,
  sendMessageApi,
};
