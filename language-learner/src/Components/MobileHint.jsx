import React, {useState} from "react";
import { useGameState } from "../Contexts/GameStateContext.js";
import "../Styles/MobileHint.scss";


const MobileHint = () => {
    const [touched, setTouched] = useState(false);
    const {setOptions} = useGameState();

    const handleTouchStart = () => {
      setTouched(true)
      setOptions((prevOptions) => ({
          ...prevOptions,
          hints: true,
      }));
    };

    const handleTouchEnd = () => {
      setTouched(false)
      setOptions((prevOptions) => ({
          ...prevOptions,
          hints: false,
      }));
    };
    
    
    return (
        <div className="mobile-hint-container">
          <button 
              className={`mobile-hint-button ${touched ? 'active' : ''}`}
              type="button"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              onMouseDown={handleTouchStart}
              onMouseUp={handleTouchEnd}
              onMouseLeave={handleTouchEnd}
          >
              <i className="fa-regular fa-lightbulb"></i>
          </button>
        </div>
    );

};

export default MobileHint;
