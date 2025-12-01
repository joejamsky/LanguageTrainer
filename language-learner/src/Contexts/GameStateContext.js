import React from "react";
import { SettingsProvider, useSettings } from "./SettingsContext";
import { StatsProvider, useStatsContext } from "./StatsContext";
import { GameProvider, useGame } from "./GameContext";
import { CharactersProvider, useCharacters } from "./CharactersContext";

export const GameStateProvider = ({ children }) => (
  <SettingsProvider>
    <StatsProvider>
      <GameProvider>
        <CharactersProvider>{children}</CharactersProvider>
      </GameProvider>
    </StatsProvider>
  </SettingsProvider>
);

export { useSettings, useStatsContext, useGame, useCharacters };
