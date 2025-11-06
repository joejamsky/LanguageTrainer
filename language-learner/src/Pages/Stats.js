import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import "../Styles/Stats.scss";
import { useGameState } from "../Contexts/GameStateContext";

const Stats = () => {
  const { characters } = useGameState();

  const tiles = useMemo(() => {
    const list = characters?.masterBotCharacters ?? [];
    return list.map((tile) => ({
      ...tile,
      missed:
        typeof tile.missed === "number" && Number.isFinite(tile.missed) ? tile.missed : 0,
    }));
  }, [characters]);

  const visibleTiles = useMemo(() => tiles.filter((tile) => !tile.placeholder), [tiles]);
  const totalMisses = useMemo(() => visibleTiles.reduce((acc, tile) => acc + tile.missed, 0), [visibleTiles]);

  const sectionOrder = ["hiragana", "katakana", "romaji"];
  const sectionLabels = {
    hiragana: { title: "Hiragana", hint: "あ" },
    katakana: { title: "Katakana", hint: "ア" },
    romaji: { title: "Romaji", hint: "a" },
  };

  return (
    <main className="stats">
      <div className="stats-header">
        <div>
          <h1>Kana Performance</h1>
          <p>Review how often each tile has been missed.</p>
        </div>
        <Link to="/setup" className="stats-nav">
          Back to setup
        </Link>
      </div>

      <section className="stats-summary">
        <div className="summary-card">
          <span className="summary-label">Tiles tracked</span>
          <span className="summary-value">{visibleTiles.length}</span>
        </div>
        <div className="summary-card">
          <span className="summary-label">Total misses</span>
          <span className="summary-value">{totalMisses}</span>
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
                  <div className="stats-missed">
                    <span className="missed-count">{tile.missed}</span>
                  </div>
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
