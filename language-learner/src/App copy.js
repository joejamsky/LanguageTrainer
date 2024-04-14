import React, { useState, useEffect } from "react";
import "./Styles/App.scss";
import "./Styles/Header.scss";
import {hiraganaCharacters_tall,
  hiraganaPhonetics_tall,
  japanese_characters_vertical,
  japanese_characters_horizontal,
  japanese_characters_byshape_hiragana,
  japanese_characters_byshape_katakana
} from "./Misc/Constants.js"
import "@fortawesome/fontawesome-free/css/all.css";
import Header from "./Components/Header";
import DroppableGrid from "./Components/DroppableGrid";
import DraggableGrid from "./Components/DraggableGrid"; 
import UIControls from "./Components/UIControls";

function App() {
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [characters, setCharacters] = useState([]);
  const [shuffledCharacters, setShuffledCharacters] = useState([]);
  const [showHints, setShowHints] = useState({
                                                hiragana: false,
                                                katakana: false
                                              });
  const [shuffleIntensity, setShuffleIntensity] = useState(0);
  const [selectedCharacter, setSelectedCharacter] = useState(null); // New state for tracking selected item
  const [options, setOptions] = useState({
    rowsToSolve: 0,
    hints: {
      hiragana: false,
      katakana: false
    }
  })
  const [isVerticalLayout, setIsVerticalLayout] = useState(false);

  useEffect(() => {
    setCharacters(japanese_characters_vertical)
    setShuffledCharacters(japanese_characters_vertical)
  }, [])

  // useEffect(() => {
  //   const timer = setInterval(() => {
  //     setTimeElapsed((prevTime) => prevTime + 1);
  //   }, 1000);
  //   return () => clearInterval(timer);
  // }, []);

  // useEffect(() => {
  //   // Calculate the number of elements to shuffle based on the slider value
  //   const elementsToShuffle = shuffleIntensity * 10;
  //   let shuffled = [...hiraganaCharacters];

  //   if (elementsToShuffle > 0) {
  //     // Select the portion of the array to shuffle
  //     const partToShuffle = shuffled.slice(0, elementsToShuffle);
  //     // Shuffle the selected portion
  //     partToShuffle.sort(() => Math.random() - 0.5);
  //     // Reassemble the array with the shuffled part at the beginning
  //     shuffled = [...partToShuffle, ...shuffled.slice(elementsToShuffle)];
  //   }

  //   setShuffledCharacters(shuffled);
  // }, [shuffleIntensity]);

  // useEffect(() => {
  //   const draggableElements = document.querySelectorAll('[draggable="true"]');

  //   const handleDragStart = () => {
  //     document.body.style.cursor = "grabbing";
  //   };

  //   const handleDragEnd = () => {
  //     document.body.style.cursor = "";
  //   };

  //   draggableElements.forEach((el) => {
  //     el.addEventListener("dragstart", handleDragStart);
  //     el.addEventListener("dragend", handleDragEnd);
  //   });

  //   // Cleanup to remove event listeners when component unmounts
  //   return () => {
  //     draggableElements.forEach((el) => {
  //       el.removeEventListener("dragstart", handleDragStart);
  //       el.removeEventListener("dragend", handleDragEnd);
  //     });
  //   };
  // }, []);

  const onDragStart = (e, character) => {
    const draggableElement = document.getElementById(`draggable-${character}`);
    e.dataTransfer.setData("id", `draggable-${character}`);
    
    setTimeout(() => {
      // Timeout to ensure the class is applied after the item is picked up
      draggableElement.classList.add("dragging");
    }, 0);
  };

  const onDrop = (e, slotLetter) => {
    e.preventDefault();

    let id = e.dataTransfer.getData("id");
    let draggableElement = document.getElementById(id);
    let droppedLetter = draggableElement.getAttribute("data-letter");

    // Define the target slot based on where the drop occurred
    let targetSlot;

    // Attempt to find the closest .hint-container from the event target
    if (e.target.classList.contains("hint-container")) {
      targetSlot = e.target; // Dropped directly on the receiver slot
    } else {
      // Find the closest .top-grid-item and then find the .hint-container within it
      let closestGridItem = e.target.closest(".top-grid-item");
      if (closestGridItem) {
        targetSlot = closestGridItem.querySelector(".hint-container");
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
    const draggingElements = document.querySelectorAll(".dragging");
    draggingElements.forEach((el) => {
      el.classList.remove("dragging");
    });
  };

  const toggleSelectCharacter = (character) => {
    if (selectedCharacter === character) {
      setSelectedCharacter(null); // Deselect if the same character is clicked again
    } else {
      setSelectedCharacter(character); // Select a new character
    }
  };

  // const onPlaceCharacter = (slotLetter) => {
  //   if (selectedCharacter && selectedCharacter === slotLetter) {
  //     const draggableElement = document.getElementById(
  //       `draggable-${selectedCharacter}`
  //     );
  //     // Perform placement logic here, similar to your onDrop logic but adapted for click interactions
  //     // You may need to adjust the logic to fit this context
  //     draggableElement.style.pointerEvents = "none"; // Prevents re-dragging
  //     setSelectedCharacter(null); // Reset the selection state
  //   }
  // };

  // const resetGame = () => {
  //   setTimeElapsed(0);

  //   // Reset the pointer events for all draggable elements to make them draggable again
  //   const draggableElements = document.querySelectorAll(".grid-shape");
  //   draggableElements.forEach((el) => {
  //     if (el.parentNode !== document.getElementById("shapesGrid")) {
  //       document.getElementById("shapesGrid").appendChild(el);
  //     }
  //     el.style.pointerEvents = "all";
  //   });

  //   let shuffled = [...hiraganaCharacters];

  //   // Only shuffle if shuffleIntensity is greater than 0
  //   if (shuffleIntensity > 0) {
  //     const elementsToShuffle = shuffleIntensity * 10; // Adjust based on your preference
  //     // Shuffle logic
  //     if (elementsToShuffle > 0) {
  //       // Shuffle only the specified number of elements based on shuffleIntensity
  //       const partToShuffle = shuffled.slice(0, elementsToShuffle);
  //       partToShuffle.sort(() => Math.random() - 0.5);
  //       shuffled = [...partToShuffle, ...shuffled.slice(elementsToShuffle)];
  //     } else {
  //       // If elementsToShuffle is 0, keep the original order (i.e., no shuffle)
  //       shuffled = [...hiraganaCharacters];
  //     }
  //   }

  //   setShuffledCharacters(shuffled);
  // };

  return (
    <div className="App">
      {/* <Header /> */}
      <DroppableGrid
        characterData={characters}
        onDrop={onDrop}
        onDragOver={onDragOver}
        showHints={showHints}
        isVerticalLayout={isVerticalLayout}
      />
      <hr></hr>
      {/* <button className='temp-button' onClick={() => setIsVerticalLayout(!isVerticalLayout)}>
        Toggle Layout
      </button> */}

      <DraggableGrid
        shuffledCharacters={shuffledCharacters}
        onDragStart={onDragStart}
        isVerticalLayout={isVerticalLayout}
      />
      {/* <UIControls /> */}
      {/* <button className="" onClick={() => setCharacters(japanese_characters_horizontal)}>
        <i className="fa-solid fa-shapes"></i>
      </button>
      <button className="" onClick={() => setCharacters(japanese_characters_byshape_hiragana)}>
        <i className="fa-solid fa-ear-listen"></i>
      </button> */}
    </div>
  );
}

export default App;
