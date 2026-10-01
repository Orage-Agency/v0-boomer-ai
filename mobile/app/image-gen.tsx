import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { Button } from '@/components/Button';
import { InfoBanner } from '@/components/InfoBanner';
import { imagesApi, ApiError } from '@/api';
import type { ImageProvider } from '@/api/images';
import { isApiConfigured } from '@/config/env';
import { colors, fontSize, fontWeight, radius, spacing } from '@/theme/theme';

/**
 * AI Art / Image generation screen.
 *
 * Wraps the existing images API client (`/api/generate-image` +
 * `/api/improve-prompt`). Mirrors the web `ai-art-tab.tsx`:
 *  - prompt input + quick idea chips + style presets
 *  - "Improve" enhances the prompt via /api/improve-prompt
 *  - "Create Image" generates and shows the result
 *  - loading + error + content-safety states
 */

const STYLE_PRESETS = [
  { id: 'realistic', label: 'Realistic' },
  { id: 'artistic', label: 'Illustration' },
  { id: 'cartoon', label: 'Cartoon' },
  { id: 'vintage', label: 'Vintage' },
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

  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState<string>('realistic');
  const [provider, setProvider] = useState<ImageProvider>('fal');
  const [codexAvailable, setCodexAvailable] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [improving, setImproving] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canGenerate = !!prompt.trim() && !generating && isApiConfigured;

  useEffect(() => {
    if (!isApiConfigured) return;
    imagesApi.getImageProviders()
      .then((result) => setCodexAvailable(result.providers.openaiCodex))
      .catch(() => setCodexAvailable(false));
  }, []);

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
    try {
      const fullPrompt = `Create an image of ${base}, ${style} style, high quality, beautiful lighting.`;
      const res = await imagesApi.generateImage(fullPrompt, provider);
      if (res.imageUrl) {
        setImageUrl(res.imageUrl);
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
  }, [prompt, style, provider]);

  const handleNewImage = useCallback(() => {
    setImageUrl(null);
    setError(null);
  }, []);

  return (
    <Screen centered edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Text style={styles.backText}>‹ Back</Text>
        </Pressable>
        <View style={styles.heading}>
          <Text style={styles.title}>Create an image</Text>
          <Text style={styles.subtitle}>Describe an idea and choose a visual style.</Text>
        </View>
        <View style={styles.backBtn} />
      </View>

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
              <Button title="Make another image" onPress={handleNewImage} variant="primary" />
              <Text style={styles.hint}>Press and hold the image to save or share it.</Text>
            </View>
          ) : (
            <View style={styles.form}>
              <View>
                <Text style={styles.label}>What would you like to see?</Text>
                <Text style={styles.helper}>A subject and setting are enough to begin. Add colors or a mood if you like.</Text>
              </View>
              <TextInput
                style={styles.input}
                value={prompt}
                onChangeText={setPrompt}
                placeholder="A small cottage beside a lake at sunset"
                placeholderTextColor={colors.textMuted}
                multiline
                editable={!generating}
                accessibilityLabel="Image description"
              />

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

              <Text style={styles.label}>Choose a style</Text>
              <View style={styles.styles}>
                {STYLE_PRESETS.map((preset) => {
                  const active = style === preset.id;
                  return (
                    <Pressable
                      key={preset.id}
                      onPress={() => setStyle(preset.id)}
                      style={[styles.styleCard, active && styles.styleCardActive]}
                      accessibilityRole="radio"
                      accessibilityLabel={`${preset.label} style`}
                      accessibilityState={{ selected: active }}
                    >
                      <Text style={[styles.styleLabel, active && styles.styleLabelActive]}>{preset.label}</Text>
                    </Pressable>
                  );
                })}
              </View>

              <View>
                <Text style={styles.label}>Image service</Text>
                <View style={styles.providerList}>
                  <Pressable
                    onPress={() => setProvider('fal')}
                    style={[styles.providerOption, provider === 'fal' && styles.providerActive]}
                    accessibilityRole="radio"
                    accessibilityLabel="Fal.ai, current image service"
                    accessibilityState={{ selected: provider === 'fal' }}
                  >
                    <Text style={styles.providerTitle}>Fal.ai</Text>
                    <Text style={styles.providerDescription}>Current image service</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => codexAvailable && setProvider('openai-codex')}
                    disabled={!codexAvailable}
                    style={[styles.providerOption, provider === 'openai-codex' && styles.providerActive, !codexAvailable && styles.providerDisabled]}
                    accessibilityRole="radio"
                    accessibilityLabel="OpenAI Codex test provider"
                    accessibilityState={{ selected: provider === 'openai-codex', disabled: !codexAvailable }}
                  >
                    <Text style={styles.providerTitle}>OpenAI Codex · test</Text>
                    <Text style={styles.providerDescription}>{codexAvailable ? 'Uses the authorized ChatGPT plan' : 'Not configured on this server'}</Text>
                  </Pressable>
                </View>
                {!codexAvailable && <Text style={styles.helper}>To test this option, configure an authorized ChatGPT plan access token on the server. It is never sent to this screen.</Text>}
              </View>

              <Text style={styles.label}>Or start with an idea</Text>
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

              {error && <InfoBanner tone="danger" message={error} />}

              <Pressable
                onPress={handleGenerate}
                disabled={!canGenerate}
                accessibilityRole="button"
                accessibilityLabel="Create image"
                style={[styles.generateWrap, !canGenerate && styles.generateDisabled]}
              >
                <View style={styles.generate}>
                  {generating ? (
                    <ActivityIndicator color={colors.textOnDark} />
                  ) : (
                    <Text style={styles.generateText}>Create image</Text>
                  )}
                </View>
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
  heading: { flex: 1, gap: 2 },
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
  title: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.textPrimary },
  subtitle: { fontSize: fontSize.xs, lineHeight: 19, color: colors.textSecondary },
  scroll: { padding: spacing.lg, gap: spacing.xl },
  form: { gap: spacing.xl },
  label: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.textPrimary },
  helper: { marginTop: spacing.xs, fontSize: fontSize.xs, lineHeight: 21, color: colors.textSecondary },
  input: {
    minHeight: 128,
    marginTop: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    fontSize: fontSize.md,
    color: colors.textPrimary,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: colors.border,
  },
  improveBtn: {
    minHeight: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  improveDisabled: { opacity: 0.4 },
  improveText: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.textPrimary },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.sm },
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
  styles: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.sm },
  styleCard: {
    minWidth: '46%',
    flexGrow: 1,
    minHeight: 52,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  styleCardActive: { borderColor: colors.ink, backgroundColor: colors.surfaceMuted },
  styleLabel: { fontSize: fontSize.sm, fontWeight: fontWeight.medium, color: colors.textSecondary, textAlign: 'center' },
  styleLabelActive: { color: colors.textPrimary, fontWeight: fontWeight.bold },
  providerList: { gap: spacing.sm, marginTop: spacing.sm },
  providerOption: { minHeight: 64, justifyContent: 'center', padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  providerActive: { borderColor: colors.ink, backgroundColor: colors.surfaceMuted },
  providerDisabled: { backgroundColor: colors.surfaceSubtle, opacity: 0.75 },
  providerTitle: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.textPrimary },
  providerDescription: { marginTop: 2, fontSize: fontSize.xs, lineHeight: 19, color: colors.textSecondary },
  generateWrap: { borderRadius: radius.lg, overflow: 'hidden', marginTop: spacing.sm },
  generateDisabled: { opacity: 0.4 },
  generate: {
    minHeight: 60,
    backgroundColor: colors.ink,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  generateText: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.textOnDark },
  resultWrap: { gap: spacing.lg },
  resultImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceMuted,
  },
  hint: { fontSize: fontSize.xs, color: colors.textMuted, textAlign: 'center' },
});
