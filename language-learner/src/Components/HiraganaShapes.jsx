// HiraganaShapes.js
import React from 'react';

function HiraganaShapes({ hiraganaList, setDraggedItem }) {
  const handleDragStart = (character) => {
    setDraggedItem(character);
  };

  return (
    <div className="hiragana-shapes">
      {hiraganaList.map((item, index) => (
        <div
          key={index}
          draggable="true"
          onDragStart={() => handleDragStart(item)}
          className="hiragana-shape"
        >
          {item.character}
        </div>
      ))}
    </div>
  );
}

export default HiraganaShapes;
