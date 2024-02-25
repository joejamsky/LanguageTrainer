import React, { useState, useEffect } from 'react';
import './App.css';
import hiraganaCharacters from './Data/hiragana_characters.json';
import hiraganaPhonetics from './Data/hiragana_phonetic.json';
import '@fortawesome/fontawesome-free/css/all.css';


function App() {
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [shuffledCharacters, setShuffledCharacters] = useState([]);
  const [showPlaceholders, setShowPlaceholders] = useState(true);
  const [shuffleIntensity, setShuffleIntensity] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

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
    const draggableElement = document.getElementById(`draggable-${character}`);
    e.dataTransfer.setData("id", `draggable-${character}`);
    
    // Optionally, apply a style to indicate dragging
    setTimeout(() => { // Timeout to ensure the class is applied after the item is picked up
        draggableElement.classList.add('dragging');
    }, 0);
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
    const draggingElements = document.querySelectorAll('.dragging');
    draggingElements.forEach(el => {
        el.classList.remove('dragging');
    });
  };

  const resetGame = () => {
    setTimeElapsed(0);

    // Reset the pointer events for all draggable elements to make them draggable again
    const draggableElements = document.querySelectorAll('.grid-shape');
    draggableElements.forEach(el => {
        if (el.parentNode !== document.getElementById("shapesGrid")) {
            document.getElementById("shapesGrid").appendChild(el);
        }
        el.style.pointerEvents = "all";
    });

    let shuffled = [...hiraganaCharacters];

    // Only shuffle if shuffleIntensity is greater than 0
    if (shuffleIntensity > 0) {
        const elementsToShuffle = shuffleIntensity * 10; // Adjust based on your preference
        // Shuffle logic
        if (elementsToShuffle > 0) {
            // Shuffle only the specified number of elements based on shuffleIntensity
            const partToShuffle = shuffled.slice(0, elementsToShuffle);
            partToShuffle.sort(() => Math.random() - 0.5);
            shuffled = [...partToShuffle, ...shuffled.slice(elementsToShuffle)];
        } else {
            // If elementsToShuffle is 0, keep the original order (i.e., no shuffle)
            shuffled = [...hiraganaCharacters];
        }
    }

    setShuffledCharacters(shuffled);

    // Optionally, if you want to ensure the placeholders are shown upon reset:
    setShowPlaceholders(true);
  };



  return (
    <div className="App">


      <div className="dropdown">
        <button onClick={toggleDropdown}>
          Select <i className="fa fa-caret-down" aria-hidden="true"></i>
        </button>
        {isDropdownOpen && (
          <div className="dropdown-content">
            <label for="languages">List of Languages:</label>
            <select name="" id="languages">
              <option value="">Romanji</option>
              <option value="">Hiragana</option>
              <option value="">Katakana</option>
            </select>
          </div>
        )}
      </div>

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

      {/* <div class="divider"></div> */}

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

      <div className="ui">
        <button className="reset-btn" onClick={resetGame}>&#10227;</button>

        
        <button onClick={() => setShowPlaceholders(!showPlaceholders)}>
          {showPlaceholders ? (
            <span>Hint: <i className="fa-regular fa-eye"></i></span>
          ) : (
            <span>Hint: <i className="fa-regular fa-eye-slash"></i></span>
          )}
        </button>

        <div className="difficulty-container">
          <i class="fa-solid fa-shuffle"></i>
          <input
            type="range"
            min="0"
            max="5"
            value={shuffleIntensity}
            className="difficulty-slider"
            onChange={(e) => setShuffleIntensity(Number(e.target.value))}
          />
        </div>

        <div className="time">Time: {timeElapsed} seconds</div>
      </div>



    </div>
  );
}

export default App;

