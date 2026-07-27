import { useCallback, useEffect, useRef, useState } from 'react';
import { Vibration } from 'react-native';
import { Audio, InterruptionModeIOS } from 'expo-av';
import { transcribeApi } from '@/api';

/**
 * Reusable voice-to-text input.
 *
 * Tap mic → record (expo-av) → tap again → upload to /api/transcribe
 * (Whisper) → the transcribed text is handed to `onTranscript`.
 *
 * Hardened for real-device reliability:
 *  - `durationMs` ticks while recording so screens can show a visible timer;
 *  - recordings auto-stop (and still transcribe) at MAX_RECORD_MS, so a
 *    forgotten mic never runs forever;
 *  - `cancel()` throws the take away without transcribing;
 *  - a busy-guard ignores rapid double-taps (iOS allows only ONE active
 *    recording — a second prepare throws);
 *  - every failure path resets the iOS audio session back to playback so one
 *    bad recording can't wedge the mic for the rest of the app session;
 *  - a stale recording object is unloaded before starting a new one.
 */

export type VoiceInputState = 'idle' | 'recording' | 'transcribing';

/** Hard ceiling per take — long enough for a full question, never runaway. */
export const MAX_RECORD_MS = 60_000;

/**
 * Speech-optimized recording: mono 16 kHz AAC. Whisper downsamples to 16 kHz
 * anyway, so the old HIGH_QUALITY preset (44.1 kHz stereo) only made uploads
 * ~8× bigger — the main reason transcription felt slow on cellular.
 */
const SPEECH_RECORDING_OPTIONS: Audio.RecordingOptions = {
  isMeteringEnabled: false,
  ios: {
    extension: '.m4a',
    outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
    audioQuality: Audio.IOSAudioQuality.HIGH,
    sampleRate: 16000,
    numberOfChannels: 1,
    bitRate: 64000,
  },
  android: {
    extension: '.m4a',
    outputFormat: Audio.AndroidOutputFormat.MPEG_4,
    audioEncoder: Audio.AndroidAudioEncoder.AAC,
    sampleRate: 16000,
    numberOfChannels: 1,
    bitRate: 64000,
  },
  web: {
    mimeType: 'audio/webm',
    bitsPerSecond: 64000,
  },
};

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
  /** Milliseconds recorded so far (0 when idle) — drive a visible timer. */
  durationMs: number;
  /** Toggle: starts recording when idle, stops + transcribes when recording. */
  toggle: () => void;
  /** Discard the current recording without sending it anywhere. */
  cancel: () => void;
  /** Clear a shown error (e.g. when the user starts typing instead). */
  clearError: () => void;
};

/** Best-effort: hand the audio session back to playback mode. */
async function resetAudioSession(): Promise<void> {
  try {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
    });
  } catch {
    /* ignore */
  }
}

export function useVoiceInput({ onTranscript, onBeforeRecord }: UseVoiceInputOptions): UseVoiceInput {
  const [state, setState] = useState<VoiceInputState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [durationMs, setDurationMs] = useState(0);
  const recordingRef = useRef<Audio.Recording | null>(null);
  // Serializes start/stop so double-taps and auto-stop can't overlap.
  const busyRef = useRef(false);

  // Keep the latest callbacks without re-creating start/stop.
  const onTranscriptRef = useRef(onTranscript);
  onTranscriptRef.current = onTranscript;
  const onBeforeRecordRef = useRef(onBeforeRecord);
  onBeforeRecordRef.current = onBeforeRecord;

  // stop() needs to be callable from the recording status callback (for the
  // auto-stop) before it is defined — route through a ref.
  const stopRef = useRef<() => void>(() => undefined);

  const start = useCallback(async () => {
    if (busyRef.current) return;
    busyRef.current = true;
    setError(null);
    try {
      await onBeforeRecordRef.current?.();

      // Defensive: unload any stale recording left by a previous failure.
      const stale = recordingRef.current;
      if (stale) {
        recordingRef.current = null;
        try {
          await stale.stopAndUnloadAsync();
        } catch {
          /* already unloaded */
        }
      }

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
      rec.setProgressUpdateInterval(500);
      rec.setOnRecordingStatusUpdate((st) => {
        if (!st.isRecording) return;
        setDurationMs(st.durationMillis ?? 0);
        // Auto-stop at the ceiling — still transcribes what was said.
        if ((st.durationMillis ?? 0) >= MAX_RECORD_MS) {
          stopRef.current();
        }
      });
      await rec.prepareToRecordAsync(SPEECH_RECORDING_OPTIONS);
      await rec.startAsync();
      recordingRef.current = rec;
      setDurationMs(0);
      setState('recording');
      // Tactile "I'm listening" confirmation — matters for older hands that
      // aren't sure whether the tap registered.
      Vibration.vibrate(30);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'unknown error';
      setError(`Could not start recording: ${msg}`);
      setState('idle');
      // A half-prepared recording can leave the session in record mode —
      // always hand it back so the NEXT attempt works.
      await resetAudioSession();
    } finally {
      busyRef.current = false;
    }
  }, []);

  const stop = useCallback(async () => {
    if (busyRef.current) return;
    busyRef.current = true;
    const rec = recordingRef.current;
    recordingRef.current = null;
    if (!rec) {
      setState('idle');
      busyRef.current = false;
      return;
    }
    try {
      rec.setOnRecordingStatusUpdate(null);
      await rec.stopAndUnloadAsync();
      await resetAudioSession();
      const uri = rec.getURI();
      if (!uri) {
        setError('Recording did not save. Please try again.');
        setState('idle');
        return;
      }
      setState('transcribing');
      const text = await transcribeApi.transcribeAudio(uri);
      setState('idle');
      setDurationMs(0);
      if (text) {
        onTranscriptRef.current(text);
      } else {
        setError("I didn't catch that. Please try again.");
      }
    } catch (e) {
      setState('idle');
      setDurationMs(0);
      await resetAudioSession();
      const msg = e instanceof Error ? e.message : 'unknown error';
      setError(`Could not understand your audio: ${msg}`);
    } finally {
      busyRef.current = false;
    }
  }, []);
  stopRef.current = () => void stop();

  /** Throw the current take away — nothing is transcribed or sent. */
  const cancel = useCallback(() => {
    void (async () => {
      const rec = recordingRef.current;
      recordingRef.current = null;
      if (rec) {
        try {
          rec.setOnRecordingStatusUpdate(null);
          await rec.stopAndUnloadAsync();
        } catch {
          /* already unloaded */
        }
      }
      await resetAudioSession();
      setState('idle');
      setDurationMs(0);
      setError(null);
    })();
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
      if (rec) {
        void rec
          .stopAndUnloadAsync()
          .catch(() => undefined)
          .then(() => resetAudioSession());
      }
    };
  }, []);

  return { state, error, durationMs, toggle, cancel, clearError };
}
