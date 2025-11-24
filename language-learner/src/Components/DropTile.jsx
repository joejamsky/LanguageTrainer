import React, { useMemo, useState } from "react";
import "../Styles/DropTile.scss";
import { useGameState } from "../Contexts/GameStateContext";
import { getGridCoordinatesForTile } from "../Contexts/utils/characterUtils";
import { ensureCustomSelections } from "../Misc/customGameMode";
import {
    getRowNumberForTileId,
    getModifierRowIndex,
} from "../Data/kanaGroups";


const DropTile = ({ characterObj, index }) => {

    const [dragHover, setDragHover] = useState(false);
    const {handleDrop, filters, options, screenSize} = useGameState(); 

    const active = !characterObj.completed;
    const isDesktop = screenSize === "laptop" || screenSize === "desktop";
    const isMobileLayout = screenSize === 'mobile' || screenSize === 'tablet';
    const gridPosition = getGridCoordinatesForTile(characterObj);
    const customSelections = useMemo(
        () => ensureCustomSelections(options.customSelections),
        [options.customSelections]
    );
    const rowNumber = useMemo(
        () => getRowNumberForTileId(characterObj?.id),
        [characterObj?.id]
    );
    const modifierKey = characterObj?.modifierGroup || "base";
    const displayRow = useMemo(() => {
        if (!gridPosition || typeof rowNumber !== "number") {
            return gridPosition?.row;
        }
        const calculated =
            getModifierRowIndex(modifierKey, rowNumber) ??
            getModifierRowIndex("base", rowNumber);
        if (calculated == null) {
            return gridPosition.row;
        }
        return calculated;
    }, [gridPosition, modifierKey, rowNumber]);
    const tileStyle = gridPosition
        ? { gridColumn: gridPosition.column, gridRow: displayRow ?? gridPosition.row }
        : undefined;

    const getRowSelectionKey = (scriptKey) => {
        if (characterObj?.modifierGroup === "dakuten") return "dakuten";
        if (characterObj?.modifierGroup === "handakuten") return "handakuten";
        return scriptKey;
    };

    const isRowEnabledForScript = (scriptKey) => {
        if (typeof rowNumber !== "number" || rowNumber <= 0) {
            return true;
        }
        const selectionKey = getRowSelectionKey(scriptKey);
        const rowsForKey = customSelections.rows?.[selectionKey];
        if (!rowsForKey) {
            return true;
        }
        const value = rowsForKey[rowNumber];
        return typeof value === "boolean" ? value : true;
    };
    
    const onDragOver = (e) => {
        e.preventDefault();
        setDragHover(true);
    };

    const onDragLeave = (e) => {
        setDragHover(false);
    };


    const renderCharacterContainers = () => {
        const romajiScript = characterObj.scripts.romaji || {};
        const hiraganaScript = characterObj.scripts.hiragana || {};
        const katakanaScript = characterObj.scripts.katakana || {};
        const hiraganaFilled = !!hiraganaScript.filled;
        const katakanaFilled = !!katakanaScript.filled;
        const romajiFilled = (hiraganaFilled && katakanaFilled) || !!romajiScript.filled;

        const romajiVisible = (filters.characterTypes.romaji || options.hints || isMobileLayout);
        const hiraganaVisible = isDesktop
            ? filters.characterTypes.hiragana
            : filters.characterTypes.hiragana;
        const katakanaVisible = isDesktop
            ? filters.characterTypes.katakana
            : filters.characterTypes.katakana;
        const showDividerBetweenKana = hiraganaVisible && katakanaVisible;
        const showDividerBetweenRomajiAndKana = (hiraganaVisible || katakanaVisible) && romajiVisible;
        const hiraganaCharVisible = options.hints || hiraganaFilled;
        const katakanaCharVisible = options.hints || katakanaFilled;

        return (
            <div className="top-grid-phonetic">
                {/* Romaji on the top */}
                <div className={`grid-item-top ${romajiVisible ? 'visible' : 'hidden'}`}>
                    <div className={`
                        phonetic-romaji
                        ${romajiFilled ? 'filled' : ''}
                        `}>
                        {romajiScript.character}
                    </div>
                </div>
                
                <div className={`${showDividerBetweenRomajiAndKana ? 'UI-divider-container' : 'd-none'}`}>
                    <div className="UI-divider"></div>
                </div>

                <div className={`grid-item-top ${hiraganaVisible || katakanaVisible ? 'visible' : 'hidden'}`}>
                    {/* Hiragana on the left */}
                    <div className={`
                        phonetic-hiragana 
                        ${hiraganaVisible ? 'visible' : 'hidden'}
                        ${hiraganaFilled ? 'filled' : ''}
                        ${filters.characterTypes.hiragana && !isRowEnabledForScript('hiragana') ? 'inactive' : ''}
                        `}>
                        {hiraganaCharVisible ? hiraganaScript.character : ''}
                    </div>

                    
                    <div className={`${showDividerBetweenKana ? 'UI-divider-vertical' : 'd-none'}`}></div>
                    
                    
                    {/* Katakana on the right */}
                    <div className={`
                            phonetic-katakana 
                            ${katakanaVisible ? 'visible' : 'hidden'}
                            ${katakanaFilled ? 'filled' : ''}
                            ${filters.characterTypes.katakana && !isRowEnabledForScript('katakana') ? 'inactive' : ''}
                            `}>
                        {katakanaCharVisible ? katakanaScript.character : ''}
                    </div>
                </div>
            </div>
        );
    };
    

    const completeDrop = () => {
        handleDrop(characterObj.id, index);
        setDragHover(false);
    };


    return (
        <div
            id={`drop-tile-${characterObj.id}`}
            key={`drop-tile-${characterObj.id}`}
            className={`
                top-grid-item 
                ${characterObj.completed ? 'filled' : ''}
                ${dragHover ? 'drag-proximity-hover' : ''}
            `}
            style={tileStyle}
            onDrop={active && isDesktop ? completeDrop : undefined} 
            onDragOver={active && isDesktop ? onDragOver : undefined}
            onDragLeave={active && isDesktop ? onDragLeave : undefined}
            onTouchEnd={active ? completeDrop : undefined}
            onClick={active ? completeDrop : undefined}
        >
            {renderCharacterContainers()}
            
        </div>
    );
      
};

export default DropTile;
