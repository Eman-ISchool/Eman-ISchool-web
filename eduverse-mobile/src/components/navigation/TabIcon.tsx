/**
 * TabIcon component
 * Custom drawn icons using React Native View primitives
 * No external icon library dependency
 */

import React from 'react';
import { View, Text, I18nManager } from 'react-native';

export type TabIconName =
  | 'home'
  | 'courses'
  | 'calendar'
  | 'reels'
  | 'profile'
  | 'assessments'
  | 'invoices'
  | 'support'
  | 'students'
  | 'reports'
  | 'settings';

interface TabIconProps {
  name: TabIconName;
  color: string;
  size?: number;
}

function HomeIcon({ color, size }: { color: string; size: number }) {
  const u = size / 24;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: 0, height: 0, borderLeftWidth: 10 * u, borderRightWidth: 10 * u, borderBottomWidth: 8 * u, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: color, marginBottom: -1 }} />
      <View style={{ width: 16 * u, height: 10 * u, backgroundColor: color, borderBottomLeftRadius: 2 * u, borderBottomRightRadius: 2 * u }} />
    </View>
  );
}

function CoursesIcon({ color, size }: { color: string; size: number }) {
  const u = size / 24;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: 16 * u, height: 4 * u, backgroundColor: color, borderRadius: u, marginBottom: 2 * u, opacity: 0.6 }} />
      <View style={{ width: 18 * u, height: 4 * u, backgroundColor: color, borderRadius: u, marginBottom: 2 * u, opacity: 0.8 }} />
      <View style={{ width: 14 * u, height: 4 * u, backgroundColor: color, borderRadius: u }} />
    </View>
  );
}

function CalendarIcon({ color, size }: { color: string; size: number }) {
  const u = size / 24;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: 18 * u, height: 5 * u, backgroundColor: color, borderTopLeftRadius: 2 * u, borderTopRightRadius: 2 * u }} />
      <View style={{ width: 18 * u, height: 12 * u, borderWidth: 2 * u, borderTopWidth: 0, borderColor: color, borderBottomLeftRadius: 2 * u, borderBottomRightRadius: 2 * u }} />
    </View>
  );
}

function ReelsIcon({ color, size }: { color: string; size: number }) {
  const u = size / 24;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: 20 * u, height: 20 * u, borderRadius: 10 * u, borderWidth: 2 * u, borderColor: color, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ width: 0, height: 0, marginLeft: 2 * u, borderLeftWidth: 8 * u, borderTopWidth: 5 * u, borderBottomWidth: 5 * u, borderLeftColor: color, borderTopColor: 'transparent', borderBottomColor: 'transparent' }} />
      </View>
    </View>
  );
}

function ProfileIcon({ color, size }: { color: string; size: number }) {
  const u = size / 24;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: 8 * u, height: 8 * u, borderRadius: 4 * u, backgroundColor: color, marginBottom: 2 * u }} />
      <View style={{ width: 16 * u, height: 8 * u, backgroundColor: color, borderTopLeftRadius: 8 * u, borderTopRightRadius: 8 * u }} />
    </View>
  );
}

function AssessmentsIcon({ color, size }: { color: string; size: number }) {
  const u = size / 24;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: 16 * u, height: 19 * u, borderWidth: 2 * u, borderColor: color, borderRadius: 2 * u, padding: 2 * u, justifyContent: 'space-evenly' }}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={{ width: '100%', height: 2 * u, backgroundColor: color, borderRadius: u, opacity: i === 0 ? 1 : 0.5 }} />
        ))}
      </View>
    </View>
  );
}

function InvoicesIcon({ color, size }: { color: string; size: number }) {
  const u = size / 24;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: 16 * u, height: 20 * u, borderWidth: 2 * u, borderColor: color, borderRadius: 2 * u, padding: 2 * u, justifyContent: 'space-evenly' }}>
        {[0, 1, 2, 3].map((i) => (
          <View key={i} style={{ width: i % 2 === 0 ? '100%' : '60%', height: 1.5 * u, backgroundColor: color, borderRadius: 0.5 * u, opacity: 0.6 }} />
        ))}
      </View>
    </View>
  );
}

function SupportIcon({ color, size }: { color: string; size: number }) {
  const u = size / 24;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: 20 * u, height: 16 * u, borderWidth: 2 * u, borderColor: color, borderRadius: 8 * u, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 8 * u, color, fontWeight: '700' }}>?</Text>
      </View>
    </View>
  );
}

function StudentsIcon({ color, size }: { color: string; size: number }) {
  const u = size / 24;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' }}>
      <View style={{ alignItems: 'center', marginRight: -3 * u }}>
        <View style={{ width: 6 * u, height: 6 * u, borderRadius: 3 * u, backgroundColor: color, opacity: 0.6, marginBottom: u }} />
        <View style={{ width: 10 * u, height: 6 * u, backgroundColor: color, opacity: 0.6, borderTopLeftRadius: 5 * u, borderTopRightRadius: 5 * u }} />
      </View>
      <View style={{ alignItems: 'center', marginLeft: -3 * u }}>
        <View style={{ width: 7 * u, height: 7 * u, borderRadius: 3.5 * u, backgroundColor: color, marginBottom: u }} />
        <View style={{ width: 12 * u, height: 7 * u, backgroundColor: color, borderTopLeftRadius: 6 * u, borderTopRightRadius: 6 * u }} />
      </View>
    </View>
  );
}

function ReportsIcon({ color, size }: { color: string; size: number }) {
  const u = size / 24;
  return (
    <View style={{ width: size, height: size, alignItems: 'flex-end', justifyContent: 'flex-end', flexDirection: 'row', paddingBottom: 3 * u, paddingHorizontal: 2 * u }}>
      {[6, 14, 10, 18].map((h, i) => (
        <View key={i} style={{ width: 3.5 * u, height: h * u, backgroundColor: color, borderTopLeftRadius: u, borderTopRightRadius: u, marginHorizontal: 0.5 * u, opacity: 0.6 + i * 0.13 }} />
      ))}
    </View>
  );
}

function SettingsIcon({ color, size }: { color: string; size: number }) {
  const u = size / 24;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: 18 * u, height: 18 * u, borderRadius: 9 * u, borderWidth: 3 * u, borderColor: color, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ width: 6 * u, height: 6 * u, borderRadius: 3 * u, backgroundColor: color }} />
      </View>
    </View>
  );
}

const ICON_COMPONENTS: Record<TabIconName, React.FC<{ color: string; size: number }>> = {
  home: HomeIcon,
  courses: CoursesIcon,
  calendar: CalendarIcon,
  reels: ReelsIcon,
  profile: ProfileIcon,
  assessments: AssessmentsIcon,
  invoices: InvoicesIcon,
  support: SupportIcon,
  students: StudentsIcon,
  reports: ReportsIcon,
  settings: SettingsIcon,
};

export function TabIcon({ name, color, size = 24 }: TabIconProps) {
  const IconComponent = ICON_COMPONENTS[name];
  if (IconComponent) {
    return <IconComponent color={color} size={size} />;
  }
  return <Text style={{ fontSize: size * 0.8, color, textAlign: 'center' }}>?</Text>;
}

export default TabIcon;
