import { isBrowser } from "../../utils/storageUtils";

export const saveCharactersToLocalStorage = (state) => {
  if (!isBrowser) return;
  try {
    localStorage.setItem("characters", JSON.stringify(state));
  } catch (error) {
    console.warn("Failed to persist characters state:", error);
  }
};
