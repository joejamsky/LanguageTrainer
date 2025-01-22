// Utils.js

export const defaultState = {
  characters: {
    topCharacters: [],
    botCharacters: []
  },
  options: {
    characterTypes: {
      hiragana: true,
      katakana: false,
      romaji: false,
      dakuten: false,
      handakuten: false
    },
    topRowLevels: 10,
    gameMode: {
      current: 0,
      methods: ['sound', 'h-shape', 'k-shape', 'missed']
    },
    hints: false,
    sound: false
  },
  game: {
    start: false,
    gameover: false,
    tileIndex: 0
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
