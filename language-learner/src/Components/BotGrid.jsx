import React from 'react';
import "../Styles/BotGrid.scss";
import DragTile from './DragTile';
import TextInput from './TextInput';
import { useGameState } from "../Contexts/GameStateContext.js";

const BotGrid = () => {
    const { characters, screenSize, options } = useGameState();

    const botCharacters = (() => {
        const hiraganaItems = [];
        const katakanaItems = [];
        const romajiItems = [];
      
        // Group items by type
        characters.botCharacters.forEach((char) => {
          if (!char.characters) return; // Ensure `characters` exists
      
          if (char.modifierGroup === "dakuten" && !options.characterTypes.dakuten) return;
          if (char.modifierGroup === "handakuten" && !options.characterTypes.handakuten) return;
      
          if (options.characterTypes.hiragana && char.characters.hiragana?.render) {
            hiraganaItems.push({ type: "hiragana", ...char.characters.hiragana, id: char.id, matchDesktop: char.characters.romaji.character });
          }
          if (options.characterTypes.katakana && char.characters.katakana?.render) {
            katakanaItems.push({ type: "katakana", ...char.characters.katakana, id: char.id, matchDesktop: char.characters.romaji.character });
          }
          if (options.characterTypes.romaji && char.characters.romaji?.render) {
            romajiItems.push({ type: "romaji", ...char.characters.romaji, id: char.id, matchDesktop: char.characters.romaji.character });
          }
        });
      
        // Combine items row by row (5 items per row)
        const combinedRows = [];
        const maxLength = Math.max(hiraganaItems.length, katakanaItems.length, romajiItems.length);
      
        for (let i = 0; i < maxLength; i += 5) {
          combinedRows.push(
            ...hiraganaItems.slice(i, i + 5),
            ...katakanaItems.slice(i, i + 5),
            ...romajiItems.slice(i, i + 5)
          );
        }
      
        // console.log('combinedRows',combinedRows)
        return combinedRows;
    })();
      

    return (
        <div className="bot-grid-container">
        {(screenSize === 'laptop' || screenSize === 'desktop') && (
            <div>
            <TextInput />
            </div>
        )}

        <div id="draggrid" className={`grid draggrid ${true ? 'vertical' : 'horizontal'}`}>
            {botCharacters.map((character, index) => (
            <DragTile
                key={`bot-grid-item-${index}`}
                index={index}
                characterObj={character}
            />
            ))}
        </div>

        <div className='shadow-gradient'></div>
        </div>
    );
};

export default BotGrid;
