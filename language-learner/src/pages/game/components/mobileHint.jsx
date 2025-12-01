import React, {useState} from "react";
import { useSettings } from "../../../contexts/gameStateContext.js";
import "../../../styles/MobileHint.scss";


const MobileHint = () => {
    const [touched, setTouched] = useState(false);
    const { setOptions } = useSettings();

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
              className={`app-header-button mobile-hint-button ${touched ? 'active' : ''}`}
              type="button"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              onMouseDown={handleTouchStart}
              onMouseUp={handleTouchEnd}
              onMouseLeave={handleTouchEnd}
          >
              <svg
                className="mobile-hint-icon"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M9 18h6" />
                <path d="M10 21h4" />
                <path d="M12 2a7 7 0 0 0-7 7c0 2.4 1.2 3.8 2.5 5s1 2 1.5 3h6c.5-1 0-1.9 1.5-3 1.3-1.2 2.5-2.6 2.5-5a7 7 0 0 0-7-7z" />
              </svg>
          </button>
        </div>
    );

};

export default MobileHint;
