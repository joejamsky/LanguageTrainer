import React from 'react';
import "../Styles/BotGrid.scss";
import DragTile from './DragTile';
import { useGameState } from "../Contexts/GameStateContext.js";

const BotGrid = () => {
    const { characters, setStart, options } = useGameState();

    return (
        <div className="bot-grid-container">

            <div id="draggrid" className={`grid draggrid ${true ? 'vertical' : 'horizontal'}`}>

                {characters.botCharacters && characters.botCharacters.map((character, index) => {
                    return (
                        (character && character.render) ? (
                            <DragTile
                                key={`bot-grid-item-${index}`}
                                index={index}
                                character={character}
                                setStart={setStart}
                                options={options}
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
