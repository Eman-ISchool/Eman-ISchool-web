/**
 * RootNavigator - Role-based navigation routing
 * Routes authenticated users to their role-specific tab navigator
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import type { RootStackParamList } from './types';
import { useAuthStore } from '@/store/authStore';
import { AuthNavigator } from './AuthNavigator';
import { StudentTabNavigator } from './StudentTabNavigator';
import { TeacherTabNavigator } from './TeacherTabNavigator';
import { ParentTabNavigator } from './ParentTabNavigator';
import { AdminTabNavigator } from './AdminTabNavigator';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { isAuthenticated, user } = useAuthStore();
  const role = user?.role;

  const getInitialRoute = (): keyof RootStackParamList => {
    if (!isAuthenticated) return 'Auth';
    switch (role) {
      case 'teacher': return 'TeacherMain';
      case 'parent': return 'ParentMain';
      case 'admin': return 'AdminMain';
      default: return 'StudentMain';
    }
  };

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName={getInitialRoute()}
      >
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : (
          <>
            {role === 'student' && (
              <Stack.Screen name="StudentMain" component={StudentTabNavigator} />
            )}
            {role === 'teacher' && (
              <Stack.Screen name="TeacherMain" component={TeacherTabNavigator} />
            )}
            {role === 'parent' && (
              <Stack.Screen name="ParentMain" component={ParentTabNavigator} />
            )}
            {role === 'admin' && (
              <Stack.Screen name="AdminMain" component={AdminTabNavigator} />
            )}
            {/* Fallback to student if role not set */}
            {!role && (
              <Stack.Screen name="StudentMain" component={StudentTabNavigator} />
            )}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default RootNavigator;
