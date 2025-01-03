import React from "react";
import "../Styles/StartMenu.scss";
import { useGameState } from "../Contexts/GameStateContext.js";

function StartMenu() {
    const {setOptions, startMenuOpen, setStartMenuOpen } = useGameState();

    const handleSelection = (type) => {
        setOptions((prevOptions) => {
            // Update characterTypes based on the selected type
            let updatedCharacterTypes = { ...prevOptions.characterTypes };
    
            if (type === "hiragana") {
                updatedCharacterTypes = {
                    ...updatedCharacterTypes,
                    hiragana: { activeTop: true, activeBot: true },
                    katakana: { activeTop: false, activeBot: false },
                    romaji: { activeTop: false, activeBot: false },
                };
            } else if (type === "katakana") {
                updatedCharacterTypes = {
                    ...updatedCharacterTypes,
                    hiragana: { activeTop: false, activeBot: false },
                    katakana: { activeTop: true, activeBot: true },
                    romaji: { activeTop: false, activeBot: false },
                };
            } else if (type === "both") {
                updatedCharacterTypes = {
                    ...updatedCharacterTypes,
                    hiragana: { activeTop: true, activeBot: true },
                    katakana: { activeTop: true, activeBot: true },
                    romaji: { activeTop: false, activeBot: false },
                };
            }
    
            return {
                ...prevOptions,
                characterTypes: updatedCharacterTypes,
            };
        });
    
        setStartMenuOpen(false); // Close the start menu
    };
    
    return (
        <div className={`${startMenuOpen ? 'start-menu' : 'd-none'}`}>
            <div className="start-menu-header">
                <h3>Learn</h3>
            </div>
            <div className="UI-start-menu">
                <div className="UI-start-menu-item">
                    <button onClick={() => handleSelection("hiragana")}>
                        あ {/* Hiragana */}
                    </button>
                </div>
                <div className="UI-start-menu-item">
                    <button onClick={() => handleSelection("katakana")}>
                        ア {/* Katakana */}
                    </button>
                </div>
                <div className="UI-start-menu-item">
                    <button onClick={() => handleSelection("both")}>
                        あ + ア {/* Both */}
                    </button>
                </div>
            </div>
        </div>
    );
    
 
}

export default StartMenu;
