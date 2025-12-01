import { useCallback, useState, useEffect } from "react";
import { persistLevelStats } from "../../core/levelUtils";
import {
  getDateKey,
  getInitialStats,
  isPreviousCalendarDay,
} from "../utils/statsHelpers";

export const useStatsState = () => {
  const [stats, setStats] = useState(getInitialStats);

  useEffect(() => {
    persistLevelStats(stats);
  }, [stats]);

  const registerDailyCompletion = useCallback(() => {
    setStats((prevStats) => {
      const todayKey = getDateKey();
      const attemptsByDay = {
        ...(prevStats.dailyAttempts || {}),
      };
      attemptsByDay[todayKey] = (attemptsByDay[todayKey] || 0) + 1;

      let nextDailyStreak = prevStats.dailyStreak || 0;
      if (prevStats.lastActiveDate === todayKey) {
        nextDailyStreak = nextDailyStreak || 1;
      } else if (isPreviousCalendarDay(prevStats.lastActiveDate, todayKey)) {
        nextDailyStreak += 1;
      } else {
        nextDailyStreak = 1;
      }

      return {
        ...prevStats,
        dailyAttempts: attemptsByDay,
        lastActiveDate: todayKey,
        dailyStreak: nextDailyStreak,
      };
    });
  }, []);

  return {
    stats,
    setStats,
    registerDailyCompletion,
  };
};
