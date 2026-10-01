import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { readStoredAuth, writeStoredAuth } from './authStorage';

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

describe('account credential storage', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await AsyncStorage.clear();
    jest.mocked(SecureStore.getItemAsync).mockResolvedValue(null);
    jest.mocked(SecureStore.setItemAsync).mockResolvedValue(undefined);
    jest.mocked(SecureStore.deleteItemAsync).mockResolvedValue(undefined);
  });

  it('migrates legacy plaintext storage into native secure storage and deletes the old entry', async () => {
    const account = { email: 'sam@example.com', password: 'local-test-only' };
    await AsyncStorage.setItem('boomer.auth.v1', JSON.stringify(account));

    await expect(readStoredAuth()).resolves.toEqual(account);

    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
      'boomer.auth.v1',
      JSON.stringify(account),
    );
    expect(await AsyncStorage.getItem('boomer.auth.v1')).toBeNull();
  });

  it('deletes credentials on sign-out', async () => {
    await writeStoredAuth(null);

    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('boomer.auth.v1');
  });
});
