import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native';
import api from '../services/api';

export const LearningScreen = ({ navigation }) => {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get('/courses/');
        setCourses(res.data.results || res.data || []);
      } catch (e) {
        console.error(e);
      }
    };
    fetchCourses();
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={courses}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('VideoPlayer', { course: item })}
          >
            <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
            <View style={styles.info}>
              <View style={styles.badgeRow}>
                <Text style={styles.difficulty}>{item.difficulty}</Text>
                <Text style={styles.rating}>★ {item.rating}</Text>
              </View>
              <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
              <Text style={styles.hours}>{item.duration_hours} hours total</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 12 },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  thumbnail: { width: '100%', height: 160 },
  info: { padding: 14 },
  badgeRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  difficulty: { fontSize: 10, fontWeight: '800', color: '#16a34a' },
  rating: { fontSize: 11, fontWeight: '700', color: '#f59e0b' },
  title: { fontSize: 14, fontWeight: '800', color: '#0f172a', lineHeight: 20 },
  hours: { fontSize: 11, color: '#94a3b8', marginTop: 6 },
});
