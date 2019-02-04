import React from 'react';
import Button from '../Button/Button';
import './DigitsPad.css';

function DigitsPad(props) {
  // Add digits list
  let digitsArray = [];
  for (let i = 9; i >= 0; i--) {
    digitsArray.push(i)
  }
  // Add decimal separator
  digitsArray.push('.')

  const handleButtonClick = (digit, e) => {
    props.onClick(digit);
  }

  return (
    <div className="DigitsPad">
      {digitsArray.map(digit => (
        <Button key={digit} displayText={digit} onClick={(e) =>  handleButtonClick(digit, e) }/>
      ))}
    </div>
  )
}

export default DigitsPad;
