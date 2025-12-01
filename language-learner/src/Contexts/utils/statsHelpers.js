import { defaultState } from "../../misc/utils";
import { loadLevelStats } from "../../misc/levelUtils";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export const getDateKey = (date = new Date()) => {
  if (!date) return null;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const parseDateKey = (key) => {
  if (!key) return null;
  const [year, month, day] = key.split("-").map(Number);
  if ([year, month, day].some((value) => Number.isNaN(value))) {
    return null;
  }
  return new Date(year, (month || 1) - 1, day || 1);
};

export const isPreviousCalendarDay = (previousKey, currentKey) => {
  const previousDate = parseDateKey(previousKey);
  const currentDate = parseDateKey(currentKey);
  if (!previousDate || !currentDate) return false;
  const diff = currentDate - previousDate;
  return Math.round(diff / MS_PER_DAY) === 1;
};

export const getInitialStats = () => {
  const stored = loadLevelStats();
  const baseStats = {
    ...defaultState.stats,
    bestTimesByLevel: stored?.bestTimesByLevel || {},
  };
  if (!stored) {
    return baseStats;
  }
  const normalizedKanaStreak =
    stored.kanaStreak ?? stored.currentStreak ?? baseStats.kanaStreak;
  const normalizedBestKanaStreak =
    stored.bestKanaStreak ?? stored.bestStreak ?? baseStats.bestKanaStreak;

  return {
    ...baseStats,
    ...stored,
    kanaStreak: normalizedKanaStreak,
    bestKanaStreak: normalizedBestKanaStreak,
  };
};
