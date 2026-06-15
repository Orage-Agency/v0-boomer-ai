import React from 'react';
import { Text, View } from 'react-native';
import { Tabs } from 'expo-router';
import { BottomTabBar, type BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { GlobalChatBar } from '@/components/GlobalChatBar';
import { colors, fontSize, fontWeight } from '@/theme/theme';

/**
 * Bottom tab navigator. Mirrors the web app's bottom nav:
 * Home · Chat · Learn · Tips · Profile.
 * Emoji icons keep the foundation dependency-free (swap for vector icons later).
 *
 * A persistent "chat from anywhere" bar is stacked above the tab icons on every
 * screen except the Chat tab itself (which already has its own input).
 */
function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return (
    <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>
  );
}

function TabBarWithChat(props: BottomTabBarProps) {
  const route = props.state.routes[props.state.index];
  const onChatTab = route?.name === 'chat';
  return (
    <View>
      {!onChatTab && <GlobalChatBar />}
      <BottomTabBar {...props} />
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <TabBarWithChat {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          borderTopColor: colors.border,
          height: 64,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: fontSize.xs,
          fontWeight: fontWeight.semibold,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ focused }) => <TabIcon emoji="💬" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="lessons"
        options={{
          title: 'Learn',
          tabBarIcon: ({ focused }) => <TabIcon emoji="📚" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="tips"
        options={{
          title: 'Tips',
          tabBarIcon: ({ focused }) => <TabIcon emoji="💡" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => <TabIcon emoji="👤" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
