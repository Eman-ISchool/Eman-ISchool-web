/**
 * StudentTabNavigator component
 * Bottom tab navigation for student screens
 */

import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { StudentTabParamList, StudentStackParamList } from './types';
import { StudentHomeScreen } from '@/screens/student/StudentHomeScreen';
import { StudentReelsScreen } from '@/screens/student/StudentReelsScreen';
import { ReelDetailScreen } from '@/screens/student/ReelDetailScreen';
import { StudentCalendarScreen } from '@/screens/student/StudentCalendarScreen';
import { StudentProfileScreen } from '@/screens/student/StudentProfileScreen';

const Tab = createBottomTabNavigator<StudentTabParamList>();
const Stack = createNativeStackNavigator<StudentStackParamList>();

// Simple Icon component for tab icons
function TabIcon({ emoji }: { emoji: string }) {
  return <Text style={{ fontSize: 24 }}>{emoji}</Text>;
}

function StudentStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="StudentHome"
        component={StudentHomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="StudentReels"
        component={StudentReelsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ReelDetail"
        component={ReelDetailScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="StudentCalendar"
        component={StudentCalendarScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="StudentProfile"
        component={StudentProfileScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

export function StudentTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#0D9488',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={StudentStack}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: () => <TabIcon emoji="🏠" />,
        }}
      />
      <Tab.Screen
        name="Reels"
        component={StudentReelsScreen}
        options={{
          tabBarLabel: 'Reels',
          tabBarIcon: () => <TabIcon emoji="📹" />,
        }}
      />
      <Tab.Screen
        name="Calendar"
        component={StudentCalendarScreen}
        options={{
          tabBarLabel: 'Calendar',
          tabBarIcon: () => <TabIcon emoji="📅" />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={StudentProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: () => <TabIcon emoji="👤" />,
        }}
      />
    </Tab.Navigator>
  );
}

export default StudentTabNavigator;
