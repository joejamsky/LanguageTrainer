import React, { useState, useEffect, useCallback } from "react";
import "../Styles/Main.scss";
import {
  japanese_characters_standard,
} from "../Misc/Constants.js";
import { shuffleArray } from "../Misc/Utils.js";
import "@fortawesome/fontawesome-free/css/all.css";
import TopGrid from "../Components/TopGrid.jsx";
import BotGrid from "../Components/BotGrid.jsx";
import Timer from "../Components/Timer.jsx";
import Menu from "../Components/Menu.jsx";
import { useGameState } from "../Contexts/GameStateContext.js";
import { cloneCharacters, filterCharacters } from "../Misc/Utils.js";
// import { checkUniqueArrayIDs} from "../Misc/Utils.js";

function Main() {
    const { options, characters, setCharacters, game, reset, filterByOptions } = useGameState();

    useEffect(() => {
        reset();
        // checkUniqueArrayIDs(characters.topCharacters)
    }, []);

    useEffect(() => {
        reset();
        if(characters.botCharacters.length !== 0){
            const tempChars = shuffleArray(characters.botCharacters, options.botRowShuffleLevel);
            setCharacters({
            topCharacters: cloneCharacters(filterCharacters(japanese_characters_standard, filterByOptions)),
            botCharacters: tempChars
            })
        }
    }, [options]);

  
    return (
        <div className="Main">
            <div className={`gutter-container ${game.gameover ? 'gameover' : 'gameon'}`}>

                <TopGrid/>
                <div className="UI-container">
                    <div className="UI-divider-container">
                    <div className="UI-divider"></div>
                    </div>
                    <Timer/>
                    <Menu/>
                </div>
                <BotGrid/>


            </div>
        </div>
    );
}

export default Main;
