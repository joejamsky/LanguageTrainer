const TILE_STATS_STORAGE_KEY = "tileStats";
export const MAX_ITEM_TIME_SECONDS = 60;
export const ATTEMPT_HISTORY_LIMIT = 5;

const isBrowser = typeof window !== "undefined";

const createDefaultTileEntry = () => ({
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

const computeMemoryScore = (recentAttempts = []) => {
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

const normalizeTileEntry = (entry) => {
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

const ensureEntry = (entry) => normalizeTileEntry(entry);

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
