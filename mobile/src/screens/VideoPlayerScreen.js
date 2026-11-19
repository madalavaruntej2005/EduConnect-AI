import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

export const VideoPlayerScreen = ({ route, navigation }) => {
  const { course } = route.params || {};

  return (
    <ScrollView style={styles.container}>
      {/* Mock Video Viewport */}
      <View style={styles.playerBox}>
        <Text style={styles.playerEmoji}>▶️</Text>
        <Text style={styles.playerText}>Video Streaming Viewport</Text>
      </View>

      <View style={styles.details}>
        <Text style={styles.title}>{course?.title || 'Course Lesson'}</Text>
        <Text style={styles.desc}>{course?.description || 'Interactive lecture'}</Text>

        <View style={styles.divider} />
        <Text style={styles.subhead}>LESSON TOPICS</Text>
        <View style={styles.lessonItem}>
          <Text style={styles.lessonTitle}>1. Core Principles & Domain Models</Text>
          <Text style={styles.lessonTime}>12 mins</Text>
        </View>
        <View style={styles.lessonItem}>
          <Text style={styles.lessonTitle}>2. High-Throughput REST APIs</Text>
          <Text style={styles.lessonTime}>18 mins</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  playerBox: {
    height: 220,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerEmoji: { fontSize: 44, color: '#ffffff' },
  playerText: { color: '#ffffff', fontSize: 13, marginTop: 8, fontWeight: '600' },
  details: { padding: 20 },
  title: { fontSize: 18, fontWeight: '800', color: '#0f172a' },
  desc: { fontSize: 13, color: '#64748b', marginTop: 8, lineHeight: 20 },
  divider: { height: 1, backgroundColor: '#e2e8f0', marginVertical: 20 },
  subhead: { fontSize: 11, fontWeight: '800', color: '#94a3b8', letterSpacing: 0.8, marginBottom: 12 },
  lessonItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  lessonTitle: { fontSize: 13, fontWeight: '600', color: '#1e293b' },
  lessonTime: { fontSize: 12, color: '#94a3b8' },
});
