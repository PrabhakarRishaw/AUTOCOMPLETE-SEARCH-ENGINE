import React from 'react';
import './SuggestionList.css';

const SuggestionList = ({ suggestions, onSelect }) => {
  if (suggestions.length === 0) {
    return (
      <div className="suggestion-list empty">
        <p>No suggestions available</p>
      </div>
    );
  }

  return (
    <div className="suggestion-list">
      <ul>
        {suggestions.map((suggestion, index) => (
          <li
            key={index}
            className="suggestion-item"
            onClick={() => onSelect(suggestion)}
          >
            <span className="suggestion-text">{suggestion}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SuggestionList;
