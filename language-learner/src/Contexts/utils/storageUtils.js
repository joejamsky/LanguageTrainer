export const SETTINGS_STORAGE_KEY = "languageTrainerSettings";
export const isBrowser = typeof window !== "undefined";

export const mergeDeep = (target, source) => {
  const output = Array.isArray(target) ? [...target] : { ...target };
  if (!source || typeof source !== "object") {
    return output;
  }

  Object.keys(source).forEach((key) => {
    const sourceValue = source[key];
    const targetValue = target ? target[key] : undefined;

    if (
      sourceValue &&
      typeof sourceValue === "object" &&
      !Array.isArray(sourceValue)
    ) {
      output[key] = mergeDeep(
        targetValue && typeof targetValue === "object" ? targetValue : {},
        sourceValue
      );
    } else {
      output[key] = sourceValue;
    }
  });

  return output;
};

export const loadSettingsFromStorage = () => {
  if (!isBrowser) return null;
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (error) {
    console.warn("Failed to load settings from storage:", error);
    return null;
  }
};

export const persistSettingsToStorage = (filters, options) => {
  if (!isBrowser) return;
  try {
    localStorage.setItem(
      SETTINGS_STORAGE_KEY,
      JSON.stringify({ filters, options })
    );
  } catch (error) {
    console.warn("Failed to persist settings to storage:", error);
  }
};
