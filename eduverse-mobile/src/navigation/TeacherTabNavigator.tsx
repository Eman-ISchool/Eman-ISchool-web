/**
 * TeacherTabNavigator component
 * Bottom tab navigation for teacher screens
 */

import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { TeacherTabParamList, TeacherStackParamList } from './types';

const Tab = createBottomTabNavigator<TeacherTabParamList>();
const Stack = createNativeStackNavigator<TeacherStackParamList>();

function TeacherStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="TeacherHome"
        component={() => null}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="TeacherClasses"
        component={() => null}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ClassDetail"
        component={() => null}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="TeacherAttendance"
        component={() => null}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="TeacherSubmissions"
        component={() => null}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="TeacherProfile"
        component={() => null}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

export function TeacherTabNavigator() {
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
        component={TeacherStack}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: () => <Text style={{ fontSize: 24 }}>🏠</Text>,
        }}
      />
      <Tab.Screen
        name="Classes"
        component={() => null}
        options={{
          tabBarLabel: 'Classes',
          tabBarIcon: () => <Text style={{ fontSize: 24 }}>📚</Text>,
        }}
      />
      <Tab.Screen
        name="Attendance"
        component={() => null}
        options={{
          tabBarLabel: 'Attendance',
          tabBarIcon: () => <Text style={{ fontSize: 24 }}>📊</Text>,
        }}
      />
      <Tab.Screen
        name="Submissions"
        component={() => null}
        options={{
          tabBarLabel: 'Submissions',
          tabBarIcon: () => <Text style={{ fontSize: 24 }}>📝</Text>,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={() => null}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: () => <Text style={{ fontSize: 24 }}>👤</Text>,
        }}
      />
    </Tab.Navigator>
  );
}

export default TeacherTabNavigator;
