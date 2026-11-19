import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native';
import api from '../services/api';

export const CommunitiesScreen = () => {
  const [communities, setCommunities] = useState([]);

  useEffect(() => {
    const fetchComm = async () => {
      try {
        const res = await api.get('/communities/');
        setCommunities(res.data.results || res.data || []);
      } catch (e) {
        console.error(e);
      }
    };
    fetchComm();
  }, []);

  const handleToggle = async (comm) => {
    try {
      if (comm.is_member) {
        await api.post(`/communities/${comm.id}/leave/`);
      } else {
        await api.post(`/communities/${comm.id}/join/`);
      }
      setCommunities((prev) =>
        prev.map((c) => (c.id === comm.id ? { ...c, is_member: !c.is_member } : c))
      );
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={communities}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
            <View style={styles.info}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.category}>{item.category} • {item.members_count} members</Text>
              <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>
            </View>
            <TouchableOpacity
              style={[styles.btn, item.is_member ? styles.btnJoined : null]}
              onPress={() => handleToggle(item)}
            >
              <Text style={[styles.btnText, item.is_member ? styles.btnJoinedText : null]}>
                {item.is_member ? 'Joined' : 'Join'}
              </Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  avatar: { width: 50, height: 50, borderRadius: 14 },
  info: { flex: 1 },
  name: { fontSize: 13, fontWeight: '800', color: '#0f172a' },
  category: { fontSize: 10, fontWeight: '700', color: '#4f46e5', marginTop: 2 },
  desc: { fontSize: 11, color: '#64748b', marginTop: 4 },
  btn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#4f46e5',
  },
  btnJoined: {
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  btnText: { color: '#ffffff', fontSize: 12, fontWeight: '700' },
  btnJoinedText: { color: '#16a34a' },
});
