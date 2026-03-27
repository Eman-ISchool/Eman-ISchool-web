/**
 * AdminTabNavigator
 * Bottom tab navigation for admin role
 * Tabs: Home, Students, Courses, Reports, Settings
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import type {
  AdminTabParamList,
  AdminHomeStackParamList,
  AdminStudentsStackParamList,
  AdminCoursesStackParamList,
} from './types';
import { getTabScreenOptions, getStackScreenOptions } from './tabBarConfig';
import { TabIcon } from '@/components/navigation/TabIcon';
import { createPlaceholderScreen } from '@/screens/shared/PlaceholderScreen';

// Screens - use placeholders until real screens are built
const AdminDashboardScreen = createPlaceholderScreen('Admin Dashboard', 'System overview and stats');
const AdminStudentListScreen = createPlaceholderScreen('Students', 'Manage student accounts');
const AdminStudentDetailScreen = createPlaceholderScreen('Student Detail', 'Student information');
const AdminCourseListScreen = createPlaceholderScreen('Courses', 'Manage all courses');
const AdminCourseDetailScreen = createPlaceholderScreen('Course Detail', 'Course management');
const AdminReportsScreen = createPlaceholderScreen('Reports', 'Analytics and reporting');
const AdminSettingsScreen = createPlaceholderScreen('Settings', 'System configuration');

const Tab = createBottomTabNavigator<AdminTabParamList>();
const HomeStack = createNativeStackNavigator<AdminHomeStackParamList>();
const StudentsStack = createNativeStackNavigator<AdminStudentsStackParamList>();
const CoursesStack = createNativeStackNavigator<AdminCoursesStackParamList>();

function AdminHomeStack() {
  return (
    <HomeStack.Navigator screenOptions={getStackScreenOptions()}>
      <HomeStack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
    </HomeStack.Navigator>
  );
}

function AdminStudentsStack() {
  return (
    <StudentsStack.Navigator screenOptions={getStackScreenOptions()}>
      <StudentsStack.Screen name="AdminStudentList" component={AdminStudentListScreen} />
      <StudentsStack.Screen name="AdminStudentDetail" component={AdminStudentDetailScreen} />
    </StudentsStack.Navigator>
  );
}

function AdminCoursesStack() {
  return (
    <CoursesStack.Navigator screenOptions={getStackScreenOptions()}>
      <CoursesStack.Screen name="AdminCourseList" component={AdminCourseListScreen} />
      <CoursesStack.Screen name="AdminCourseDetail" component={AdminCourseDetailScreen} />
    </CoursesStack.Navigator>
  );
}

export function AdminTabNavigator() {
  const { t } = useTranslation();
  const tabOptions = getTabScreenOptions();

  return (
    <Tab.Navigator screenOptions={tabOptions}>
      <Tab.Screen
        name="Home"
        component={AdminHomeStack}
        options={{
          tabBarLabel: t('tabs.home'),
          tabBarIcon: ({ color, size }) => <TabIcon name="home" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Students"
        component={AdminStudentsStack}
        options={{
          tabBarLabel: t('tabs.students', 'Students'),
          tabBarIcon: ({ color, size }) => <TabIcon name="students" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Courses"
        component={AdminCoursesStack}
        options={{
          tabBarLabel: t('tabs.courses'),
          tabBarIcon: ({ color, size }) => <TabIcon name="courses" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Reports"
        component={AdminReportsScreen}
        options={{
          tabBarLabel: t('tabs.reports', 'Reports'),
          tabBarIcon: ({ color, size }) => <TabIcon name="reports" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={AdminSettingsScreen}
        options={{
          tabBarLabel: t('tabs.settings', 'Settings'),
          tabBarIcon: ({ color, size }) => <TabIcon name="settings" color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
}

export default AdminTabNavigator;
