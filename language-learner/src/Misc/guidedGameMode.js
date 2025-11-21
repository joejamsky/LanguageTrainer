import { GUIDED_SCRIPT_OPTIONS } from "../Constants/guidedPaths";
import {
  describeLevel,
  readStoredLevels,
  readStoredLevel,
  readLastGuidedScriptKey,
} from "./levelUtils";

export const buildGuidedLevelMap = () => {
  const storedLevels = readStoredLevels();
  const descriptors = {};
  GUIDED_SCRIPT_OPTIONS.forEach((option) => {
    const level = storedLevels[option.key] || readStoredLevel(option.key);
    descriptors[option.key] = {
      level,
      descriptor: describeLevel(level),
    };
  });
  return { descriptors };
};

export const getInitialGuidedSelection = () => {
  const initialKey = readLastGuidedScriptKey();
  const isValid = GUIDED_SCRIPT_OPTIONS.some((option) => option.key === initialKey);
  return isValid ? initialKey : GUIDED_SCRIPT_OPTIONS[0].key;
};
