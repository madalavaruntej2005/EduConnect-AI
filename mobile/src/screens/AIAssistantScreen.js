import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator
} from 'react-native';
import api from '../services/api';

export const AIAssistantScreen = () => {
  const [messages, setMessages] = useState([
    { id: '1', role: 'assistant', content: 'Hello! I am your EduConnect AI Academic Tutor. How can I assist your learning today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);

  useEffect(() => {
    const initConv = async () => {
      try {
        const res = await api.get('/ai/');
        const list = res.data.results || res.data || [];
        if (list.length > 0) {
          setConversationId(list[0].id);
          if (list[0].messages && list[0].messages.length > 0) {
            setMessages(list[0].messages);
          }
        } else {
          const createRes = await api.post('/ai/', { title: 'Mobile AI Tutor', context_mode: 'TUTOR' });
          setConversationId(createRes.data.id);
        }
      } catch (e) {
        console.error(e);
      }
    };
    initConv();
  }, []);

  const handleSend = async () => {
    if (!input.trim() || loading || !conversationId) return;

    const userText = input.trim();
    setInput('');
    const tempUserMsg = { id: String(Date.now()), role: 'user', content: userText };
    setMessages((prev) => [...prev, tempUserMsg]);
    setLoading(true);

    try {
      const res = await api.post(`/ai/${conversationId}/ask/`, { prompt: userText });
      setMessages((prev) => [...prev, res.data.assistant_message]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { id: String(Date.now()), role: 'assistant', content: 'Connection error while communicating with AI tutor.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <View style={[styles.bubble, item.role === 'user' ? styles.userBubble : styles.aiBubble]}>
            <Text style={[styles.msgText, item.role === 'user' ? styles.userText : styles.aiText]}>
              {item.content}
            </Text>
          </View>
        )}
        contentContainerStyle={styles.list}
      />

      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          placeholder="Ask concept, debug code, or practice quiz..."
          value={input}
          onChangeText={setInput}
        />
        <TouchableOpacity style={styles.sendBtn} onPress={handleSend} disabled={loading}>
          {loading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.sendText}>Send</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  list: { padding: 16, gap: 10 },
  bubble: { maxWidth: '82%', padding: 12, borderRadius: 16 },
  userBubble: { alignSelf: 'flex-end', backgroundColor: '#4f46e5', borderBottomRightRadius: 2 },
  aiBubble: { alignSelf: 'flex-start', backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e2e8f0', borderBottomLeftRadius: 2 },
  msgText: { fontSize: 13, lineHeight: 19 },
  userText: { color: '#ffffff' },
  aiText: { color: '#0f172a' },
  inputBar: { flexDirection: 'row', padding: 12, backgroundColor: '#ffffff', borderTopWidth: 1, borderTopColor: '#e2e8f0', gap: 10 },
  input: { flex: 1, backgroundColor: '#f1f5f9', borderRadius: 12, paddingHorizontal: 14, fontSize: 13 },
  sendBtn: { backgroundColor: '#4f46e5', paddingHorizontal: 16, borderRadius: 12, justifyContent: 'center' },
  sendText: { color: '#ffffff', fontWeight: '700', fontSize: 13 },
});
