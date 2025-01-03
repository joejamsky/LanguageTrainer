import React, { useEffect } from "react";
import "../Styles/Main.scss";
import "@fortawesome/fontawesome-free/css/all.css";
import TopGrid from "../Components/TopGrid.jsx";
import BotGrid from "../Components/BotGrid.jsx";
import Timer from "../Components/Timer.jsx";
import Menu from "../Components/Menu.jsx";
import StartMenu from "../Components/StartMenu.jsx";
import { useGameState } from "../Contexts/GameStateContext.js";

function Main() {
    const { game, reset, startMenuOpen } = useGameState();

    useEffect(() => {
        reset();
    }, [reset]);
  
    return (
        <div className="Main">
            <div className={`gutter-container ${game.gameover ? 'gameover' : 'gameon'}`}>

                {   startMenuOpen ? 
                    <StartMenu/> : (
                    <>
                        <div className="UI-container">
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
