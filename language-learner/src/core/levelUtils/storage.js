import {
  LEVEL_STATS_STORAGE_KEY,
  STORAGE_KEYS_TO_CLEAR,
  isBrowser,
  safeParse,
} from "./core";

export const loadLevelStats = () => {
  if (!isBrowser) return null;
  return safeParse(localStorage.getItem(LEVEL_STATS_STORAGE_KEY), null);
};

export const persistLevelStats = (stats) => {
  if (!isBrowser) return;
  try {
    localStorage.setItem(LEVEL_STATS_STORAGE_KEY, JSON.stringify(stats));
  } catch (error) {
    console.warn("Failed to persist stats:", error);
  }
};

export const clearStoredData = () => {
  if (!isBrowser) return;
  STORAGE_KEYS_TO_CLEAR.forEach((key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn(`Failed to clear stored data for key "${key}":`, error);
    }
  });
};
