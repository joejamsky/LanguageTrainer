import React from 'react';
import "../Styles/BotGrid.scss";
import DragTile from './DragTile';

const BotGrid = ({ characters, setStart }) => {

    return (
        <div className="bot-grid-container">

            <div id="draggrid" className={`grid draggrid ${true ? 'vertical' : 'horizontal'}`}>

                {characters && characters.map((character, index) => {
                    return (
                        (character && character.render) ? (
                            <DragTile
                                key={`bot-grid-item-${index}`}
                                index={index}
                                character={character}
                                setStart={setStart}
                            />
                        ) : ( // Don't render row if all characters have assigned to correct position
                            null
                        ) 
                    )
                })}

            </div>
        </div>
    );
};

export default BotGrid;
