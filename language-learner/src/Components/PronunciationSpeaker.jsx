import { useEffect, useRef } from "react";
import { useCharacters, useSettings } from "../contexts/gameStateContext.js";
import { dictionaryKanaToRomaji } from "../core/state";

const hasSpeechSupport = () =>
  typeof window !== "undefined" && typeof window.speechSynthesis !== "undefined";

const PronunciationSpeaker = () => {
  const { registerTileCompletionListener, characters } = useCharacters();
  const { options } = useSettings();
  const optionsRef = useRef(options);
  const charactersRef = useRef(characters);

  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  useEffect(() => {
    charactersRef.current = characters;
  }, [characters]);

  useEffect(() => {
    if (!hasSpeechSupport()) {
      return undefined;
    }
    if (!registerTileCompletionListener) {
      return undefined;
    }

    const handleCompletion = (tileId) => {
      if (!optionsRef.current?.pronunciation) {
        return;
      }
      const charState = charactersRef.current || {};
      const sourceTile =
        charState.masterBotCharacters?.find((tile) => tile?.id === tileId) ||
        charState.botCharacters?.find((tile) => tile?.id === tileId);
      if (!sourceTile) {
        return;
      }
      const spokenText =
        sourceTile.character ||
        sourceTile.scripts?.romaji?.character ||
        dictionaryKanaToRomaji[sourceTile.character] ||
        null;
      if (!spokenText) {
        return;
      }
      const utterance = new SpeechSynthesisUtterance(spokenText);
      utterance.lang = "ja-JP";
      utterance.rate = 0.75;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    };

    const unsubscribe = registerTileCompletionListener(handleCompletion);
    return unsubscribe;
  }, [registerTileCompletionListener]);

  return null;
};

export default PronunciationSpeaker;
