// Utils.js

import { PROGRESSION_MODES, DEFAULT_LEVEL } from "./levelUtils";

export const defaultState = {
  characters: {
    masterTopCharacters: [],
    masterBotCharacters: [],
    topCharacters: [],
    botCharacters: []
  },
  filters: {
    characterTypes: {
      hiragana: true,
      katakana: false,
      romaji: false
    },
    modifierGroup: {
      dakuten: false,
      handakuten: false
    }
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
    gameMode: {
      current: 0,
      methods: ['sound', 'h-shape', 'k-shape', 'missed']
    },
    hints: false,
    sound: false,
    sorting: {
      shuffleLevel: 0,
      rowShuffle: false,
      columnShuffle: false
    }
  },
  game: {
    start: false,
    gameover: false
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
    index: null
  },
};

export const breakpoints = {
  mobile: 480,
  tablet: 768,
  laptop: 1024,
  desktop: 1200,
}

export const checkUniqueArrayIDs = (data) => {
  // console.log('data',data)
  const idTracker = new Set();
  const duplicates = data.filter(item => {
    if (idTracker.has(item.id)) {
      return true;
    }
    idTracker.add(item.id);
    return false;
  });
  
  console.log("Duplicate IDs:", duplicates);
}


// --- Helper Functions ---
export const dictionaryKanaToRomaji = {
  // A-line
  "あ": "a",   "ア": "a",
  "い": "i",   "イ": "i",
  "う": "u",   "ウ": "u",
  "え": "e",   "エ": "e",
  "お": "o",   "オ": "o",

  // K-line
  "か": "ka",  "カ": "ka",
  "き": "ki",  "キ": "ki",
  "く": "ku",  "ク": "ku",
  "け": "ke",  "ケ": "ke",
  "こ": "ko",  "コ": "ko",

  // S-line
  "さ": "sa",  "サ": "sa",
  "し": "shi", "シ": "shi",
  "す": "su",  "ス": "su",
  "せ": "se",  "セ": "se",
  "そ": "so",  "ソ": "so",

  // T-line
  "た": "ta",  "タ": "ta",
  "ち": "chi", "チ": "chi",
  "つ": "tsu", "ツ": "tsu",
  "て": "te",  "テ": "te",
  "と": "to",  "ト": "to",

  // N-line
  "な": "na",  "ナ": "na",
  "に": "ni",  "ニ": "ni",
  "ぬ": "nu",  "ヌ": "nu",
  "ね": "ne",  "ネ": "ne",
  "の": "no",  "ノ": "no",

  // H-line
  "は": "ha",  "ハ": "ha",
  "ひ": "hi",  "ヒ": "hi",
  "ふ": "fu",  "フ": "fu",
  "へ": "he",  "ヘ": "he",
  "ほ": "ho",  "ホ": "ho",

  // M-line
  "ま": "ma",  "マ": "ma",
  "み": "mi",  "ミ": "mi",
  "む": "mu",  "ム": "mu",
  "め": "me",  "メ": "me",
  "も": "mo",  "モ": "mo",

  // Y-line
  "や": "ya",  "ヤ": "ya",
  "ゆ": "yu",  "ユ": "yu",
  "よ": "yo",  "ヨ": "yo",

  // R-line
  "ら": "ra",  "ラ": "ra",
  "り": "ri",  "リ": "ri",
  "る": "ru",  "ル": "ru",
  "れ": "re",  "レ": "re",
  "ろ": "ro",  "ロ": "ro",

  // W-line
  "わ": "wa",  "ワ": "wa",
  "を": "wo",  "ヲ": "wo",

  // N
  "ん": "n",   "ン": "n",

  // Dakuten (ga, gi, gu, ge, go, etc.)
  "が": "ga",  "ガ": "ga",
  "ぎ": "gi",  "ギ": "gi",
  "ぐ": "gu",  "グ": "gu",
  "げ": "ge",  "ゲ": "ge",
  "ご": "go",  "ゴ": "go",

  "ざ": "za",  "ザ": "za",
  "じ": "ji",  "ジ": "ji",
  "ず": "zu",  "ズ": "zu",
  "ぜ": "ze",  "ゼ": "ze",
  "ぞ": "zo",  "ゾ": "zo",

  "だ": "da",  "ダ": "da",
  "ぢ": "ji",  "ヂ": "ji",
  "づ": "zu",  "ヅ": "zu",
  "で": "de",  "デ": "de",
  "ど": "do",  "ド": "do",

  "ば": "ba",  "バ": "ba",
  "び": "bi",  "ビ": "bi",
  "ぶ": "bu",  "ブ": "bu",
  "べ": "be",  "ベ": "be",
  "ぼ": "bo",  "ボ": "bo",

  // Handakuten (pa, pi, pu, pe, po)
  "ぱ": "pa",  "パ": "pa",
  "ぴ": "pi",  "ピ": "pi",
  "ぷ": "pu",  "プ": "pu",
  "ぺ": "pe",  "ペ": "pe",
  "ぽ": "po",  "ポ": "po"
};
