import { useCallback, useEffect, useState } from "react";
import { breakpoints } from "../../Misc/Utils";

export const useScreenSize = () => {
  const [screenSize, setScreenSize] = useState("desktop");

  const updateScreenSize = useCallback(() => {
    if (typeof window === "undefined") {
      return;
    }
    const width = window.innerWidth;
    if (width <= breakpoints.mobile) setScreenSize("mobile");
    else if (width <= breakpoints.tablet) setScreenSize("tablet");
    else if (width <= breakpoints.laptop) setScreenSize("laptop");
    else setScreenSize("desktop");
  }, []);

  useEffect(() => {
    updateScreenSize();
    window.addEventListener("resize", updateScreenSize);
    return () => window.removeEventListener("resize", updateScreenSize);
  }, [updateScreenSize]);

  return screenSize;
};
