import React from 'react';
import "../Styles/BotGrid.scss";
import DragTile from './DragTile';
import TextInput from './TextInput';
import { useGameState } from "../Contexts/GameStateContext.js";

const BotGrid = () => {
    const { characters, screenSize } = useGameState();

    return (
        <div className="bot-grid-container">
        {(screenSize === 'laptop' || screenSize === 'desktop') && (
            <div>
            <TextInput />
            </div>
        )}

        <div id="draggrid" className={`grid draggrid ${true ? 'vertical' : 'horizontal'}`}>
          {characters.botCharacters.map((character, index) =>
            character.render ? ( // Check if character.render is true
              <DragTile
                key={`bot-grid-item-${index}`}
                index={index}
                characterObj={character}
              />
            ) : null // Render nothing if character.render is false
          )}
        </div>

        <div className='shadow-gradient'></div>
        </div>
    );
};

export default BotGrid;
