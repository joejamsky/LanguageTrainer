import React, { useEffect, useMemo, useRef, useState } from 'react';
import "../../../styles/TextInput.scss";
import { useCharacters, useSettings } from "../../../contexts/gameStateContext.js";
import { dictionaryKanaToRomaji } from "../../../core/utils";

const TextInput = ({ targetTileId = null, completionDelayMs = 0 }) => {
    const { handleTextSubmit, inputFocusKey, characters } = useCharacters();
    const { setOptions, currentLevel } = useSettings();
    const [textInput, setTextInput] = useState('');
    const [shakeTimer, setShakeTimer] = useState(false);
    const [placeholderVisible, setPlaceholderVisible] = useState(true);
    const [hasActiveMistake, setHasActiveMistake] = useState(false);
    const inputRef = useRef(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, [currentLevel?.key, inputFocusKey]);

    const targetTile = useMemo(() => {
        if (!targetTileId) return null;
        return (characters?.botCharacters || []).find((tile) => tile?.id === targetTileId) || null;
    }, [characters?.botCharacters, targetTileId]);

    const expectedAnswer = useMemo(() => {
        if (!targetTile) {
            return "";
        }
        const romajiFromScript = targetTile.scripts?.romaji?.character;
        if (romajiFromScript) {
            return romajiFromScript.toLowerCase();
        }
        const kanaChar = targetTile.character || "";
        const romajiFromDict = dictionaryKanaToRomaji[kanaChar];
        if (romajiFromDict) {
            return romajiFromDict.toLowerCase();
        }
        return kanaChar.toLowerCase();
    }, [targetTile]);

    useEffect(() => {
        setHasActiveMistake(false);
        setTextInput('');
    }, [targetTileId]);

    const triggerShake = () => {
        setShakeTimer(true);
        setTimeout(() => {
            setShakeTimer(false);
        }, 500);
    };

    const submitAttempt = (value, { clearOnError = true } = {}) => {
        if (!value) {
            return null;
        }
        const submissionResult = handleTextSubmit(value, targetTileId, {
            delayCompletionMs: completionDelayMs
        });
        if (submissionResult === -1) {
            triggerShake();
            setHasActiveMistake(true);
            if (clearOnError) {
                setTextInput('');
            }
        } else if (submissionResult) {
            setHasActiveMistake(false);
            setTextInput('');
            setPlaceholderVisible(false);
        }
        return submissionResult;
    };

    const handleInputChange = (e) => {
        const { value } = e.target;
        if (placeholderVisible && value.length > 0) {
            setPlaceholderVisible(false);
        }
        setTextInput(value); // Update state with new input value

        if (!expectedAnswer) {
            return;
        }

        const normalizedValue = value.trim().toLowerCase();
        if (!normalizedValue) {
            setHasActiveMistake(false);
            return;
        }

        if (hasActiveMistake && expectedAnswer.startsWith(normalizedValue)) {
            setHasActiveMistake(false);
        }

        if (!hasActiveMistake && !expectedAnswer.startsWith(normalizedValue)) {
            submitAttempt(value, { clearOnError: false });
            return;
        }

        if (normalizedValue === expectedAnswer) {
            submitAttempt(value);
        }
    };

    const handleKeyPress = (event) => {
        const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    
        if (event.shiftKey && (isMac ? event.metaKey : event.ctrlKey)) {
            event.preventDefault();
            // console.log('Shift + Command (Mac) or Shift + Ctrl (Windows) pressed!');
            // Add your custom logic here

            setOptions((prevOptions) => ({
                ...prevOptions, // Spread the existing options
                hints: true
              }));
        }
    };

    const handleKeyUp = (event) => {
        const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    
        if (event.shiftKey === false || (isMac ? event.metaKey === false : event.ctrlKey === false)) {
          setOptions((prevOptions) => ({
            ...prevOptions,
            hints: false
          }));
        }
      };
    

    return (
        <div className="text-input-wrapper">
            <input
                type="text"
                value={textInput} 
                onKeyDown={handleKeyPress} // Add listener to the input
                onKeyUp={handleKeyUp}
                onChange={handleInputChange} // Handle input changes
                placeholder={placeholderVisible ? "Enter romaji" : ""}
                className={shakeTimer ? "shake input-field" : "input-field"}
                ref={inputRef}
            />
        </div>
    );
};

export default TextInput;
