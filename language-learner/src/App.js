import React, { useState, useEffect } from 'react';
import './App.css';
import hiraganaCharacters from './Data/hiragana_characters.json';
import hiraganaPhonetics from './Data/hiragana_phonetic.json';

// const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');
// const phonetics = [
//   "/eɪ/", "/bi:/", "/si:/", "/di:/", "/i:/", "/ɛf/", "/dʒi:/", "/eɪtʃ/", "/aɪ/", "/dʒeɪ/", "/keɪ/", "/ɛl/", "/ɛm/",
//   "/ɛn/", "/oʊ/", "/pi:/", "/kju:/", "/ɑ:r/", "/ɛs/", "/ti:/", "/ju:/", "/vi:/", "/ˈdʌbəlju:/", "/ɛks/", "/waɪ/", "/zi:/"
// ];

function App() {
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [shuffledCharacters, setShuffledCharacters] = useState([]);
  const [showPlaceholders, setShowPlaceholders] = useState(true);
  const [shuffleIntensity, setShuffleIntensity] = useState(0);


  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed((prevTime) => prevTime + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Calculate the number of elements to shuffle based on the slider value
    const elementsToShuffle = shuffleIntensity * 10;
    let shuffled = [...hiraganaCharacters];
  
    if (elementsToShuffle > 0) {
      // Select the portion of the array to shuffle
      const partToShuffle = shuffled.slice(0, elementsToShuffle);
      // Shuffle the selected portion
      partToShuffle.sort(() => Math.random() - 0.5);
      // Reassemble the array with the shuffled part at the beginning
      shuffled = [...partToShuffle, ...shuffled.slice(elementsToShuffle)];
    }
  
    setShuffledCharacters(shuffled);
  }, [shuffleIntensity]);
  

  useEffect(() => {
    const draggableElements = document.querySelectorAll('[draggable="true"]');

    const handleDragStart = () => {
      document.body.style.cursor = 'grabbing';
    };

    const handleDragEnd = () => {
      document.body.style.cursor = '';
    };

    draggableElements.forEach(el => {
      el.addEventListener('dragstart', handleDragStart);
      el.addEventListener('dragend', handleDragEnd);
    });

    // Cleanup to remove event listeners when component unmounts
    return () => {
      draggableElements.forEach(el => {
        el.removeEventListener('dragstart', handleDragStart);
        el.removeEventListener('dragend', handleDragEnd);
      });
    };
  }, []);

  const onDragStart = (e, character) => {
    e.dataTransfer.setData("id", `draggable-${character}`);
  };
  
  const onDrop = (e, slotLetter) => {
    e.preventDefault();
  
    let id = e.dataTransfer.getData("id");
    let draggableElement = document.getElementById(id);
    let droppedLetter = draggableElement.getAttribute("data-letter");
  
    // Define the target slot based on where the drop occurred
    let targetSlot;
    
    // Attempt to find the closest .grid-receiver-slot from the event target
    if (e.target.classList.contains("grid-receiver-slot")) {
      targetSlot = e.target; // Dropped directly on the receiver slot
    } else {
      // Find the closest .grid-item and then find the .grid-receiver-slot within it
      let closestGridItem = e.target.closest('.grid-item');
      if (closestGridItem) {
        targetSlot = closestGridItem.querySelector('.grid-receiver-slot');
      }
    }
  
    // Ensure there's a target slot and the dropped letter matches the intended slot letter
    if (targetSlot && droppedLetter === slotLetter) {
      targetSlot.appendChild(draggableElement);
      draggableElement.style.pointerEvents = "none"; // Prevents re-dragging
    }
  };
  
  

  const onDragOver = (e) => {
    e.preventDefault();
  };

  const resetGame = () => {
    setTimeElapsed(0);
    setShuffledCharacters([...hiraganaCharacters]);
    // Reset draggables
    hiraganaCharacters.forEach(character => {
      let draggableElement = document.getElementById(`draggable-${character}`);
      if (draggableElement && draggableElement.parentNode !== document.getElementById("shapesGrid")) {
        document.getElementById("shapesGrid").appendChild(draggableElement);
        draggableElement.style.pointerEvents = "all";
      }
    });
  };

  return (
    <div className="App">
      <h2>Drag Shapes to Match Sounds</h2>
      <div className="grid" onDragOver={onDragOver}>
        {hiraganaCharacters.map((character, index) => (
          character ? (
            <div key={index} className="grid-item" onDrop={(e) => onDrop(e, character)}>
              <div className="grid-receiver-slot">
                <div className={`placeholder ${!showPlaceholders ? 'hide-placeholder' : ''}`}>
                  {character}
                </div>
              </div>
              <div className="grid-phonetic">{hiraganaPhonetics[index]}</div>
            </div>
          ) : (
            <div key={index} className="grid-item gap"></div> // Placeholder for gaps
          )
        ))}
      </div>

      <h2>Character shapes (Drag Me!)</h2>
      <div id="shapesGrid" className="grid">
      {shuffledCharacters.map((hiraganaCharacter, index) => (
          hiraganaCharacter ? (
            <div
              key={index}
              id={`draggable-${hiraganaCharacter}`} // Ensure this matches the onDragStart id
              className="grid-shape"
              draggable
              onDragStart={(e) => onDragStart(e, hiraganaCharacter)} // Pass the hiragana character here
              data-letter={hiraganaCharacter} // Set to the hiragana character for accurate comparison
            >
              {hiraganaCharacter}
            </div>
          ) : <div key={index} className="grid-shape gap"></div> // Placeholder for gaps
        ))
      }
      </div>

      <button onClick={resetGame}>Reset Game</button>
      <div>Time: {timeElapsed} seconds</div>
      <button onClick={() => setShowPlaceholders(!showPlaceholders)}>
        {showPlaceholders ? 'Hide Placeholders' : 'Show Placeholders'}
      </button>
      <input
        type="range"
        min="0"
        max="5"
        value={shuffleIntensity}
        onChange={(e) => setShuffleIntensity(Number(e.target.value))}
      />


    </div>
  );
}

export default App;

