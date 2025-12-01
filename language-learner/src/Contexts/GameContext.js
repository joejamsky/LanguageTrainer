import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { defaultState } from "../core/state";
import { useStatsContext } from "./StatsContext";

const GameContext = createContext();

export const GameProvider = ({ children }) => {
  const [game, setGame] = useState(defaultState.game);
  const { registerDailyCompletion } = useStatsContext();
  const previousGameoverRef = useRef(false);

  useEffect(() => {
    if (!previousGameoverRef.current && game.gameover) {
      registerDailyCompletion();
    }
    previousGameoverRef.current = game.gameover;
  }, [game.gameover, registerDailyCompletion]);

  const value = useMemo(
    () => ({
      game,
      setGame,
    }),
    [game]
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
};
