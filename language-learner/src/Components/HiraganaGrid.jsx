// HiraganaGrid.js
import React from 'react';

function HiraganaGrid({ hiraganaList, hintsEnabled }) {
  return (
    <div className="hiragana-grid">
      {hiraganaList.map((item, index) => (
        <div key={index} className="grid-item">
          <div className={`placeholder ${hintsEnabled ? '' : 'hide'}`}>
            {/* Placeholder for hiragana character */}
          </div>
          <div className="phonetic-sound">{item.sound}</div>
        </div>
      ))}
    </div>
  );
}

export default HiraganaGrid;
