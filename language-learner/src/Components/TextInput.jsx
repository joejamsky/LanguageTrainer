import React, {useState} from 'react';
import "../Styles/TextInput.scss";
import { useGameState } from "../Contexts/GameStateContext.js";

const TextInput = () => {
    const {handleTextSubmit} = useGameState();
    const [textInput, setTextInput] = useState('');
    const [shakeTimer, setShakeTimer] = useState(false);

    const handleInputChange = (e) => {
        setTextInput(e.target.value); // Update state with new input value
    };

    const handleSubmit = (e) => {
        e.preventDefault(); // Prevent form submission (default behavior)
        if(handleTextSubmit(textInput) === -1){
            setShakeTimer(true)

            setTimeout(() => {
                setShakeTimer(false)
            }, 500); 
        }
        setTextInput('')
    };

    return (
        <div className={shakeTimer ? "text-input shake" : "text-input"}>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={textInput} 
                    onChange={handleInputChange} // Handle input changes
                    placeholder=""
                    className="input-field"
                />
            </form>
        </div>
    );
};

export default TextInput;
