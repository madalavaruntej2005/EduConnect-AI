import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const SplashScreen = ({ navigation }) => {
  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await AsyncStorage.getItem('access_token');
        setTimeout(() => {
          if (token) {
            navigation.replace('MainTabs');
          } else {
            navigation.replace('Onboarding');
          }
        }, 1200);
      } catch (e) {
        navigation.replace('Onboarding');
      }
    };
    checkToken();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.logoBadge}>
        <Text style={styles.logoEmoji}>✨</Text>
      </View>
      <Text style={styles.title}>EduConnect AI</Text>
      <Text style={styles.subtitle}>Student Social Learning Ecosystem</Text>
      <ActivityIndicator size="small" color="#ffffff" style={styles.spinner} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4f46e5',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  logoBadge: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logoEmoji: {
    fontSize: 36,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 6,
    textAlign: 'center',
  },
  spinner: {
    marginTop: 32,
  },
});
