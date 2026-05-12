import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from './logger';

export async function getItem(key) {
  try {
    return await AsyncStorage.getItem(key);
  } catch (e) {
    logger.warn('storage.getItem failed', { key, error: e?.message });
    return null;
  }
}

export async function setItem(key, value) {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (e) {
    logger.warn('storage.setItem failed', { key, error: e?.message });
  }
}

export async function removeItem(key) {
  try {
    await AsyncStorage.removeItem(key);
  } catch (e) {
    logger.warn('storage.removeItem failed', { key, error: e?.message });
  }
}

export async function getJSON(key) {
  const raw = await getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function setJSON(key, value) {
  await setItem(key, JSON.stringify(value));
}
