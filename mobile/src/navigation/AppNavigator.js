import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';

// Screens
import { SplashScreen } from '../screens/SplashScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { ExploreScreen } from '../screens/ExploreScreen';
import { CreatePostScreen } from '../screens/CreatePostScreen';
import { MessagesScreen } from '../screens/MessagesScreen';
import { CommunitiesScreen } from '../screens/CommunitiesScreen';
import { LearningScreen } from '../screens/LearningScreen';
import { VideoPlayerScreen } from '../screens/VideoPlayerScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { CareersScreen } from '../screens/CareersScreen';
import { AIAssistantScreen } from '../screens/AIAssistantScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { SettingsScreen } from '../screens/SettingsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#4f46e5',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: { height: 60, paddingBottom: 8, paddingTop: 6 },
        headerStyle: { backgroundColor: '#ffffff' },
        headerTitleStyle: { fontWeight: '800', fontSize: 16 },
      }}
    >
      <Tab.Screen
        name="Feed"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>🏠</Text>,
          headerTitle: 'EduConnect Feed',
        }}
      />
      <Tab.Screen
        name="Explore"
        component={ExploreScreen}
        options={{
          tabBarLabel: 'Explore',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>🔍</Text>,
          headerTitle: 'Discover Students',
        }}
      />
      <Tab.Screen
        name="Learn"
        component={LearningScreen}
        options={{
          tabBarLabel: 'Learn',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>📚</Text>,
          headerTitle: 'Learning Masterclasses',
        }}
      />
      <Tab.Screen
        name="Chat"
        component={MessagesScreen}
        options={{
          tabBarLabel: 'Chat',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>💬</Text>,
          headerTitle: 'Discussions',
        }}
      />
      <Tab.Screen
        name="AITutor"
        component={AIAssistantScreen}
        options={{
          tabBarLabel: 'AI Tutor',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>✨</Text>,
          headerTitle: 'AI Academic Assistant',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>👤</Text>,
          headerTitle: 'Academic Profile',
        }}
      />
    </Tab.Navigator>
  );
};

export const AppNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="MainTabs" component={TabNavigator} />
      <Stack.Screen name="CreatePost" component={CreatePostScreen} options={{ headerShown: true, title: 'New Post' }} />
      <Stack.Screen name="VideoPlayer" component={VideoPlayerScreen} options={{ headerShown: true, title: 'Lesson Player' }} />
      <Stack.Screen name="Communities" component={CommunitiesScreen} options={{ headerShown: true, title: 'Clubs & Societies' }} />
      <Stack.Screen name="Careers" component={CareersScreen} options={{ headerShown: true, title: 'Internships & Jobs' }} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ headerShown: true, title: 'Alerts' }} />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: true, title: 'Settings' }} />
    </Stack.Navigator>
  );
};
