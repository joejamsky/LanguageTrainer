import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { TILE_COMPLETION_ANIMATION_MS } from "../../../core/constants/animation";

export const useTileCompletionAnimation = ({
  chunkSlots,
  tileLookupById,
  registerTileCompletionListener,
}) => {
  const [activeAnimation, setActiveAnimation] = useState(null);
  const [pendingClears, setPendingClears] = useState(() => new Set());
  const animationTimeoutRef = useRef(null);

  useEffect(() => {
    setPendingClears((prev) => {
      if (!prev.size) {
        return prev;
      }
      let changed = false;
      const next = new Set();
      prev.forEach((id) => {
        if (tileLookupById.has(id)) {
          next.add(id);
        } else {
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [tileLookupById]);

  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
        animationTimeoutRef.current = null;
      }
    };
  }, []);

  const activeTileId = useMemo(() => {
    for (const tileId of chunkSlots) {
      if (!tileId) continue;
      if (pendingClears.has(tileId)) continue;
      if (tileLookupById.has(tileId)) {
        return tileId;
      }
    }
    return null;
  }, [chunkSlots, pendingClears, tileLookupById]);

  const triggerCompletionAnimation = useCallback(
    (completedTileId) => {
      if (!completedTileId) return;
      const tileEntry = tileLookupById.get(completedTileId);
      if (!tileEntry) {
        return;
      }
      const botTileElement = document.getElementById(`draggable-${completedTileId}`);
      const targetTileElement = document.getElementById(
        `drop-tile-${tileEntry.tile.parentId}`
      );
      if (!botTileElement || !targetTileElement) {
        return;
      }

      const botRect = botTileElement.getBoundingClientRect();
      const targetRect = targetTileElement.getBoundingClientRect();
      const translateX =
        targetRect.left + targetRect.width / 2 - (botRect.left + botRect.width / 2);
      const translateY =
        targetRect.top + targetRect.height / 2 - (botRect.top + botRect.height / 2);

      setPendingClears((prev) => {
        if (prev.has(completedTileId)) {
          return prev;
        }
        const next = new Set(prev);
        next.add(completedTileId);
        return next;
      });

      setActiveAnimation({
        tileId: completedTileId,
        tile: tileEntry.tile,
        translateX,
        translateY,
        key: `${completedTileId}-${Date.now()}`,
      });

      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
      animationTimeoutRef.current = setTimeout(() => {
        setActiveAnimation(null);
        animationTimeoutRef.current = null;
      }, TILE_COMPLETION_ANIMATION_MS);
    },
    [tileLookupById]
  );

  useEffect(() => {
    if (!registerTileCompletionListener) return undefined;
    const unsubscribe = registerTileCompletionListener(triggerCompletionAnimation);
    return unsubscribe;
  }, [registerTileCompletionListener, triggerCompletionAnimation]);

  const getTileAnimationProps = useCallback(
    (tileId) => {
      const isCompleting = activeAnimation?.tileId === tileId;
      if (!isCompleting) {
        return {
          styleOverrides: undefined,
          extraClassName: "",
        };
      }

      const { translateX, translateY } = activeAnimation;
      return {
        styleOverrides: {
          transform: `translate(${translateX}px, ${translateY}px)`,
          transition: `transform ${TILE_COMPLETION_ANIMATION_MS}ms ease-in-out`,
        },
        extraClassName: "completing",
      };
    },
    [activeAnimation]
  );

  return {
    activeTileId,
    getTileAnimationProps,
  };
};

