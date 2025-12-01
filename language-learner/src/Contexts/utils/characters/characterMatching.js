import { dictionaryKanaToRomaji } from "../../../core/state";

export const matchInput = (scriptObj, userInput) => {
  if (!scriptObj || typeof userInput !== "string") {
    return false;
  }

  if (scriptObj.type === "romaji") {
    return scriptObj.character.toLowerCase() === userInput.toLowerCase();
  }

  const romaji = dictionaryKanaToRomaji[scriptObj.character] || "";
  return romaji.toLowerCase() === userInput.toLowerCase();
};
