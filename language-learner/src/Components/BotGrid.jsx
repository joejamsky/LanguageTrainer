import React from 'react';
import "../Styles/BotGrid.scss";
import DragTile from './DragTile';
import TextInput from './TextInput';
import { useGameState } from "../Contexts/GameStateContext.js";

const BotGrid = () => {
    const { characters, screenSize, options } = useGameState();

    return (
        <div className="bot-grid-container">
            {(screenSize === 'laptop' || screenSize === 'desktop') && (
                <div>
                    <TextInput></TextInput>
                </div>
            )}

            <div id="draggrid" className={`grid draggrid ${true ? 'vertical' : 'horizontal'}`}>

                {characters.botCharacters && characters.botCharacters.map((character, index) => {
                    if (
                        (character.dakuten === true && options.characterTypes.dakuten.activeTop === false) ||
                        (character.handakuten === true && options.characterTypes.handakuten.activeTop === false) ||
                        (character?.completed === true)
                    ) {
                        return null; // Render nothing
                    } else {
                        return (
                            <DragTile
                                key={`bot-grid-item-${index}`}
                                index={index}
                                character={character}
                            />
                        )
                    }
                })}

            </div>

            <div className='shadow-gradient'></div>
        </div>
    );
};

export default BotGrid;
