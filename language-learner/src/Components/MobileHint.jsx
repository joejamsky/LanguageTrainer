import React from "react";
import { useGameState } from "../Contexts/GameStateContext.js";
import "../Styles/MobileHint.scss";


const MobileHint = () => {

    const {setOptions} = useGameState();

    const handleTouchStart = (e) => {
        setOptions((prevOptions) => ({
            ...prevOptions, // Spread the existing options
            characterTypes: {
              ...prevOptions.characterTypes, // Spread the existing characterTypes
              romaji: {
                ...prevOptions.characterTypes.romaji, // Spread the existing romaji object
                activeTop: true, // Update the specific property
              },
            },
        }));
    };

    const handleTouchEnd = (e) => {
        setOptions((prevOptions) => ({
            ...prevOptions,
            characterTypes: {
              ...prevOptions.characterTypes,
              romaji: {
                ...prevOptions.characterTypes.romaji,
                activeTop: false, // Set back to false when keys are released
              },
            },
        }));
    };
    

    return (
        <div className="mobile-hint-container">
            <button 
                className="mobile-hint-button"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}>
                <i class="fa-regular fa-lightbulb"></i>
            </button>
        </div>
    );

};

export default MobileHint;
