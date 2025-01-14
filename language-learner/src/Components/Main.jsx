import React, { useEffect } from "react";
import "../Styles/Main.scss";
import "@fortawesome/fontawesome-free/css/all.css";
import TopGrid from "../Components/TopGrid.jsx";
import BotGrid from "../Components/BotGrid.jsx";
import Timer from "../Components/Timer.jsx";
import Menu from "../Components/Menu.jsx";
import StartMenu from "../Components/StartMenu.jsx";
import MobileHint from "../Components/MobileHint.jsx";
import { useGameState } from "../Contexts/GameStateContext.js";

function Main() {
    const { game, init, startMenuOpen } = useGameState();

    useEffect(() => {
        init();
    }, [init]);
  
    return (
        <div className="Main">
            <div className={`gutter-container ${game.gameover ? 'gameover' : 'gameon'}`}>

                {   startMenuOpen ? 
                    <StartMenu/> : (
                    <>
                        <div className="UI-header">
                            <MobileHint/>
                            <Timer/>
                            <Menu/>
                        </div>
                        <TopGrid/>
                        <div className="UI-divider-container m-1">
                            <div className="UI-divider"></div>
                        </div>
                        <BotGrid/>
                    </>
                )}
                




            </div>
        </div>
    );
}

export default Main;
