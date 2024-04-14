// Utils.js
export const shuffleArray = (array, intensity) => {
    const elementsToShuffle = intensity * 10;
    let shuffled = [...array];
  
    if (elementsToShuffle > 0) {
      const partToShuffle = shuffled.slice(0, elementsToShuffle);
      partToShuffle.sort(() => Math.random() - 0.5);
      shuffled = [...partToShuffle, ...shuffled.slice(elementsToShuffle)];
    }
  
    return shuffled;
  };
  