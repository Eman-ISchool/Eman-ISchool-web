/**
 * Shared tab bar configuration
 * Consistent styling and behavior across all role-based tab navigators
 */

import { I18nManager, Platform } from 'react-native';

/** Active tint color matching the brand primary */
export const TAB_ACTIVE_COLOR = '#0D9488';

/** Inactive tint color for unfocused tabs */
export const TAB_INACTIVE_COLOR = '#9CA3AF';

/** Common screen options for all tab navigators */
export function getTabScreenOptions() {
  return {
    headerShown: false as const,
    tabBarActiveTintColor: TAB_ACTIVE_COLOR,
    tabBarInactiveTintColor: TAB_INACTIVE_COLOR,
    tabBarStyle: {
      backgroundColor: '#FFFFFF',
      borderTopWidth: 1,
      borderTopColor: '#E5E7EB',
      height: Platform.OS === 'ios' ? 84 : 64,
      paddingBottom: Platform.OS === 'ios' ? 24 : 8,
      paddingTop: 8,
      // RTL: tab bar direction is handled automatically by React Navigation
    },
    tabBarLabelStyle: {
      fontSize: 11,
      fontWeight: '600' as const,
      marginTop: 2,
    },
    tabBarIconStyle: {
      marginBottom: -2,
    },
  };
}

/** Common screen options for stack navigators inside tabs */
export function getStackScreenOptions() {
  return {
    headerShown: false as const,
    animation: 'slide_from_right' as const,
    // RTL: flip slide direction
    ...(I18nManager.isRTL ? { animation: 'slide_from_left' as const } : {}),
  };
}
