import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { BrandHeader } from '@/components/BrandHeader';
import { Button } from '@/components/Button';
import { InfoBanner } from '@/components/InfoBanner';
import { MicButton } from '@/components/MicButton';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { imagesApi, ApiError } from '@/api';
import { useProfile } from '@/context/ProfileContext';
import { isApiConfigured } from '@/config/env';
import { colors, fontSize, fontWeight, gradients, radius, spacing } from '@/theme/theme';
import { LinearGradient } from 'expo-linear-gradient';

/**
 * AI Art / Image generation screen.
 *
 * Wraps the existing images API client (`/api/generate-image` +
 * `/api/improve-prompt`). Mirrors the web `ai-art-tab.tsx`:
 *  - prompt input (typed or DICTATED via the mic) + quick idea chips + styles
 *  - "Improve" enhances the prompt via /api/improve-prompt
 *  - "Create Image" generates and shows the result
 *  - result actions: Save / Share (real buttons — long-press-to-save is a web
 *    behavior that does nothing in a native <Image>)
 * Awards +1 star on a successful generation (matches web reward logic).
 */

const STYLE_PRESETS = [
  { id: 'realistic', label: 'Real', emoji: '📷' },
  { id: 'artistic', label: 'Art', emoji: '🎨' },
  { id: 'cartoon', label: 'Toon', emoji: '🎪' },
  { id: 'vintage', label: 'Retro', emoji: '📻' },
] as const;

const PROMPT_IDEAS = [
  'Cozy cottage',
  'Sunset lake',
  'Friendly dog',
  'Vintage car',
  'Spring flowers',
  'Mountain view',
];

export default function ImageGenScreen() {
  const router = useRouter();
  const { profile, updateProfile } = useProfile();

  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState<string>('realistic');
  const [generating, setGenerating] = useState(false);
  const [improving, setImproving] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);
  const [shareNote, setShareNote] = useState<string | null>(null);

  const canGenerate = !!prompt.trim() && !generating && isApiConfigured;

  // Dictate the description instead of typing it.
  const voice = useVoiceInput({
    onTranscript: (text) => {
      setPrompt((prev) => (prev.trim() ? `${prev.trim()} ${text}` : text));
    },
  });

  const handleImprove = useCallback(async () => {
    const base = prompt.trim();
    if (!base || improving || !isApiConfigured) return;
    setImproving(true);
    setError(null);
    try {
      const res = await imagesApi.improvePrompt(base);
      if (res.improvedPrompt) {
        setPrompt(res.improvedPrompt.trim());
      } else if (res.error) {
        setError(res.error);
      }
    } catch (e) {
      setError(
        e instanceof ApiError ? e.message : 'Could not improve the prompt. Try again.',
      );
    } finally {
      setImproving(false);
    }
  }, [prompt, improving]);

  const handleGenerate = useCallback(async () => {
    const base = prompt.trim();
    if (!base) return;
    setGenerating(true);
    setError(null);
    setImageUrl(null);
    setShareNote(null);
    try {
      const fullPrompt = `${base}, ${style} style, high quality, beautiful lighting`;
      const res = await imagesApi.generateImage(fullPrompt);
      if (res.imageUrl) {
        setImageUrl(res.imageUrl);
        updateProfile({ stars: profile.stars + 1 });
      } else {
        setError(res.error ?? 'Could not create the image. Please try again.');
      }
    } catch (e) {
      if (e instanceof ApiError) {
        setError(e.message);
      } else {
        setError('Connection error. Please check your internet and try again.');
      }
    } finally {
      setGenerating(false);
    }
  }, [prompt, style, profile.stars, updateProfile]);

  const handleNewImage = useCallback(() => {
    setImageUrl(null);
    setError(null);
    setShareNote(null);
  }, []);

  /**
   * Save / Share the generated artwork. Downloads the remote image to the app
   * cache, then opens the iOS share sheet — which includes "Save Image" (to
   * Photos), Messages, Mail, etc. One flow covers both saving and sharing
   * without needing extra photo-library write permissions.
   */
  const handleShare = useCallback(async () => {
    if (!imageUrl || sharing) return;
    setSharing(true);
    setShareNote(null);
    try {
      const target = `${FileSystem.cacheDirectory}boomer-art-${Date.now()}.jpg`;
      const dl = await FileSystem.downloadAsync(imageUrl, target);
      await Share.share(
        Platform.OS === 'ios'
          ? { url: dl.uri }
          : { message: imageUrl },
      );
    } catch {
      setShareNote('Could not open sharing. Please try again.');
    } finally {
      setSharing(false);
    }
  }, [imageUrl, sharing]);

  return (
    <Screen centered edges={['top', 'bottom']}>
      <BrandHeader title="Create AI Art" onBack={() => router.back()} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={20}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {!isApiConfigured && (
            <InfoBanner
              tone="warn"
              title="Server not connected"
              message="Set the API base URL in app.json to enable image creation."
            />
          )}

          {imageUrl ? (
            <View style={styles.resultWrap}>
              <Image
                source={{ uri: imageUrl }}
                style={styles.resultImage}
                resizeMode="cover"
                accessibilityLabel="Your generated AI artwork"
              />
              <Button
                title={sharing ? 'Opening…' : '💾 Save or Share'}
                onPress={handleShare}
                disabled={sharing}
                variant="primary"
              />
              {shareNote && <InfoBanner tone="danger" message={shareNote} />}
              <Button title="🪄 Create Another" onPress={handleNewImage} variant="secondary" />
            </View>
          ) : (
            <View style={styles.form}>
              <Text style={styles.label}>Describe your image</Text>
              <View style={styles.promptRow}>
                <TextInput
                  style={styles.input}
                  value={prompt}
                  onChangeText={(t) => {
                    setPrompt(t);
                    if (voice.error) voice.clearError();
                  }}
                  placeholder="A beautiful sunset over a calm lake…"
                  placeholderTextColor={colors.textMuted}
                  multiline
                  editable={!generating && voice.state !== 'recording'}
                  accessibilityLabel="Image description"
                />
                <MicButton
                  state={voice.state}
                  onPress={voice.toggle}
                  disabled={generating}
                />
              </View>
              {voice.state === 'recording' && (
                <InfoBanner
                  tone="info"
                  message="Listening… describe your picture, then tap the square button."
                />
              )}
              {voice.error && <InfoBanner tone="danger" message={voice.error} />}

              <Pressable
                onPress={handleImprove}
                disabled={!prompt.trim() || improving || !isApiConfigured}
                style={[
                  styles.improveBtn,
                  (!prompt.trim() || improving || !isApiConfigured) && styles.improveDisabled,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Improve my description with AI"
              >
                {improving ? (
                  <ActivityIndicator color={colors.purple} />
                ) : (
                  <Text style={styles.improveText}>✨ Improve my description</Text>
                )}
              </Pressable>

              <Text style={styles.label}>Quick ideas</Text>
              <View style={styles.chips}>
                {PROMPT_IDEAS.map((idea) => (
                  <Pressable
                    key={idea}
                    onPress={() => setPrompt(idea)}
                    style={styles.chip}
                    accessibilityRole="button"
                    accessibilityLabel={`Use idea ${idea}`}
                  >
                    <Text style={styles.chipText}>{idea}</Text>
                  </Pressable>
                ))}
              </View>

              <Text style={styles.label}>Style</Text>
              <View style={styles.styles}>
                {STYLE_PRESETS.map((preset) => {
                  const active = style === preset.id;
                  return (
                    <Pressable
                      key={preset.id}
                      onPress={() => setStyle(preset.id)}
                      style={[styles.styleCard, active && styles.styleCardActive]}
                      accessibilityRole="button"
                      accessibilityLabel={`${preset.label} style`}
                      accessibilityState={{ selected: active }}
                    >
                      <Text style={styles.styleEmoji}>{preset.emoji}</Text>
                      <Text style={[styles.styleLabel, active && styles.styleLabelActive]}>
                        {preset.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {error && (
                <View style={styles.errorWrap}>
                  <InfoBanner tone="danger" message={error} />
                  <Pressable
                    onPress={handleGenerate}
                    disabled={!canGenerate}
                    style={[styles.retryBtn, !canGenerate && styles.improveDisabled]}
                    accessibilityRole="button"
                    accessibilityLabel="Try creating the image again"
                  >
                    <Text style={styles.retryText}>↻ Try Again</Text>
                  </Pressable>
                </View>
              )}

              <Pressable
                onPress={handleGenerate}
                disabled={!canGenerate}
                accessibilityRole="button"
                accessibilityLabel="Create image"
                style={[styles.generateWrap, !canGenerate && styles.generateDisabled]}
              >
                <LinearGradient
                  colors={gradients.art}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.generate}
                >
                  {generating ? (
                    <View style={styles.generatingRow}>
                      <ActivityIndicator color={colors.textOnDark} />
                      <Text style={styles.generateText}>Creating your art…</Text>
                    </View>
                  ) : (
                    <Text style={styles.generateText}>🪄 Create Image</Text>
                  )}
                </LinearGradient>
              </Pressable>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: { minWidth: 64, minHeight: 44, justifyContent: 'center' },
  backText: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.primary },
  title: { fontSize: fontSize.lg, fontWeight: fontWeight.black, color: colors.textPrimary },
  scroll: { padding: spacing.lg, gap: spacing.lg },
  form: { gap: spacing.md },
  label: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.textPrimary },
  promptRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-end' },
  input: {
    flex: 1,
    minHeight: 96,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    padding: spacing.lg,
    fontSize: fontSize.md,
    color: colors.textPrimary,
    textAlignVertical: 'top',
  },
  improveBtn: {
    minHeight: 48,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.purple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  improveDisabled: { opacity: 0.4 },
  improveText: { fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.purple },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    minHeight: 44,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipText: { fontSize: fontSize.sm, color: colors.textSecondary, fontWeight: fontWeight.medium },
  styles: { flexDirection: 'row', gap: spacing.sm },
  styleCard: {
    flex: 1,
    minHeight: 64,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  styleCardActive: { borderColor: colors.purple, backgroundColor: '#F5F3FF' },
  styleEmoji: { fontSize: 22 },
  styleLabel: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold, color: colors.textSecondary },
  styleLabelActive: { color: colors.purple },
  errorWrap: { gap: spacing.sm },
  retryBtn: {
    minHeight: 48,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryText: { color: colors.textOnDark, fontSize: fontSize.md, fontWeight: fontWeight.bold },
  generateWrap: { borderRadius: radius.lg, overflow: 'hidden', marginTop: spacing.sm },
  generateDisabled: { opacity: 0.4 },
  generate: {
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  generatingRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  generateText: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.textOnDark },
  resultWrap: { gap: spacing.lg },
  resultImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceMuted,
  },
});
