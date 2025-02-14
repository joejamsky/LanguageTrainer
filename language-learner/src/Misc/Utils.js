// Utils.js

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
    topRowLevels: 10,
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
// export const cloneCharacters = (charArray) => {
//   return charArray.map(char => ({ ...char }));
// };

// export const filterCharacters = (charArray, filterFunction) => {
//   return charArray.filter(filterFunction);
// };

// export const filterByOptions = (character, characterTypes, context) => {
//   const isHiraganaActive = characterTypes.hiragana;
//   const isKatakanaActive = characterTypes.katakana;
//   const isDakutenActive = characterTypes.dakuten;
//   const isHandakutenActive = characterTypes.handakuten;

//   const characterIsHiragana = character.group === "hiragana";
//   const characterIsKatakana = character.group === "katakana";
//   const characterIsDakuten = character.dakuten;
//   const characterIsHandakuten = character.handakuten;
  

//   return (
//     (isHiraganaActive && characterIsHiragana) ||
//     (isKatakanaActive && characterIsKatakana) ||
//     (isDakutenActive && characterIsDakuten) ||
//     (isHandakutenActive && characterIsHandakuten)
//   );
// };



// export const handleDefaultCharacters = (botData, characterTypes = defaultState.options.characterTypes) => {
//   const filteredTopCharacters = filterCharacters(botData, (character) => 
//     filterByOptions(character, characterTypes)
//   );

//   const filteredBotCharacters = filterCharacters(botData, (character) => 
//     filterByOptions(character, characterTypes, "activeBot")
//   );

//   return {
//     topCharacters: filteredTopCharacters,
//     botCharacters: filteredBotCharacters,
//     defaultTop: topData,
//     defaultBot: botData,
//   };
// };


// export const handleCharRenderToggles = (item, options) => {
//   if (item.placeholder) return false;
//   if (!item.render) return false;
//   if (item.modifierGroup === "dakuten" && !options.modifierGroup.dakuten) return false;
//   if (item.modifierGroup === "handakuten" && !options.modifierGroup.handakuten) return false;
//   if (item.type === "hiragana" && !options.characterTypes.hiragana) return false;
//   if (item.type === "katakana" && !options.characterTypes.katakana) return false;
//   if (item.type === "romaji" && !options.characterTypes.romaji) return false;

//   return true; 
// };

// export const handleCharSort = (item, options) => {

// }


export const checkUniqueArrayIDs = (data) => {
  console.log('data',data)
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

// Fisher-Yates shuffle for a one-dimensional array.
export const shuffleArray = (arr) => {
  let array = [...arr];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

// Shuffle each row independently.
export const shuffleRows = (grid) => {
  return grid.map(row => shuffleArray(row));
};


// Helper: Shuffle a single column while keeping placeholders at the bottom.
export const shuffleColumnKeepPlaceholders = (colArr) => {
  // Separate non-placeholders and placeholders.
  const nonPlaceholders = colArr.filter(item => item !== "placeholder");
  const placeholders = colArr.filter(item => item === "placeholder");

  // Shuffle only the non-placeholder items.
  const shuffledNonPlaceholders = shuffleArray(nonPlaceholders);

  // Return the new column: shuffled non-placeholders at the top, then placeholders.
  return [...shuffledNonPlaceholders, ...placeholders];
};

// Apply the above to each column in your grid.
export const shuffleColumnsWithPlaceholdersAtBottom = (grid, numCols) => {
  const totalRows = grid.length;
  // Create a copy of the grid.
  let newGrid = grid.map(row => [...row]);

  for (let col = 0; col < numCols; col++) {
    // Extract the column into an array.
    let colItems = [];
    for (let row = 0; row < totalRows; row++) {
      colItems.push(newGrid[row][col]);
    }
    // Shuffle the column while preserving placeholders at the bottom.
    let newCol = shuffleColumnKeepPlaceholders(colItems);
    // Write the new column back into the grid.
    for (let row = 0; row < totalRows; row++) {
      newGrid[row][col] = newCol[row];
    }
  }
  return newGrid;
};


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
