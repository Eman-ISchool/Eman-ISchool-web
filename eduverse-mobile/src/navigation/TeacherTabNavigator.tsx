/**
 * TeacherTabNavigator
 * Bottom tab navigation for teacher role
 * Tabs: Home, Courses, Calendar, Assessments, Profile
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import type {
  TeacherTabParamList,
  TeacherHomeStackParamList,
  TeacherCoursesStackParamList,
  TeacherAssessmentsStackParamList,
} from './types';
import { getTabScreenOptions, getStackScreenOptions } from './tabBarConfig';
import { TabIcon } from '@/components/navigation/TabIcon';
import { createPlaceholderScreen } from '@/screens/shared/PlaceholderScreen';

// Import real screens where available
import { TeacherHomeScreen } from '@/screens/teacher/TeacherHomeScreen';
import { TeacherCoursesScreen } from '@/screens/teacher/TeacherCoursesScreen';
import { CreateCourseScreen } from '@/screens/teacher/CreateCourseScreen';

// Placeholder screens for flows not yet fully implemented
const CourseDetailScreen = createPlaceholderScreen('Course Detail', 'Course management & lessons');
const LessonDetailScreen = createPlaceholderScreen('Lesson Detail', 'Lesson content & attendance');
const CreateLessonScreen = createPlaceholderScreen('Create Lesson', 'Schedule a new lesson');
const ManageAttendanceScreen = createPlaceholderScreen('Attendance', 'Mark student attendance');
const TeacherCalendarScreen = createPlaceholderScreen('Calendar', 'Your teaching schedule');
const AssessmentListScreen = createPlaceholderScreen('Assessments', 'Manage assessments');
const AssessmentDetailScreen = createPlaceholderScreen('Assessment Detail', 'Assessment results');
const SubmissionReviewScreen = createPlaceholderScreen('Submission', 'Review student submission');
const TeacherProfileScreen = createPlaceholderScreen('Profile', 'Your teacher profile');

const Tab = createBottomTabNavigator<TeacherTabParamList>();
const HomeStack = createNativeStackNavigator<TeacherHomeStackParamList>();
const CoursesStack = createNativeStackNavigator<TeacherCoursesStackParamList>();
const AssessmentsStack = createNativeStackNavigator<TeacherAssessmentsStackParamList>();

function TeacherHomeStack() {
  return (
    <HomeStack.Navigator screenOptions={getStackScreenOptions()}>
      <HomeStack.Screen name="TeacherHome" component={TeacherHomeScreen} />
      <HomeStack.Screen name="CourseDetail" component={CourseDetailScreen} />
    </HomeStack.Navigator>
  );
}

function TeacherCoursesStack() {
  return (
    <CoursesStack.Navigator screenOptions={getStackScreenOptions()}>
      <CoursesStack.Screen name="TeacherCoursesList" component={TeacherCoursesScreen} />
      <CoursesStack.Screen name="CourseDetail" component={CourseDetailScreen} />
      <CoursesStack.Screen name="LessonDetail" component={LessonDetailScreen} />
      <CoursesStack.Screen name="CreateLesson" component={CreateLessonScreen} />
      <CoursesStack.Screen name="ManageAttendance" component={ManageAttendanceScreen} />
    </CoursesStack.Navigator>
  );
}

function TeacherAssessmentsStack() {
  return (
    <AssessmentsStack.Navigator screenOptions={getStackScreenOptions()}>
      <AssessmentsStack.Screen name="AssessmentList" component={AssessmentListScreen} />
      <AssessmentsStack.Screen name="AssessmentDetail" component={AssessmentDetailScreen} />
      <AssessmentsStack.Screen name="SubmissionReview" component={SubmissionReviewScreen} />
    </AssessmentsStack.Navigator>
  );
}

export function TeacherTabNavigator() {
  const { t } = useTranslation();
  const tabOptions = getTabScreenOptions();

  return (
    <Tab.Navigator screenOptions={tabOptions}>
      <Tab.Screen
        name="Home"
        component={TeacherHomeStack}
        options={{
          tabBarLabel: t('tabs.home'),
          tabBarIcon: ({ color, size }) => <TabIcon name="home" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Courses"
        component={TeacherCoursesStack}
        options={{
          tabBarLabel: t('tabs.courses'),
          tabBarIcon: ({ color, size }) => <TabIcon name="courses" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Calendar"
        component={TeacherCalendarScreen}
        options={{
          tabBarLabel: t('tabs.calendar'),
          tabBarIcon: ({ color, size }) => <TabIcon name="calendar" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Assessments"
        component={TeacherAssessmentsStack}
        options={{
          tabBarLabel: t('tabs.assessments', 'Assessments'),
          tabBarIcon: ({ color, size }) => <TabIcon name="assessments" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={TeacherProfileScreen}
        options={{
          tabBarLabel: t('tabs.profile'),
          tabBarIcon: ({ color, size }) => <TabIcon name="profile" color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
}

export default TeacherTabNavigator;
