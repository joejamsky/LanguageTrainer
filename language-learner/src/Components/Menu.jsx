// Menu.js
import React, { useState } from "react";
import "../Styles/Menu.scss";
import UIControls from "./UIControls";

const Menu = ({options , setOptions}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    let bars = document.querySelectorAll(".bar");
    bars.forEach((bar) => bar.classList.toggle("x"));
    setIsDropdownOpen(!isDropdownOpen);
  };
  
  return (
    <div className="menu-component">
      <div className="menu-container">
        
        <div className="menu-toggle-container">

            <div className="menu-toggle" onClick={toggleDropdown}>
              <span className="bar"></span>
              <span className="bar"></span>
              <span className="bar"></span>
            </div>

        </div>
          
      </div>    
       

      <div className={`dropdown ${isDropdownOpen ? 'open' : ''}`}>
        <UIControls
          options={options}
          setOptions={setOptions}
        />
      </div>    
    </div>
  );
};

export default Menu;
