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
                    <TextInput></TextInput>
                </div>
            )}

            <div id="draggrid" className={`grid draggrid ${true ? 'vertical' : 'horizontal'}`}>

                {characters.botCharacters && characters.botCharacters.map((character, index) => {
                    return (
                        character?.render ? (
                            <DragTile
                                key={`bot-grid-item-${index}`}
                                index={index}
                                character={character}
                            />
                        ) : ( // Don't render row if all characters have assigned to correct position
                            null
                        ) 
                    )
                })}

            </div>

            <div className='shadow-gradient'></div>
        </div>
    );
};

export default BotGrid;
