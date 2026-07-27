// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

/**
 * The ElevenLabs SDK chain (@elevenlabs/react-native, /client, /react) ships
 * ONLY modern "exports" maps with no "main" field. With package-exports
 * resolution off — the Expo SDK 52 default — Metro falls back to
 * `<pkg>/index`, which does not exist, and the iOS bundle fails to build.
 *
 * Expo SDK 53 turns this on by default; we opt in early. "react-native" leads
 * the condition list so the SDK resolves its native entry point rather than
 * the browser build.
 */
config.resolver.unstable_enablePackageExports = true;
config.resolver.unstable_conditionNames = ['react-native', 'require', 'import'];

module.exports = config;
