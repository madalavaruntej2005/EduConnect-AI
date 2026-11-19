import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import api from '../services/api';

export const CareersScreen = () => {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await api.get('/jobs/');
        setJobs(res.data.results || res.data || []);
      } catch (e) {
        console.error(e);
      }
    };
    fetchJobs();
  }, []);

  const handleApply = async (job) => {
    try {
      await api.post(`/jobs/${job.id}/apply/`, {
        resume_url: 'https://example.com/mobile_resume.pdf',
        cover_letter: 'Applying via EduConnect Mobile App.',
      });
      Alert.alert('Applied!', `Your application for ${job.title} was submitted.`);
    } catch (e) {
      Alert.alert('Notice', 'You have already applied or this role is closed.');
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={jobs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.badgeRow}>
              <Text style={styles.jobType}>{item.job_type}</Text>
              <Text style={styles.salary}>{item.salary_range}</Text>
            </View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.company}>{item.company_name} • {item.location}</Text>
            <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>

            <TouchableOpacity style={styles.applyBtn} onPress={() => handleApply(item)}>
              <Text style={styles.applyBtnText}>One-Tap Apply</Text>
            </TouchableOpacity>
          </View>
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
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  badgeRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  jobType: { fontSize: 10, fontWeight: '800', color: '#4f46e5' },
  salary: { fontSize: 11, fontWeight: '700', color: '#16a34a' },
  title: { fontSize: 14, fontWeight: '800', color: '#0f172a' },
  company: { fontSize: 11, color: '#64748b', marginTop: 2 },
  desc: { fontSize: 11, color: '#475569', marginTop: 6, lineHeight: 16 },
  applyBtn: {
    backgroundColor: '#4f46e5',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 12,
  },
  applyBtnText: { color: '#ffffff', fontSize: 12, fontWeight: '700' },
});
