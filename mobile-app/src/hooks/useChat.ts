import { useState, useEffect, useCallback } from 'react';
import {
  getMyConversationApi,
  getMessagesApi,
  sendMessageApi,
  type Conversation,
  type ChatMessage,
} from '../services/chat.api';
import { useAuth } from './useAuth';

export const useChat = () => {
  const { token } = useAuth();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const loadConversation = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const conv = await getMyConversationApi();
      setConversation(conv);
      if (conv?._id) {
        const msgs = await getMessagesApi(conv._id);
        setMessages(msgs);
      }
    } catch (e) {
      console.warn('Failed to load chat conversation:', e);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadConversation();
  }, [loadConversation]);

  const sendMessage = async (content: string, images?: string[]) => {
    if (!conversation?._id) return null;
    const newMsg = await sendMessageApi(conversation._id, content, images);
    if (newMsg) {
      setMessages((prev) => [...prev, newMsg]);
    }
    return newMsg;
  };

  return {
    conversation,
    messages,
    loading,
    reload: loadConversation,
    sendMessage,
  };
};

export default useChat;
