import { ATTEMPT_HISTORY_LIMIT, MAX_ITEM_TIME_SECONDS } from "./constants";

export const createDefaultTileEntry = () => ({
  misses: 0,
  attempts: 0,
  totalTimeSeconds: 0,
  validTimeSamples: 0,
  recentAttempts: [],
  lastAttemptedAt: null,
  accuracy: 1,
  averageTimeSeconds: null,
  memoryScore: 1,
});

const clampRecentAttempts = (attempts = []) =>
  attempts.slice(0, ATTEMPT_HISTORY_LIMIT).map((attempt) => ({
    timestamp: attempt.timestamp ?? Date.now(),
    accuracy: Number.isFinite(attempt.accuracy) ? attempt.accuracy : 1,
    duration: Number.isFinite(attempt.duration) ? attempt.duration : null,
    misses: Number.isFinite(attempt.misses) ? attempt.misses : 0,
  }));

export const computeMemoryScore = (recentAttempts = []) => {
  if (!recentAttempts.length) return 1;
  const avgAccuracy =
    recentAttempts.reduce((sum, attempt) => sum + (attempt.accuracy ?? 0), 0) /
    recentAttempts.length;
  const timedAttempts = recentAttempts.filter(
    (attempt) => Number.isFinite(attempt.duration) && attempt.duration > 0
  );
  const avgTime = timedAttempts.length
    ? timedAttempts.reduce((sum, attempt) => sum + attempt.duration, 0) / timedAttempts.length
    : MAX_ITEM_TIME_SECONDS;
  const normalizedTime = 1 - Math.min(avgTime, MAX_ITEM_TIME_SECONDS) / MAX_ITEM_TIME_SECONDS;
  return Number(((avgAccuracy * 0.6 + normalizedTime * 0.4)).toFixed(2));
};

export const normalizeTileEntry = (entry) => {
  if (entry === null || entry === undefined) {
    return createDefaultTileEntry();
  }
  if (typeof entry === "number") {
    return {
      ...createDefaultTileEntry(),
      misses: entry,
    };
  }
  const normalized = {
    ...createDefaultTileEntry(),
    ...entry,
  };
  normalized.recentAttempts = clampRecentAttempts(entry.recentAttempts);
  normalized.validTimeSamples = normalized.validTimeSamples ?? entry.validTimeSamples ?? 0;
  normalized.totalTimeSeconds = normalized.totalTimeSeconds ?? entry.totalTimeSeconds ?? 0;
  if (typeof normalized.averageTimeSeconds !== "number") {
    normalized.averageTimeSeconds =
      normalized.validTimeSamples > 0
        ? normalized.totalTimeSeconds / normalized.validTimeSamples
        : null;
  }
  if (typeof normalized.accuracy !== "number") {
    const totalInteractions = normalized.attempts + normalized.misses;
    normalized.accuracy = totalInteractions > 0 ? normalized.attempts / totalInteractions : 1;
  }
  normalized.memoryScore = computeMemoryScore(normalized.recentAttempts);
  return normalized;
};

export const ensureEntry = (entry) => normalizeTileEntry(entry);
