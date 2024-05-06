// Utils.js
export const shuffleArray = (array, intensity) => {
  const elementsToShuffle = intensity * 5;
  let shuffled = [...array];

  if (elementsToShuffle > 0) {
    const partToShuffle = shuffled.slice(0, elementsToShuffle);
    partToShuffle.sort(() => Math.random() - 0.5);
    shuffled = [...partToShuffle, ...shuffled.slice(elementsToShuffle)];
  }
  
  return shuffled;
};
  
export const cloneCharacters = (charArray) => {
  return charArray.map(char => ({ ...char }));
};

export const filterCharacters = (charArray, filterFunction) => {
  return charArray.filter(filterFunction);
};


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
