import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { AppHeader } from '../../components/layout/AppHeader';
import { useAuth } from '../../hooks/useAuth';

interface Message {
  id: string;
  sender: 'user' | 'concierge' | 'system';
  text: string;
  time: string;
  tag?: string;
}

export const ChatScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'sys-1',
      sender: 'system',
      text: 'Tiền cọc của bạn được bảo chứng qua Smart Escrow. Hệ thống hoàn cọc tự động 100% trong 24h sau khi Shop Owner đối soát.',
      time: '09:00',
      tag: 'BẢO CHỨNG ESCROW',
    },
    {
      id: 'c-1',
      sender: 'concierge',
      text: 'Xin chào! Tôi là Chuyên viên Concierge phụ trách đối soát kỹ thuật tại ReUse Hub. Bạn cần hỗ trợ gì về lịch thuê, quy trình đóng gói hay đơn THRIFT?',
      time: '09:02',
    },
  ]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: inputText.trim(),
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, newMsg]);
    setInputText('');

    // Automated concierge assistant response
    setTimeout(() => {
      const reply: Message = {
        id: `reply-${Date.now()}`,
        sender: 'concierge',
        text: 'Chuyên viên đã tiếp nhận thông tin và đang tra cứu hồ sơ kỹ thuật trên hệ thống. Chúng tôi sẽ phản hồi bạn trong ít phút.',
        time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, reply]);
    }, 1200);
  };

  return (
    <View style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <AppHeader title="Tin Nhắn &amp; Hỗ Trợ" showBack />

        {/* Concierge Info Bar */}
        <View style={styles.conciergeBar}>
          <View style={styles.conciergeAvatar}>
            <Text style={styles.conciergeInitial}>RH</Text>
            <View style={styles.onlineDot} />
          </View>
          <View style={styles.conciergeInfo}>
            <Text style={styles.conciergeName}>Bàn Hỗ Trợ Concierge</Text>
            <Text style={styles.conciergeSub}>Trực tuyến · Giám sát đơn cọc &amp; Kỹ thuật</Text>
          </View>
          <TouchableOpacity
            style={styles.faqQuickBtn}
            onPress={() => navigation.navigate('FAQ')}
          >
            <Text style={styles.faqQuickText}>FAQ</Text>
          </TouchableOpacity>
        </View>

        {/* Messages List */}
        <ScrollView
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((m) => {
            if (m.sender === 'system') {
              return (
                <View key={m.id} style={styles.systemBox}>
                  {m.tag && (
                    <View style={styles.systemTagBadge}>
                      <Ionicons name="shield-checkmark" size={12} color="#059669" />
                      <Text style={styles.systemTagText}>{m.tag}</Text>
                    </View>
                  )}
                  <Text style={styles.systemText}>{m.text}</Text>
                  <Text style={styles.systemTime}>{m.time}</Text>
                </View>
              );
            }

            const isUser = m.sender === 'user';
            return (
              <View
                key={m.id}
                style={[
                  styles.messageBubbleWrap,
                  isUser ? styles.bubbleWrapUser : styles.bubbleWrapConcierge,
                ]}
              >
                <View
                  style={[
                    styles.messageBubble,
                    isUser ? styles.bubbleUser : styles.bubbleConcierge,
                  ]}
                >
                  <Text
                    style={[
                      styles.messageText,
                      isUser ? styles.messageTextUser : styles.messageTextConcierge,
                    ]}
                  >
                    {m.text}
                  </Text>
                  <Text
                    style={[
                      styles.messageTime,
                      isUser ? styles.messageTimeUser : styles.messageTimeConcierge,
                    ]}
                  >
                    {m.time}
                  </Text>
                </View>
              </View>
            );
          })}
        </ScrollView>

        {/* Input Bar */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.textInput}
            placeholder="Nhập nội dung cần hỗ trợ..."
            placeholderTextColor="#A8A29E"
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity
            style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!inputText.trim()}
          >
            <Feather name="send" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FBF9F5',
  },
  keyboardContainer: {
    flex: 1,
  },
  conciergeBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E7E2DA',
    gap: 10,
  },
  conciergeAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#1C1A18',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  conciergeInitial: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  onlineDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: '#059669',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
  conciergeInfo: {
    flex: 1,
  },
  conciergeName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1C1A18',
  },
  conciergeSub: {
    fontSize: 10,
    color: '#78736A',
  },
  faqQuickBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#F4F0EA',
    borderWidth: 1,
    borderColor: '#E7E2DA',
  },
  faqQuickText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1C1A18',
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  systemBox: {
    backgroundColor: '#F4F0EA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E7E2DA',
    padding: 12,
    alignItems: 'center',
    gap: 4,
  },
  systemTagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 2,
  },
  systemTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#059669',
    letterSpacing: 0.5,
  },
  systemText: {
    fontSize: 11,
    color: '#5E5A53',
    textAlign: 'center',
    lineHeight: 16,
  },
  systemTime: {
    fontSize: 9,
    color: '#78736A',
  },
  messageBubbleWrap: {
    flexDirection: 'row',
  },
  bubbleWrapUser: {
    justifyContent: 'flex-end',
  },
  bubbleWrapConcierge: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleUser: {
    backgroundColor: '#1C1A18',
    borderBottomRightRadius: 2,
  },
  bubbleConcierge: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E7E2DA',
    borderBottomLeftRadius: 2,
  },
  messageText: {
    fontSize: 12,
    lineHeight: 17,
  },
  messageTextUser: {
    color: '#FFFFFF',
  },
  messageTextConcierge: {
    color: '#1C1A18',
  },
  messageTime: {
    fontSize: 9,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  messageTimeUser: {
    color: 'rgba(255,255,255,0.7)',
  },
  messageTimeConcierge: {
    color: '#78736A',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#E7E2DA',
    gap: 8,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#FBF9F5',
    borderWidth: 1,
    borderColor: '#E7E2DA',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 12,
    color: '#1C1A18',
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1C1A18',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: '#A8A29E',
  },
});
