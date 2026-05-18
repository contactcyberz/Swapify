import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput,
  TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { useAuth } from '../../hooks/useAuth';
import { subscribeToMessages, sendMessage, ChatMessage } from '../../services/messages';
import { updateExchangeStatus } from '../../services/exchanges';

export const ChatScreen = ({ route, navigation }: any) => {
  const { exchange } = route.params;
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const isRequester = exchange.requesterId === user?.uid;
  const otherName = isRequester ? exchange.providerName : exchange.requesterName;
  const otherAvatar = isRequester ? exchange.providerAvatar : exchange.requesterAvatar;

  useEffect(() => {
    const unsub = subscribeToMessages(exchange.id, (msgs) => {
      setMessages(msgs);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    });
    return unsub;
  }, [exchange.id]);

  const handleSend = async () => {
    if (!text.trim() || !user?.uid) return;
    setSending(true);
    try {
      await sendMessage(
        exchange.id,
        user.uid,
        user.displayName || 'Moi',
        text.trim(),
      );
      setText('');
    } catch (e) {
      console.log('Send error:', e);
    } finally {
      setSending(false);
    }
  };

  const handleAccept = async () => {
    await updateExchangeStatus(exchange.id, 'accepted');
    navigation.setParams({ exchange: { ...exchange, status: 'accepted' } });
  };

  const handleDecline = async () => {
    await updateExchangeStatus(exchange.id, 'declined');
    navigation.goBack();
  };

  const handleComplete = () => {
    navigation.navigate('Rating', { exchange });
  };

  const statusColor = {
    pending: Colors.warning,
    accepted: Colors.accent,
    declined: Colors.error,
    completed: Colors.primary,
  };
  const statusLabel = {
    pending: 'En attente',
    accepted: 'Accepté ✓',
    declined: 'Refusé',
    completed: 'Terminé',
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerAvatar}>{otherAvatar}</Text>
          <View>
            <Text style={styles.headerName}>{otherName}</Text>
            <View style={[styles.statusPill, { backgroundColor: (statusColor as any)[exchange.status] + '33' }]}>
              <Text style={[styles.statusText, { color: (statusColor as any)[exchange.status] }]}>
                {(statusLabel as any)[exchange.status]}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Exchange info banner */}
      <View style={styles.exchangeBanner}>
        <View style={styles.bannerSkill}>
          <Text style={styles.bannerLabel}>Il/Elle offre</Text>
          <Text style={styles.bannerSkillText}>{exchange.skillOffered}</Text>
        </View>
        <Ionicons name="swap-horizontal" size={18} color={Colors.primary} />
        <View style={styles.bannerSkill}>
          <Text style={styles.bannerLabel}>Tu offres</Text>
          <Text style={styles.bannerSkillText}>{exchange.skillWanted}</Text>
        </View>
        <View style={styles.bannerDuration}>
          <Text style={styles.bannerDurationText}>⏱ {exchange.duration}</Text>
        </View>
      </View>

      {/* Complete exchange button (when accepted) */}
      {exchange.status === 'accepted' && (
        <TouchableOpacity style={styles.completeBtn} onPress={handleComplete}>
          <Ionicons name="checkmark-circle" size={18} color={Colors.white} />
          <Text style={styles.completeBtnText}>Terminer l'échange & noter</Text>
        </TouchableOpacity>
      )}

      {/* Accept/Decline banner (only for provider when pending) */}
      {!isRequester && exchange.status === 'pending' && (
        <View style={styles.actionBanner}>
          <Text style={styles.actionBannerText}>
            {exchange.requesterName} propose un échange !
          </Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.declineBtn} onPress={handleDecline}>
              <Text style={styles.declineBtnText}>Refuser</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.acceptBtn} onPress={handleAccept}>
              <Ionicons name="checkmark" size={16} color={Colors.white} />
              <Text style={styles.acceptBtnText}>Accepter</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Messages */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
          ListEmptyComponent={
            <View style={styles.emptyChat}>
              <Text style={styles.emptyChatEmoji}>💬</Text>
              <Text style={styles.emptyChatText}>
                {exchange.message
                  ? `Message initial:\n"${exchange.message}"`
                  : 'Commence la conversation !'}
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const isMe = item.senderId === user?.uid;
            return (
              <View style={[styles.messageRow, isMe && styles.messageRowMe]}>
                {!isMe && <Text style={styles.msgAvatar}>{otherAvatar}</Text>}
                <View style={[styles.messageBubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
                  <Text style={[styles.messageText, isMe && styles.messageTextMe]}>{item.text}</Text>
                  <Text style={[styles.messageTime, isMe && styles.messageTimeMe]}>
                    {formatTime(item.createdAt)}
                  </Text>
                </View>
              </View>
            );
          }}
        />

        {/* Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Écris un message..."
            placeholderTextColor={Colors.textMuted}
            value={text}
            onChangeText={setText}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!text.trim() || sending) && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!text.trim() || sending}
          >
            {sending
              ? <ActivityIndicator color={Colors.white} size="small" />
              : <Ionicons name="send" size={18} color={Colors.white} />
            }
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border,
    gap: 12,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center',
  },
  headerInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerAvatar: { fontSize: 32 },
  headerName: { color: Colors.text, fontSize: 16, fontWeight: '700' },
  statusPill: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2, alignSelf: 'flex-start', marginTop: 2 },
  statusText: { fontSize: 10, fontWeight: '600' },
  exchangeBanner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.primaryTransparent, paddingHorizontal: 16, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: Colors.primary + '33', gap: 8,
  },
  bannerSkill: { flex: 1 },
  bannerLabel: { color: Colors.textMuted, fontSize: 9, marginBottom: 2 },
  bannerSkillText: { color: Colors.text, fontSize: 12, fontWeight: '600' },
  bannerDuration: {
    backgroundColor: Colors.primary + '33', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4,
  },
  bannerDurationText: { color: Colors.primary, fontSize: 11, fontWeight: '600' },
  actionBanner: {
    backgroundColor: Colors.warning + '22', padding: 16,
    borderBottomWidth: 1, borderBottomColor: Colors.warning + '33',
  },
  actionBannerText: { color: Colors.text, fontSize: 14, fontWeight: '600', marginBottom: 10 },
  actionButtons: { flexDirection: 'row', gap: 10 },
  declineBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 10,
    backgroundColor: Colors.error + '22', alignItems: 'center',
    borderWidth: 1, borderColor: Colors.error + '44',
  },
  declineBtnText: { color: Colors.error, fontSize: 14, fontWeight: '600' },
  acceptBtn: {
    flex: 2, paddingVertical: 10, borderRadius: 10,
    backgroundColor: Colors.accent, alignItems: 'center',
    flexDirection: 'row', justifyContent: 'center', gap: 6,
  },
  acceptBtnText: { color: Colors.white, fontSize: 14, fontWeight: '700' },
  messagesList: { padding: 16, gap: 8, flexGrow: 1 },
  emptyChat: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, minHeight: 200 },
  emptyChatEmoji: { fontSize: 40, marginBottom: 12 },
  emptyChatText: { color: Colors.textMuted, fontSize: 14, textAlign: 'center', lineHeight: 22 },
  messageRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginVertical: 4 },
  messageRowMe: { flexDirection: 'row-reverse' },
  msgAvatar: { fontSize: 24, marginBottom: 4 },
  messageBubble: {
    maxWidth: '75%', borderRadius: 18, padding: 12,
  },
  bubbleMe: {
    backgroundColor: Colors.primary, borderBottomRightRadius: 4,
  },
  bubbleThem: {
    backgroundColor: Colors.surface, borderBottomLeftRadius: 4,
    borderWidth: 1, borderColor: Colors.border,
  },
  messageText: { color: Colors.text, fontSize: 15, lineHeight: 22 },
  messageTextMe: { color: Colors.white },
  messageTime: { color: Colors.textMuted, fontSize: 10, marginTop: 4, textAlign: 'right' },
  messageTimeMe: { color: Colors.white + 'aa' },
  inputContainer: {
    flexDirection: 'row', alignItems: 'flex-end',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: Colors.surface, borderTopWidth: 1, borderTopColor: Colors.border, gap: 10,
  },
  input: {
    flex: 1, backgroundColor: Colors.background, borderRadius: 22,
    paddingHorizontal: 16, paddingVertical: 10, color: Colors.text, fontSize: 15,
    borderWidth: 1, borderColor: Colors.border, maxHeight: 100,
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  sendBtnDisabled: { opacity: 0.4 },
  completeBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: Colors.accent, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: Colors.accent + '44',
  },
  completeBtnText: { color: Colors.white, fontSize: 14, fontWeight: '700' },
});
