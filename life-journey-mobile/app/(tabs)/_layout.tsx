import React from 'react';
import { Platform } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Tabs } from 'expo-router';
import { lightTheme } from '@/lib/theme';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  color: string;
}) {
  return (
    <MaterialCommunityIcons
      size={26}
      style={{ marginBottom: Platform.OS === 'ios' ? -2 : 0 }}
      {...props}
    />
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: lightTheme.colors.primary,
        tabBarInactiveTintColor: lightTheme.colors.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: lightTheme.colors.surface,
          borderTopColor: lightTheme.colors.outlineVariant,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 85 : 65,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 20 : 8,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
        headerStyle: {
          backgroundColor: lightTheme.colors.surface,
          elevation: 2,
        },
        headerTintColor: lightTheme.colors.onSurface,
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 20,
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Overzicht',
          headerTitle: 'Dashboard',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'view-dashboard' : 'view-dashboard-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="chapters"
        options={{
          title: 'Verhaal',
          headerTitle: 'Mijn Levensverhaal',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'book-open-page-variant' : 'book-open-page-variant-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="timeline"
        options={{
          title: 'Tijdlijn',
          headerTitle: 'Mijn Levensreis',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'timeline-text' : 'timeline-text-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="record/[chapterId]"
        options={{
          href: null, // Hide from tab bar
          headerTitle: 'Opnemen',
        }}
      />
    </Tabs>
  );
}
