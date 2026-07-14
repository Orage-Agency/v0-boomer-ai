import React from 'react';
import { View } from 'react-native';
import { Tabs } from 'expo-router';
import { BottomTabBar, type BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { GlobalChatBar } from '@/components/GlobalChatBar';
import { colors, fontSize, fontWeight } from '@/theme/theme';

/**
 * Bottom tab navigator. Mirrors the web app's bottom nav:
 * Home · Chat · Learn · Tips · Profile — proper vector icons (filled when
 * active, outline when not), tinted by the navigator.
 *
 * A persistent "chat from anywhere" bar is stacked above the tab icons on every
 * screen except the Chat tab itself (which already has its own input).
 */
type IoniconName = keyof typeof Ionicons.glyphMap;

function TabIcon({
  name,
  outline,
  focused,
  color,
}: {
  name: IoniconName;
  outline: IoniconName;
  focused: boolean;
  color: string;
}) {
  return <Ionicons name={focused ? name : outline} size={24} color={color} />;
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
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name="home" outline="home-outline" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              name="chatbubble"
              outline="chatbubble-outline"
              focused={focused}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="lessons"
        options={{
          title: 'Learn',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name="book" outline="book-outline" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="tips"
        options={{
          title: 'Tips',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name="bulb" outline="bulb-outline" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name="person" outline="person-outline" focused={focused} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
