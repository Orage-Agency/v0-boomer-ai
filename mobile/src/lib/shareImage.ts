import { Platform, Share } from 'react-native';
import * as FileSystem from 'expo-file-system';

/**
 * Download a remote image into the app cache and open the native share
 * sheet. On iOS the sheet includes "Save Image" (to Photos), Messages,
 * Mail, etc., so one flow covers both saving and sharing without extra
 * photo-library write permissions.
 *
 * Returns true when the sheet opened (regardless of what the user picked).
 */
export async function shareRemoteImage(imageUrl: string): Promise<boolean> {
  try {
    const target = `${FileSystem.cacheDirectory}boomer-art-${Date.now()}.jpg`;
    const dl = await FileSystem.downloadAsync(imageUrl, target);
    await Share.share(
      Platform.OS === 'ios' ? { url: dl.uri } : { message: imageUrl },
    );
    return true;
  } catch {
    return false;
  }
}
