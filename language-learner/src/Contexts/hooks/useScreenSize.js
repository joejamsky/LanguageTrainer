import { useCallback, useEffect, useState } from "react";
import { breakpoints } from "../../core/state";

const getScreenSizeFromWidth = (width) => {
  if (width <= breakpoints.mobile) return "mobile";
  if (width <= breakpoints.tablet) return "tablet";
  if (width <= breakpoints.laptop) return "laptop";
  return "desktop";
};

export const useScreenSize = () => {
  const [screenSize, setScreenSize] = useState(() => {
    if (typeof window === "undefined") {
      return "desktop";
    }
    return getScreenSizeFromWidth(window.innerWidth);
  });

  const updateScreenSize = useCallback(() => {
    if (typeof window === "undefined") {
      return;
    }
    const width = window.innerWidth;
    setScreenSize(getScreenSizeFromWidth(width));
  }, []);

  useEffect(() => {
    updateScreenSize();
    window.addEventListener("resize", updateScreenSize);
    return () => window.removeEventListener("resize", updateScreenSize);
  }, [updateScreenSize]);

  return screenSize;
};
