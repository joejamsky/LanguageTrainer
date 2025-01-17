import React, {useState} from "react";
import { useGameState } from "../Contexts/GameStateContext.js";
import "../Styles/MobileHint.scss";


const MobileHint = () => {
    const [touched, setTouched] = useState(false);
    const {setOptions, screenSize} = useGameState();

    const handleTouchStart = (e) => {
      setTouched(true)
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
      setTouched(false)
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
          {(screenSize === 'mobile' || screenSize === 'tablet') && (
            <button 
                className={`${touched && 'active'} mobile-hint-button`}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}>
                <i className="fa-regular fa-lightbulb"></i>
            </button>
          )}
        </div>
    );

};

export default MobileHint;
