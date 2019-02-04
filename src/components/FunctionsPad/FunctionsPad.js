import React from 'react';
import Button from '../Button/Button';
import './FunctionsPad.css';

function FunctionsPad(props) {
  // Add functions list
  let functionsArray = [
    'C',
    '\u279c' /* ➜ */,
    '\u00F7' /* ÷ */,
    '\u00D7' /* × */,
    '\u2212' /* − */,
    '+',
    '=',
  ];

  const handleButtonClick = (symbol, e) => {
    props.onClick(symbol);
  }

  return (
    <div className="FunctionsPad">
      {functionsArray.map(symbol => (
        <Button key={symbol} displayText={symbol} onClick={(e) =>  handleButtonClick(symbol, e) }/>
      ))}
    </div>
  )
}

export default FunctionsPad;
