import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const SettingsScreen = ({ navigation }) => {
  const handleClearCache = async () => {
    Alert.alert('Cache Cleared', 'Offline learning video and feed cache reset successfully.');
  };

  const handleLogout = async () => {
    await AsyncStorage.clear();
    navigation.replace('Login');
  };

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>PREFERENCES</Text>
        <TouchableOpacity style={styles.row}>
          <Text style={styles.rowLabel}>Push Notifications</Text>
          <Text style={styles.rowVal}>Enabled</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.row}>
          <Text style={styles.rowLabel}>Dark Theme</Text>
          <Text style={styles.rowVal}>System Default</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionHeader}>DATA & STORAGE</Text>
        <TouchableOpacity style={styles.row} onPress={handleClearCache}>
          <Text style={styles.rowLabel}>Clear Offline Learning Cache</Text>
          <Text style={styles.rowVal}>Reset</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionHeader}>ACCOUNT</Text>
        <TouchableOpacity style={styles.row} onPress={handleLogout}>
          <Text style={[styles.rowLabel, { color: '#e11d48' }]}>Sign Out of EduConnect</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 16 },
  section: { backgroundColor: '#ffffff', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#e2e8f0' },
  sectionHeader: { fontSize: 10, fontWeight: '800', color: '#94a3b8', letterSpacing: 0.8, marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f8fafc' },
  rowLabel: { fontSize: 13, fontWeight: '600', color: '#1e293b' },
  rowVal: { fontSize: 13, color: '#4f46e5', fontWeight: '700' },
});
