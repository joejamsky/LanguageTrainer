import { createContext, useContext, useMemo } from "react";
import { useStatsState } from "./hooks/useStatsState";
import { useTilePerformance } from "./hooks/useTilePerformance";

const StatsContext = createContext();

export const StatsProvider = ({ children }) => {
  const { stats, setStats, registerDailyCompletion } = useStatsState();
  const { tileStats, setTileStats } = useTilePerformance();

  const value = useMemo(
    () => ({
      stats,
      setStats,
      registerDailyCompletion,
      tileStats,
      setTileStats,
    }),
    [stats, setStats, registerDailyCompletion, tileStats, setTileStats]
  );

  return (
    <StatsContext.Provider value={value}>{children}</StatsContext.Provider>
  );
};

export const useStatsContext = () => {
  const context = useContext(StatsContext);
  if (!context) {
    throw new Error("useStatsContext must be used within a StatsProvider");
  }
  return context;
};
