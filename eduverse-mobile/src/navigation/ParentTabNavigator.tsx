/**
 * ParentTabNavigator
 * Bottom tab navigation for parent role
 * Tabs: Home, Courses, Invoices, Support, Profile
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import type {
  ParentTabParamList,
  ParentHomeStackParamList,
  ParentCoursesStackParamList,
  ParentSupportStackParamList,
} from './types';
import { getTabScreenOptions, getStackScreenOptions } from './tabBarConfig';
import { TabIcon } from '@/components/navigation/TabIcon';
import { createPlaceholderScreen } from '@/screens/shared/PlaceholderScreen';

// Placeholder screens
const ParentHomeScreen = createPlaceholderScreen('Home', 'Children overview & activity');
const ChildProgressScreen = createPlaceholderScreen('Child Progress', 'Detailed progress tracking');
const ParentCoursesListScreen = createPlaceholderScreen('Courses', "Children's enrolled courses");
const CourseDetailScreen = createPlaceholderScreen('Course Detail', 'Course information');
const ParentInvoicesScreen = createPlaceholderScreen('Invoices', 'Payment history & invoices');
const TicketListScreen = createPlaceholderScreen('Support', 'Support tickets');
const TicketDetailScreen = createPlaceholderScreen('Ticket Detail', 'Ticket conversation');
const CreateTicketScreen = createPlaceholderScreen('New Ticket', 'Create support ticket');
const ParentProfileScreen = createPlaceholderScreen('Profile', 'Your profile & settings');

const Tab = createBottomTabNavigator<ParentTabParamList>();
const HomeStack = createNativeStackNavigator<ParentHomeStackParamList>();
const CoursesStack = createNativeStackNavigator<ParentCoursesStackParamList>();
const SupportStack = createNativeStackNavigator<ParentSupportStackParamList>();

function ParentHomeStack() {
  return (
    <HomeStack.Navigator screenOptions={getStackScreenOptions()}>
      <HomeStack.Screen name="ParentHome" component={ParentHomeScreen} />
      <HomeStack.Screen name="ChildProgress" component={ChildProgressScreen} />
    </HomeStack.Navigator>
  );
}

function ParentCoursesStack() {
  return (
    <CoursesStack.Navigator screenOptions={getStackScreenOptions()}>
      <CoursesStack.Screen name="ParentCoursesList" component={ParentCoursesListScreen} />
      <CoursesStack.Screen name="CourseDetail" component={CourseDetailScreen} />
    </CoursesStack.Navigator>
  );
}

function ParentSupportStack() {
  return (
    <SupportStack.Navigator screenOptions={getStackScreenOptions()}>
      <SupportStack.Screen name="TicketList" component={TicketListScreen} />
      <SupportStack.Screen name="TicketDetail" component={TicketDetailScreen} />
      <SupportStack.Screen name="CreateTicket" component={CreateTicketScreen} />
    </SupportStack.Navigator>
  );
}

export function ParentTabNavigator() {
  const { t } = useTranslation();
  const tabOptions = getTabScreenOptions();

  return (
    <Tab.Navigator screenOptions={tabOptions}>
      <Tab.Screen
        name="Home"
        component={ParentHomeStack}
        options={{
          tabBarLabel: t('tabs.home'),
          tabBarIcon: ({ color, size }) => <TabIcon name="home" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Courses"
        component={ParentCoursesStack}
        options={{
          tabBarLabel: t('tabs.courses'),
          tabBarIcon: ({ color, size }) => <TabIcon name="courses" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Invoices"
        component={ParentInvoicesScreen}
        options={{
          tabBarLabel: t('tabs.invoices', 'Invoices'),
          tabBarIcon: ({ color, size }) => <TabIcon name="invoices" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Support"
        component={ParentSupportStack}
        options={{
          tabBarLabel: t('tabs.support', 'Support'),
          tabBarIcon: ({ color, size }) => <TabIcon name="support" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ParentProfileScreen}
        options={{
          tabBarLabel: t('tabs.profile'),
          tabBarIcon: ({ color, size }) => <TabIcon name="profile" color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
}

export default ParentTabNavigator;
