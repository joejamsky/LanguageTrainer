// Utils.js
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
