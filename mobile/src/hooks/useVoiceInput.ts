import { useCallback, useEffect, useRef, useState } from 'react';
import { Audio, InterruptionModeIOS } from 'expo-av';
import { transcribeApi } from '@/api';

/**
 * Reusable voice-to-text input.
 *
 * Extracted from the Voice screen so ANY text input in the app can offer
 * "just talk instead of typing": tap mic → record (expo-av) → tap again →
 * upload to /api/transcribe (Whisper) → the transcribed text is handed to
 * `onTranscript`.
 *
 * The audio-session handling mirrors the battle-tested Voice screen logic:
 *  - request permission only when genuinely undetermined, otherwise guide
 *    the user to Settings;
 *  - switch the session into record mode with an explicit interruption mode
 *    (prepareToRecord fails without it right after audio playback);
 *  - always hand the session back to playback afterwards.
 */

export type VoiceInputState = 'idle' | 'recording' | 'transcribing';

export type UseVoiceInputOptions = {
  /** Receives the transcribed text once recording stops. */
  onTranscript: (text: string) => void;
  /**
   * Called right before recording starts — screens use this to stop any
   * TTS playback that would otherwise hold the audio session.
   */
  onBeforeRecord?: () => void | Promise<void>;
};

export type UseVoiceInput = {
  state: VoiceInputState;
  error: string | null;
  /** Toggle: starts recording when idle, stops + transcribes when recording. */
  toggle: () => void;
  /** Clear a shown error (e.g. when the user starts typing instead). */
  clearError: () => void;
};

export function useVoiceInput({ onTranscript, onBeforeRecord }: UseVoiceInputOptions): UseVoiceInput {
  const [state, setState] = useState<VoiceInputState>('idle');
  const [error, setError] = useState<string | null>(null);
  const recordingRef = useRef<Audio.Recording | null>(null);

  // Keep the latest callbacks without re-creating start/stop.
  const onTranscriptRef = useRef(onTranscript);
  onTranscriptRef.current = onTranscript;
  const onBeforeRecordRef = useRef(onBeforeRecord);
  onBeforeRecordRef.current = onBeforeRecord;

  const start = useCallback(async () => {
    setError(null);
    try {
      await onBeforeRecordRef.current?.();

      let perm = await Audio.getPermissionsAsync();
      if (!perm.granted && perm.canAskAgain) {
        perm = await Audio.requestPermissionsAsync();
      }
      if (!perm.granted) {
        setError(
          'Microphone access is off. Turn it on in Settings → Boomer AI → Microphone, then try again.',
        );
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        interruptionModeIOS: InterruptionModeIOS.DoNotMix,
      });

      const rec = new Audio.Recording();
      await rec.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await rec.startAsync();
      recordingRef.current = rec;
      setState('recording');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'unknown error';
      setError(`Could not start recording: ${msg}`);
      setState('idle');
    }
  }, []);

  const stop = useCallback(async () => {
    const rec = recordingRef.current;
    recordingRef.current = null;
    if (!rec) {
      setState('idle');
      return;
    }
    try {
      await rec.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });
      const uri = rec.getURI();
      if (!uri) {
        setError('Recording did not save. Please try again.');
        setState('idle');
        return;
      }
      setState('transcribing');
      const text = await transcribeApi.transcribeAudio(uri);
      setState('idle');
      if (text) {
        onTranscriptRef.current(text);
      } else {
        setError("I didn't catch that. Please try again.");
      }
    } catch (e) {
      setState('idle');
      const msg = e instanceof Error ? e.message : 'unknown error';
      setError(`Could not understand your audio: ${msg}`);
    }
  }, []);

  const toggle = useCallback(() => {
    if (state === 'transcribing') return;
    if (state === 'recording') {
      void stop();
    } else {
      void start();
    }
  }, [state, start, stop]);

  const clearError = useCallback(() => setError(null), []);

  // Abandon any in-progress recording on unmount.
  useEffect(() => {
    return () => {
      const rec = recordingRef.current;
      recordingRef.current = null;
      if (rec) void rec.stopAndUnloadAsync().catch(() => undefined);
    };
  }, []);

  return { state, error, toggle, clearError };
}
