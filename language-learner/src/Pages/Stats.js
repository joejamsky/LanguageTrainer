import React, { useMemo } from "react";
import "../Styles/Stats.scss";
import { useGameState } from "../Contexts/GameStateContext";
import AppHeader from "../Components/AppHeader";

const Stats = () => {
  const { characters, stats, tileStats } = useGameState();

  const computeAccuracy = (attempts, misses) => {
    const totalInteractions = attempts + misses;
    if (totalInteractions === 0) return 1;
    return attempts / totalInteractions;
  };

  const visibleTiles = useMemo(() => {
    const list = characters?.masterBotCharacters ?? [];
    return list.map((tile) => {
        const record = tileStats?.[tile.id];
        const attempts = record?.attempts ?? 0;
        const misses =
          record?.misses ??
          (typeof tile.missed === "number" && Number.isFinite(tile.missed) ? tile.missed : 0);
        const accuracy = computeAccuracy(attempts, misses);
        const accuracyPercent =
          attempts + misses > 0 ? Math.round(accuracy * 100) : null;
        return {
          ...tile,
          metrics: {
            attempts,
            misses,
            accuracy,
            accuracyPercent,
            averageTimeSeconds: record?.averageTimeSeconds ?? null,
            memoryScore: typeof record?.memoryScore === "number" ? record.memoryScore : null,
          },
        };
      });
  }, [characters, tileStats]);

  const totalMisses = useMemo(
    () => visibleTiles.reduce((acc, tile) => acc + (tile.metrics?.misses || 0), 0),
    [visibleTiles]
  );

  const averageAccuracy = useMemo(() => {
    const scoredTiles = visibleTiles.filter(
      (tile) => (tile.metrics?.attempts || 0) + (tile.metrics?.misses || 0) > 0
    );
    if (!scoredTiles.length) return null;
    const sum = scoredTiles.reduce((acc, tile) => acc + (tile.metrics?.accuracy || 0), 0);
    return sum / scoredTiles.length;
  }, [visibleTiles]);

  const averageMemoryScore = useMemo(() => {
    const scoredTiles = visibleTiles.filter(
      (tile) => typeof tile.metrics?.memoryScore === "number"
    );
    if (!scoredTiles.length) return null;
    const sum = scoredTiles.reduce((acc, tile) => acc + tile.metrics.memoryScore, 0);
    return sum / scoredTiles.length;
  }, [visibleTiles]);

  const todayKey = useMemo(() => {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${today.getFullYear()}-${month}-${day}`;
  }, []);

  const recentDailyAttempts = useMemo(() => {
    const attempts = Object.entries(stats?.dailyAttempts || {});
    return attempts
      .sort(([a], [b]) => {
        if (a === b) return 0;
        return a < b ? 1 : -1;
      })
      .slice(0, 7);
  }, [stats?.dailyAttempts]);

  const sectionOrder = ["hiragana", "katakana", "romaji"];
  const sectionLabels = {
    hiragana: { title: "Hiragana", hint: "あ" },
    katakana: { title: "Katakana", hint: "ア" },
    romaji: { title: "Romaji", hint: "a" },
  };

  const formatSeconds = (seconds) => {
    if (!Number.isFinite(seconds) || seconds <= 0) return "--";
    if (seconds < 10) {
      return seconds.toFixed(1) + "s";
    }
    return Math.round(seconds) + "s";
  };

  const formatMemoryScore = (score) => {
    if (!Number.isFinite(score)) return "--";
    return `${Math.round(score * 100)}%`;
  };

  const formatDailyLabel = (isoDate) => {
    if (!isoDate) return "--";
    const [year, month, day] = isoDate.split("-").map(Number);
    const dateObject = new Date(year, (month || 1) - 1, day || 1);
    return dateObject.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  return (
    <main className="gutter-container stats">
      <AppHeader />
      <div className="stats-header">
        <div>
          <h1>Kana Performance</h1>
          <p>Track misses, accuracy, pacing, and memory trends for every tile.</p>
        </div>
      </div>

      <section className="stats-daily">
        <header className="stats-section-header">
          <h2>Daily Activity</h2>
          <span className="stats-section-count">Last 7 days</span>
        </header>
        <div className="daily-grid">
          {recentDailyAttempts.length === 0 && (
            <div className="daily-empty">No sessions tracked yet.</div>
          )}
          {recentDailyAttempts.map(([date, count]) => (
            <div key={date} className="daily-cell">
              <span className="daily-date">{formatDailyLabel(date)}</span>
              <span className="daily-count">{count}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="stats-summary">
        <header className="stats-section-header">
          <h2>Tile Activity</h2>
        </header>
        <div className="tile-activity-grid">
          <div className="summary-card">
            <span className="summary-label">Tiles tracked</span>
            <span className="summary-value">{visibleTiles.length}</span>
          </div>
          <div className="summary-card">
            <span className="summary-label">Total misses</span>
            <span className="summary-value">{totalMisses}</span>
          </div>
          <div className="summary-card">
            <span className="summary-label">Avg accuracy</span>
            <span className="summary-value">
              {averageAccuracy === null ? "--" : `${Math.round(averageAccuracy * 100)}%`}
            </span>
          </div>
          <div className="summary-card">
            <span className="summary-label">Memory trend</span>
            <span className="summary-value">{formatMemoryScore(averageMemoryScore)}</span>
          </div>
          <div className="summary-card">
            <span className="summary-label">Kana streak</span>
            <span className="summary-value">{stats?.kanaStreak || 0}</span>
          </div>
          <div className="summary-card">
            <span className="summary-label">Daily streak</span>
            <span className="summary-value">{stats?.dailyStreak || 0}</span>
          </div>
          <div className="summary-card">
            <span className="summary-label">Today's runs</span>
            <span className="summary-value">{stats?.dailyAttempts?.[todayKey] || 0}</span>
          </div>
        </div>
      </section>

      {sectionOrder.map((type) => {
        const sectionTiles = visibleTiles.filter((tile) => tile.type === type);
        if (!sectionTiles.length) return null;
        const { title, hint } = sectionLabels[type];
        return (
          <section key={type} className="stats-section">
            <header className="stats-section-header">
              <h2>{title} Misses</h2>
              <span className="stats-section-hint">{hint}</span>
              <div className="stats-section-count">{sectionTiles.length} tiles</div>
            </header>
            <div className="stats-grid vertical">
              {sectionTiles.map((tile) => (
                <div key={tile.id} className="stats-cell">
                  <div className={`stats-tile stats-tile-${type}`}>{tile.character}</div>
                  <dl className="stats-metrics">
                    <div className="stats-metric">
                      <dt>Missed</dt>
                      <dd>{tile.metrics?.misses || 0}</dd>
                    </div>
                    <div className="stats-metric">
                      <dt>
                        <span className="metric-label-full">Accuracy</span>
                        <span className="metric-label-short">acc</span>
                      </dt>
                      <dd>
                        {tile.metrics?.accuracyPercent === null
                          ? "--"
                          : `${tile.metrics.accuracyPercent}%`}
                      </dd>
                    </div>
                    <div className="stats-metric">
                      <dt>Avg time</dt>
                      <dd>{formatSeconds(tile.metrics?.averageTimeSeconds)}</dd>
                    </div>
                    <div className="stats-metric">
                      <dt>Memory</dt>
                      <dd>{formatMemoryScore(tile.metrics?.memoryScore)}</dd>
                    </div>
                  </dl>
                </div>
              ))}
            </div>
          </section>
        );
      })}

    </main>
  );
};

export default Stats;
