import React from 'react';
import "../Styles/BotGrid.scss";
import DragTile from './DragTile';

const BotGrid = ({ botCharacters, setStart }) => {

    return (
        <div className="bot-grid-container">

            <div id="draggrid" className={`grid draggrid ${true ? 'vertical' : 'horizontal'}`}>

                {botCharacters && botCharacters.map((characterObj, index) => {
                    
                    return (
                        (characterObj !== null && Object.keys(characterObj).length > 1) ? (
                            <DragTile
                                key={`bot-grid-item-${index}`}
                                index={index}
                                character={characterObj}
                                setStart={setStart}
                            />
                        ) : ( // Placeholder for gaps
                            <div key={`bot-grid-item-${index}`} className="bot-grid-item hide"></div>
                        ) 
                    )
                })}

            </div>
        </div>
    );
};

export default BotGrid;
