import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import api from '../services/api';

export const NotificationsScreen = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const res = await api.get('/notifications/');
        setNotifications(res.data.results || res.data || []);
      } catch (e) {
        console.error(e);
      }
    };
    fetchNotifs();
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.verb}>
              <Text style={styles.actor}>{item.actor?.username || 'A student'} </Text>
              {item.verb}
            </Text>
            <Text style={styles.time}>{new Date(item.created_at).toLocaleDateString()}</Text>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No alerts right now.</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  card: { backgroundColor: '#ffffff', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  verb: { fontSize: 13, color: '#1e293b' },
  actor: { fontWeight: '700', color: '#4f46e5' },
  time: { fontSize: 10, color: '#94a3b8', marginTop: 4 },
  empty: { padding: 40, alignItems: 'center' },
  emptyText: { color: '#94a3b8' },
});
