export const checkUniqueArrayIDs = (data = []) => {
  const idTracker = new Set();
  const duplicates = data.filter((item) => {
    if (!item) return false;
    if (idTracker.has(item.id)) {
      return true;
    }
    idTracker.add(item.id);
    return false;
  });

  console.log("Duplicate IDs:", duplicates);
};
