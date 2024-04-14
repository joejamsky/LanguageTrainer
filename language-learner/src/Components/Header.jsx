// Header.js
import React, { useState } from "react";

const Header = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    let bars = document.querySelectorAll(".bar");
    bars.forEach((bar) => bar.classList.toggle("x"));
    setIsDropdownOpen(!isDropdownOpen);
  };
  
  return (
    <div className="nav-container">
      <div className="language-select-container">
        <div className="dropdown">
          <input type="checkbox" id="dropdown-native" />

          <label className="dropdown__face" htmlFor="dropdown-native">
            <div className="dropdown__text">
              <i className="fa-regular fa-square-caret-up"></i>
            </div>

            <div className="dropdown__arrow"></div>
          </label>

          <ul className="dropdown__items">
            <li>Romanji</li>
            <li>Hiragana</li>
            <li>Katakana</li>
          </ul>
        </div>

        <svg>
          <filter id="goo">
            <feGaussianBlur
              in="SourceGraphic"
              stdDeviation="10"
              result="blur"
            />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 30 -10"
              result="goo"
            />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </svg>

        <div className="dropdown">
          <input type="checkbox" id="dropdown-target" />

          <label className="dropdown__face" htmlFor="dropdown-target">
            <div className="dropdown__text">
              <i className="fa-regular fa-square-caret-down"></i>
            </div>

            <div className="dropdown__arrow"></div>
          </label>

          <ul className="dropdown__items">
            <li>Romanji</li>
            <li>Hiragana</li>
            <li>Katakana</li>
          </ul>
        </div>

        <svg>
          <filter id="goo">
            <feGaussianBlur
              in="SourceGraphic"
              stdDeviation="10"
              result="blur"
            />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 30 -10"
              result="goo"
            />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </svg>
      </div>

      <div className="nav-toggle-container">
        <div className="nav-toggle" onClick={toggleDropdown}>
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </div>
      </div>

      <div className={`options-container ${isDropdownOpen ? "open" : ""}`}>
        <div className="panel panel-01"></div>
        <div className="panel panel-02"></div>
        <div className="panel panel-03"></div>
        <div className="panel panel-04"></div>
        <div className="panel panel-05"></div>
        <div className="options-content">
          <div className=""></div>
        </div>
      </div>
    </div>
  );
};

export default Header;
