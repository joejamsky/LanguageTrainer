import { useEffect, useMemo, useState } from "react";
import {
  loadTilePerformance,
  persistTilePerformance,
} from "../../Misc/statUtils";

export const useTilePerformance = () => {
  const initialTileStats = useMemo(() => loadTilePerformance(), []);
  const [tileStats, setTileStats] = useState(initialTileStats);

  useEffect(() => {
    persistTilePerformance(tileStats);
  }, [tileStats]);

  return { tileStats, setTileStats };
};
