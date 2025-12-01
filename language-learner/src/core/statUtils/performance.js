import { ATTEMPT_HISTORY_LIMIT, MAX_ITEM_TIME_SECONDS } from "./constants";
import { ensureEntry, computeMemoryScore } from "./entries";

export const applyMissToTilePerformance = (stats = {}, tileId) => {
  if (!tileId) return stats;
  const next = { ...stats };
  const entry = {
    ...ensureEntry(next[tileId]),
  };
  entry.misses += 1;
  const totalInteractions = entry.attempts + entry.misses;
  entry.accuracy = totalInteractions > 0 ? entry.attempts / totalInteractions : 0;
  entry.lastAttemptedAt = Date.now();
  next[tileId] = entry;
  return next;
};

export const applyAttemptToTilePerformance = (
  stats = {},
  tileId,
  { durationSeconds = null, missesBeforeSuccess = 0 } = {}
) => {
  if (!tileId) return stats;
  const next = { ...stats };
  const entry = {
    ...ensureEntry(next[tileId]),
  };
  entry.attempts += 1;
  entry.lastAttemptedAt = Date.now();

  const misses = Math.max(0, missesBeforeSuccess);
  const perAttemptAccuracy = 1 / Math.max(misses + 1, 1);

  const attemptRecord = {
    timestamp: entry.lastAttemptedAt,
    accuracy: perAttemptAccuracy,
    misses,
  };

  const validTime =
    Number.isFinite(durationSeconds) &&
    durationSeconds > 0 &&
    durationSeconds <= MAX_ITEM_TIME_SECONDS;
  if (validTime) {
    const rounded = Number(durationSeconds.toFixed(2));
    entry.totalTimeSeconds += rounded;
    entry.validTimeSamples += 1;
    attemptRecord.duration = rounded;
  } else {
    attemptRecord.duration = null;
  }

  entry.recentAttempts = [attemptRecord, ...entry.recentAttempts].slice(0, ATTEMPT_HISTORY_LIMIT);
  entry.averageTimeSeconds =
    entry.validTimeSamples > 0 ? entry.totalTimeSeconds / entry.validTimeSamples : null;
  const totalInteractions = entry.attempts + entry.misses;
  entry.accuracy = totalInteractions > 0 ? entry.attempts / totalInteractions : 1;
  entry.memoryScore = computeMemoryScore(entry.recentAttempts);

  next[tileId] = entry;
  return next;
};

export const deriveTilePerformanceSnapshot = (tileId, stats = {}) => {
  const entry = ensureEntry(stats[tileId]);
  return {
    ...entry,
    accuracy: entry.accuracy,
    averageTimeSeconds: entry.averageTimeSeconds,
    memoryScore: entry.memoryScore,
  };
};
