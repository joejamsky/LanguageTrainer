import React from "react";
import "../Styles/StartMenu.scss";
import { useGameState } from "../Contexts/GameStateContext.js";

function StartMenu() {
    const {setFilters, startMenuOpen, setStartMenuOpen, handleCharacterSelect } = useGameState();

    const handleSelection = (type) => {
        setFilters((prevFilters) => {

            // Update characterTypes based on the selected type
            let updatedCharacterTypes = { ...prevFilters.characterTypes };
    
            if (type === "hiragana") {
                updatedCharacterTypes = {
                    ...updatedCharacterTypes,
                    hiragana: { activeTop: true, activeBot: true },
                    katakana: { activeTop: false, activeBot: false },
                    romaji: { activeTop: false, activeBot: false },
                };
                handleCharacterSelect("hiragana")
            } else if (type === "katakana") {
                updatedCharacterTypes = {
                    ...updatedCharacterTypes,
                    hiragana: { activeTop: false, activeBot: false },
                    katakana: { activeTop: true, activeBot: true },
                    romaji: { activeTop: false, activeBot: false },
                };
                handleCharacterSelect("katakana")
            } else if (type === "both") {
                updatedCharacterTypes = {
                    ...updatedCharacterTypes,
                    hiragana: { activeTop: true, activeBot: true },
                    katakana: { activeTop: true, activeBot: true },
                    romaji: { activeTop: false, activeBot: false },
                };
                handleCharacterSelect("all")
            }
    
            return {
                ...prevFilters,
                characterTypes: updatedCharacterTypes,
            };
        });
    
        setStartMenuOpen(false); // Close the start menu
    };
    
    return (
        <div className={`${startMenuOpen ? 'start-menu' : 'd-none'}`}>
            <div className="start-menu-header">
                <h3>Select Kana</h3>
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
