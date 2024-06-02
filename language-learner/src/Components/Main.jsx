import React, { useEffect } from "react";
import "../Styles/Main.scss";
import "@fortawesome/fontawesome-free/css/all.css";
import TopGrid from "../Components/TopGrid.jsx";
import BotGrid from "../Components/BotGrid.jsx";
import Timer from "../Components/Timer.jsx";
import Menu from "../Components/Menu.jsx";
import { useGameState } from "../Contexts/GameStateContext.js";

function Main() {
    const { game, reset } = useGameState();

    useEffect(() => {
        reset();
    }, []);
  
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
