/**
 * StudentTabNavigator component
 * Bottom tab navigation for student role with per-tab stack navigators
 * Tabs: Home, Courses, Calendar, Reels, Profile
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import type {
  StudentTabParamList,
  StudentHomeStackParamList,
  StudentCoursesStackParamList,
  StudentReelsStackParamList,
} from './types';
import { getTabScreenOptions, getStackScreenOptions } from './tabBarConfig';
import { TabIcon } from '@/components/navigation/TabIcon';

// Existing screens
import { StudentHomeScreen } from '@/screens/student/StudentHomeScreen';
import { StudentReelsScreen } from '@/screens/student/StudentReelsScreen';
import { ReelDetailScreen } from '@/screens/student/ReelDetailScreen';
import { StudentCalendarScreen } from '@/screens/student/StudentCalendarScreen';
import { StudentProfileScreen } from '@/screens/student/StudentProfileScreen';

// Placeholder screens for not-yet-implemented flows
import { createPlaceholderScreen } from '@/screens/shared/PlaceholderScreen';

const CoursesListScreen = createPlaceholderScreen('Courses', 'Browse your enrolled courses');
const CourseDetailScreen = createPlaceholderScreen('Course Detail', 'Course details and lessons');
const LessonDetailScreen = createPlaceholderScreen('Lesson Detail', 'Lesson content and materials');
const AssessmentTakeScreen = createPlaceholderScreen('Assessment', 'Take your assessment');

// Tab and stack navigators
const Tab = createBottomTabNavigator<StudentTabParamList>();
const HomeStack = createNativeStackNavigator<StudentHomeStackParamList>();
const CoursesStack = createNativeStackNavigator<StudentCoursesStackParamList>();
const ReelsStack = createNativeStackNavigator<StudentReelsStackParamList>();

// ── Home Tab Stack ─────────────────────────────────────────────
function StudentHomeStack() {
  const stackOptions = getStackScreenOptions();
  return (
    <HomeStack.Navigator screenOptions={stackOptions}>
      <HomeStack.Screen name="StudentHome" component={StudentHomeScreen} />
      <HomeStack.Screen name="CourseDetail" component={CourseDetailScreen} />
      <HomeStack.Screen name="LessonDetail" component={LessonDetailScreen} />
      <HomeStack.Screen name="AssessmentTake" component={AssessmentTakeScreen} />
    </HomeStack.Navigator>
  );
}

// ── Courses Tab Stack ──────────────────────────────────────────
function StudentCoursesStack() {
  const stackOptions = getStackScreenOptions();
  return (
    <CoursesStack.Navigator screenOptions={stackOptions}>
      <CoursesStack.Screen name="CoursesList" component={CoursesListScreen} />
      <CoursesStack.Screen name="CourseDetail" component={CourseDetailScreen} />
      <CoursesStack.Screen name="LessonDetail" component={LessonDetailScreen} />
    </CoursesStack.Navigator>
  );
}

// ── Reels Tab Stack ────────────────────────────────────────────
function StudentReelsStack() {
  const stackOptions = getStackScreenOptions();
  return (
    <ReelsStack.Navigator screenOptions={stackOptions}>
      <ReelsStack.Screen name="StudentReels" component={StudentReelsScreen} />
      <ReelsStack.Screen name="ReelDetail" component={ReelDetailScreen} />
    </ReelsStack.Navigator>
  );
}

// ── Main Student Tab Navigator ─────────────────────────────────
export function StudentTabNavigator() {
  const { t } = useTranslation();
  const tabOptions = getTabScreenOptions();

  return (
    <Tab.Navigator screenOptions={tabOptions}>
      <Tab.Screen
        name="Home"
        component={StudentHomeStack}
        options={{
          tabBarLabel: t('tabs.home'),
          tabBarIcon: ({ color, size }) => <TabIcon name="home" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Courses"
        component={StudentCoursesStack}
        options={{
          tabBarLabel: t('tabs.courses'),
          tabBarIcon: ({ color, size }) => <TabIcon name="courses" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Calendar"
        component={StudentCalendarScreen}
        options={{
          tabBarLabel: t('tabs.calendar'),
          tabBarIcon: ({ color, size }) => <TabIcon name="calendar" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Reels"
        component={StudentReelsStack}
        options={{
          tabBarLabel: t('tabs.reels'),
          tabBarIcon: ({ color, size }) => <TabIcon name="reels" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={StudentProfileScreen}
        options={{
          tabBarLabel: t('tabs.profile'),
          tabBarIcon: ({ color, size }) => <TabIcon name="profile" color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
}

export default StudentTabNavigator;
