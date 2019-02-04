import React from 'react';
import './CalculatorDisplay.css';

const CalculatorDisplay = React.forwardRef((props, ref) => {
  
  return (<div className="CalculatorDisplay">
    <div className="calculation-wrapper">
      <span className={props.isResultAnimated ? "animated " : ""}
        onAnimationEnd={props.onAnimationEnd}>
        {props.lastCalculation}
      </span></div>
    <label htmlFor="calculation" className="visuallyHidden">Result: </label>
    <div className="input-wrapper">
      <input id="calculation" name="calculation" type="text"
        className={props.isError ? "invalid " : ""}
        ref={ref}
        value={props.currentCalculation}
        onChange={props.onChange}
        onClick={props.onClick}
        onKeyUp={props.onChange}
        onPaste={props.onPaste}
        onDrop={props.onDrop}
        onDragOver={props.onDragOver}
        onAnimationEnd={props.onAnimationEnd} />
    </div>
</div>);
})

export default CalculatorDisplay;