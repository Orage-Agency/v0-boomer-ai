import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { BrandHeader } from '@/components/BrandHeader';
import { InfoBanner } from '@/components/InfoBanner';
import { conversationsApi } from '@/api';
import { getDeviceId } from '@/context/storage';
import { setPendingConversation } from '@/screens/pendingPrompt';
import { isApiConfigured } from '@/config/env';
import { colors, fontSize, fontWeight, radius, spacing } from '@/theme/theme';
import type { ConversationSummary } from '@/types';

/**
 * Conversation history. Lists every conversation saved for this device (the
 * chat auto-saves after each completed turn) and reopens any of them in the
 * Chat tab, where it continues exactly where it left off.
 */
export default function HistoryScreen() {
  const router = useRouter();
  const [items, setItems] = useState<ConversationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!isApiConfigured) {
      setLoading(false);
      return;
    }
    setError(null);
    try {
      const deviceId = await getDeviceId();
      const res = await conversationsApi.listConversations(deviceId);
      setItems(res.conversations ?? []);
    } catch {
      setError('Could not load your conversations. Pull down to try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    void load();
  }, [load]);

  const openConversation = useCallback(
    (item: ConversationSummary) => {
      setPendingConversation(item.id);
      router.push('/(tabs)/chat');
    },
    [router],
  );

  const confirmDelete = useCallback(
    (item: ConversationSummary) => {
      Alert.alert('Delete this conversation?', `"${item.title}" will be gone for good.`, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            void (async () => {
              try {
                await conversationsApi.deleteConversation(item.id);
                setItems((prev) => prev.filter((c) => c.id !== item.id));
              } catch {
                Alert.alert('Could not delete', 'Please try again.');
              }
            })();
          },
        },
      ]);
    },
    [],
  );

  const formatWhen = (iso: string): string => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return '';
    }
  };

  return (
    <Screen centered edges={['top', 'bottom']}>
      <BrandHeader title="My Conversations" onBack={() => router.back()} />

      {!isApiConfigured && (
        <View style={styles.bannerWrap}>
          <InfoBanner
            tone="warn"
            title="Server not connected"
            message="Set the API base URL in app.json to enable saved conversations."
          />
        </View>
      )}

      {error && (
        <View style={styles.bannerWrap}>
          <InfoBanner tone="danger" message={error} />
        </View>
      )}

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : items.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyEmoji}>💬</Text>
          <Text style={styles.emptyTitle}>No conversations yet</Text>
          <Text style={styles.emptySub}>
            Your chats are saved automatically. Start one and it will show up here.
          </Text>
          <Pressable
            onPress={() => router.push('/(tabs)/chat')}
            style={styles.startBtn}
            accessibilityRole="button"
            accessibilityLabel="Start chatting"
          >
            <Text style={styles.startText}>Start Chatting</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(c) => String(c.id)}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => openConversation(item)}
              style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
              accessibilityRole="button"
              accessibilityLabel={`Continue conversation: ${item.title}`}
            >
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle} numberOfLines={1}>
                  {item.title || 'Conversation'}
                </Text>
                {!!item.preview && (
                  <Text style={styles.cardPreview} numberOfLines={2}>
                    {item.preview}
                  </Text>
                )}
                <Text style={styles.cardMeta}>
                  {formatWhen(item.timestamp)} · {item.message_count} messages
                </Text>
              </View>
              <View style={styles.cardActions}>
                <Text style={styles.continueHint}>Continue ›</Text>
                <Pressable
                  onPress={() => confirmDelete(item)}
                  hitSlop={8}
                  style={styles.deleteBtn}
                  accessibilityRole="button"
                  accessibilityLabel={`Delete conversation ${item.title}`}
                >
                  <Ionicons name="trash-outline" size={18} color={colors.textSecondary} />
                </Pressable>
              </View>
            </Pressable>
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  bannerWrap: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.sm },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.black, color: colors.textPrimary },
  emptySub: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  startBtn: {
    marginTop: spacing.md,
    minHeight: 52,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startText: { color: colors.textOnDark, fontSize: fontSize.md, fontWeight: fontWeight.bold },
  list: { padding: spacing.lg, gap: spacing.md },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
    minHeight: 84,
  },
  cardPressed: { backgroundColor: colors.primarySoft, borderColor: colors.primary },
  cardBody: { flex: 1, gap: 2 },
  cardTitle: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.textPrimary },
  cardPreview: { fontSize: fontSize.sm, color: colors.textSecondary, lineHeight: 20 },
  cardMeta: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },
  cardActions: { alignItems: 'flex-end', gap: spacing.sm },
  continueHint: { fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.primary },
  deleteBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteText: { fontSize: 16 },
});
