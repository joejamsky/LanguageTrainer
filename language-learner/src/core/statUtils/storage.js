import { TILE_STATS_STORAGE_KEY, isBrowser } from "./constants";
import { normalizeTileEntry } from "./entries";

export const loadTilePerformance = () => {
  if (!isBrowser) return {};
  try {
    const raw = localStorage.getItem(TILE_STATS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return Object.keys(parsed).reduce((acc, id) => {
      acc[id] = normalizeTileEntry(parsed[id]);
      return acc;
    }, {});
  } catch (error) {
    console.warn("Failed to load tile stats:", error);
    return {};
  }
};

export const persistTilePerformance = (stats = {}) => {
  if (!isBrowser) return;
  try {
    localStorage.setItem(TILE_STATS_STORAGE_KEY, JSON.stringify(stats));
  } catch (error) {
    console.warn("Failed to persist tile stats:", error);
  }
};
