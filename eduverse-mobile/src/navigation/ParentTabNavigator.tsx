/**
 * ParentTabNavigator component
 * Bottom tab navigation for parent screens
 */

import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { ParentTabParamList, ParentStackParamList } from './types';

const Tab = createBottomTabNavigator<ParentTabParamList>();
const Stack = createNativeStackNavigator<ParentStackParamList>();

function ParentStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="ParentHome"
        component={() => null}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ChildProgress"
        component={() => null}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ParentAnnouncements"
        component={() => null}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ParentProfile"
        component={() => null}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

export function ParentTabNavigator() {
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
        component={ParentStack}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: () => <Text style={{ fontSize: 24 }}>🏠</Text>,
        }}
      />
      <Tab.Screen
        name="Progress"
        component={() => null}
        options={{
          tabBarLabel: 'Progress',
          tabBarIcon: () => <Text style={{ fontSize: 24 }}>📊</Text>,
        }}
      />
      <Tab.Screen
        name="Announcements"
        component={() => null}
        options={{
          tabBarLabel: 'Announcements',
          tabBarIcon: () => <Text style={{ fontSize: 24 }}>📢</Text>,
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

export default ParentTabNavigator;
