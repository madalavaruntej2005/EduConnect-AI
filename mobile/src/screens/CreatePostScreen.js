import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert
} from 'react-native';
import api from '../services/api';

export const CreatePostScreen = ({ navigation }) => {
  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePublish = async () => {
    if (!content.trim()) {
      Alert.alert('Required', 'Please write some content to share.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/posts/', {
        content: content.trim(),
        post_type: mediaUrl ? 'IMAGE' : 'TEXT',
        visibility: 'PUBLIC',
        media: mediaUrl ? [{ file_url: mediaUrl, media_type: 'IMAGE' }] : []
      });
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', 'Failed to publish post.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.textArea}
        placeholder="Share a study note, coding milestone, or question with fellow students..."
        value={content}
        onChangeText={setContent}
        multiline
        numberOfLines={6}
      />

      <TextInput
        style={styles.mediaInput}
        placeholder="Attach Image URL (https://...)"
        value={mediaUrl}
        onChangeText={setMediaUrl}
        autoCapitalize="none"
      />

      <TouchableOpacity style={styles.publishBtn} onPress={handlePublish} disabled={loading}>
        {loading ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.publishBtnText}>Publish Post</Text>}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 20,
    gap: 16,
  },
  textArea: {
    height: 160,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    padding: 16,
    fontSize: 14,
    textAlignVertical: 'top',
    backgroundColor: '#f8fafc',
  },
  mediaInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    padding: 14,
    fontSize: 13,
    backgroundColor: '#f8fafc',
  },
  publishBtn: {
    backgroundColor: '#4f46e5',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  publishBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
});
