import { PROGRESSION_MODES, DEFAULT_LEVEL } from "../levelUtils";
import { getDefaultCustomSelections } from "../customSelections";

export const defaultState = {
  characters: {
    masterTopCharacters: [],
    masterBotCharacters: [],
    topCharacters: [],
    botCharacters: [],
  },
  filters: {
    characterTypes: {
      hiragana: true,
      katakana: false,
      romaji: false,
    },
    modifierGroup: {
      dakuten: false,
      handakuten: false,
    },
  },
  options: {
    rowLevel: 1,
    rowRange: {
      start: 1,
      end: 1,
    },
    studyMode: PROGRESSION_MODES.LINEAR,
    shapeGroup: 1,
    accuracyThreshold: DEFAULT_LEVEL.accuracyThreshold,
    hints: false,
    pronunciation: false,
    sound: false,
    customSelections: getDefaultCustomSelections(),
  },
  game: {
    start: false,
    gameover: false,
  },
  stats: {
    recentTime: 0,
    bestTime: 0,
    bestTimesByLevel: {},
    kanaStreak: 0,
    bestKanaStreak: 0,
    dailyStreak: 0,
    lastActiveDate: null,
    dailyAttempts: {},
  },
  selectedTile: {
    id: null,
    index: null,
  },
};
