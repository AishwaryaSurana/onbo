import { Tabs } from 'expo-router';
import { Text, type ColorValue } from 'react-native';

import { UI } from '@/theme';

function TabGlyph({ glyph, color }: { glyph: string; color: ColorValue }) {
  return <Text style={{ fontSize: 20, color }}>{glyph}</Text>;
}

export default function AppTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: UI.accent,
        tabBarInactiveTintColor: UI.textMuted,
        tabBarStyle: {
          backgroundColor: UI.bg,
          borderTopColor: UI.border,
        },
        sceneStyle: { backgroundColor: UI.bg },
      }}>
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <TabGlyph glyph="⌂" color={color} />,
        }}
      />
      <Tabs.Screen
        name="photos"
        options={{
          title: 'AI Photos',
          tabBarIcon: ({ color }) => <TabGlyph glyph="✦" color={color} />,
        }}
      />
      <Tabs.Screen
        name="editor"
        options={{
          title: 'AI Editor',
          tabBarIcon: ({ color }) => <TabGlyph glyph="✎" color={color} />,
        }}
      />
      <Tabs.Screen
        name="generations"
        options={{
          title: 'Generations',
          tabBarIcon: ({ color }) => <TabGlyph glyph="▦" color={color} />,
        }}
      />
    </Tabs>
  );
}
