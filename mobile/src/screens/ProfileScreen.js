import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

export const ProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const uSaved = await AsyncStorage.getItem('user');
        if (uSaved) setUser(JSON.parse(uSaved));

        const res = await api.get('/profiles/me/');
        setProfile(res.data);
      } catch (e) {
        console.error(e);
      }
    };
    loadProfile();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image
          source={{ uri: user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80' }}
          style={styles.avatar}
        />
        <Text style={styles.name}>{user?.first_name ? `${user.first_name} ${user.last_name}` : user?.username}</Text>
        <Text style={styles.role}>{user?.role} • Class of {profile?.graduation_year || 2026}</Text>
        <Text style={styles.headline}>{user?.headline || 'Student @ EduConnect AI'}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>STUDENT STREAK & BADGES</Text>
        <View style={styles.streakCard}>
          <Text style={styles.streakText}>🔥 {profile?.streak_count || 14} Day Study Streak Active</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>SKILLS</Text>
        <View style={styles.skillsRow}>
          {(profile?.skills || ['Python', 'React', 'AI', 'PostgreSQL']).map((skill) => (
            <View key={skill} style={styles.skillChip}>
              <Text style={styles.skillText}>{skill}</Text>
            </View>
          ))}
        </View>
      </View>

      <TouchableOpacity
        style={styles.logoutBtn}
        onPress={async () => {
          await AsyncStorage.clear();
          navigation.replace('Login');
        }}
      >
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  header: { alignItems: 'center', padding: 24, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  avatar: { width: 90, height: 90, borderRadius: 45, marginBottom: 12 },
  name: { fontSize: 18, fontWeight: '900', color: '#0f172a' },
  role: { fontSize: 12, fontWeight: '700', color: '#4f46e5', marginTop: 4 },
  headline: { fontSize: 12, color: '#64748b', textAlign: 'center', marginTop: 6 },
  section: { padding: 20 },
  sectionTitle: { fontSize: 11, fontWeight: '800', color: '#94a3b8', letterSpacing: 0.8, marginBottom: 10 },
  streakCard: { backgroundColor: '#fffbeb', padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#fef3c7' },
  streakText: { fontSize: 13, fontWeight: '800', color: '#b45309' },
  skillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  skillChip: { backgroundColor: '#eef2ff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  skillText: { fontSize: 12, fontWeight: '700', color: '#4f46e5' },
  logoutBtn: { margin: 20, padding: 14, borderRadius: 12, backgroundColor: '#fff1f2', alignItems: 'center' },
  logoutText: { color: '#e11d48', fontSize: 13, fontWeight: '700' },
});
