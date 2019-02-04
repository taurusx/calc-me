import React, { Component } from 'react';
import './App.css';
import CalcUtils from './util/CalcUtils'
import CalculatorDisplay from './components/CalculatorDisplay/CalculatorDisplay';
import DigitsPad from './components/DigitsPad/DigitsPad';
import Pads from './components/Pads/Pads';
import FunctionsPad from './components/FunctionsPad/FunctionsPad';

class App extends Component {
  constructor(props) {
    super(props);
    this.inputRef = React.createRef();
    this.state = {
      lastCalculation: null,
      tempResult: null,
      tempOperator: null,
      inputValue: "0",
      caretSelectionStart: null,
      caretSelectionEnd: null, 
      isError: false,
      isResultAnimated: false
    }
    this.handleDigitsInput = this.handleDigitsInput.bind(this);
    this.handleFunctionsInput = this.handleFunctionsInput.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleWindowClick = this.handleWindowClick.bind(this);
    this.handleKeyboardEvents = this.handleKeyboardEvents.bind(this);
    this.removeAnimation = this.removeAnimation.bind(this);
    this.updateLastCalculation = this.updateLastCalculation.bind(this);
  }

  handleInputChange(event) {
    const el = event.target;
    // Prevent dropping to input
    if (event.type === 'drop' || event.type === 'dragover') {
      event.preventDefault();
      const transfer = event.dataTransfer;
      transfer.dropEffect = 'none';
      el.focus();
    }
    // Allow pasting only if valid clipboard text
    if (event.type === 'paste') {
      event.preventDefault();
      const transfer = event.clipboardData;
      const pasteData = transfer.getData("text/plain");
      if (CalcUtils.validateInput(pasteData)) {
        this.handleDigitsInput(pasteData)
      } else {
        console.log("Error: pasting \"" + pasteData + "\" into input field - causes incorrect number format.");
        this.setState({ isError: true })
        this.inputRef.current.focus();
        if (this.state.inputValue === '0') this.inputRef.current.select();
      }
    }
    // Read current caret position after click or keyboard event:
    if (event.type === 'click' || event.type === 'keyup') {
        this.setState({
        caretSelectionStart: el.selectionStart,
        caretSelectionEnd: el.selectionEnd
      })
    }
    // Validate data on change
    if (event.type === 'change') {
      if (CalcUtils.validateInput(el.value)) {
        this.updateLastCalculation(el.value);
        this.setState({
            inputValue: el.value,
            caretSelectionStart: el.selectionStart,
            caretSelectionEnd: el.selectionEnd
          })
      } else {
        this.setState({ isError: true })
        this.inputRef.current.focus();
        if (this.state.inputValue === '0') this.inputRef.current.select();
      }
    }
  }

  handleWindowClick(event) {
    // When clicked on result area - do nothing to allow copying
    if (event.target.tagName.toLowerCase() === 'span' || event.target.className.split(" ")[0].toLowerCase() === 'calculation-wrapper') { 
      return;
    }
    // Display error when misclicked (not on buttons nor on input)
    if (event.target.className.split(" ")[0].toLowerCase() === 'digitspad' || 
      event.target.className.split(" ")[0].toLowerCase() === 'functionspad') {
      this.setState({ isError: true })
      return;
    }
    // When clicked outside buttons area - move caret to the end of input
    if (event.target.tagName.toLowerCase() !== 'button' &&
      event.target.tagName.toLowerCase() !== 'input') {
      const index = this.state.inputValue.length;
      this.setState({
        caretSelectionStart: index,
        caretSelectionEnd: index
      })
      this.setState({ isError: true })
    }
  }

  handleKeyboardEvents(event) {
    const key = event.key;
    if (event.ctrlKey && (key === 'z' || key === 'x' ||
      key === 'c' || key === 'v'))
      return true;
    if (event.shiftKey && (key === 'ArrowRight' || key === 'ArrowLeft' ||
      key === 'ArrowUp' || key === 'ArrowDown'))
      return true;
    if (key === 'ArrowLeft' || key === 'ArrowRight' ||
      key === 'ArrowUp' || key === 'ArrowDown' ||
      key === 'Home' || key === 'End') return true;
    if (event.target.tagName.toLowerCase() !== 'input') {
      this.inputRef.current.focus();
    }
    event.preventDefault();
    if (key === 'Escape') {
      const index = this.state.inputValue.length;
      this.setState({
        caretSelectionStart: index,
        caretSelectionEnd: index
      })
    }
    if (key >= '0' && key <= '9') this.handleDigitsInput(key);
    if (key === '.' || key === ',') this.handleDigitsInput('.');
    if (key === '=' || key === '+') this.handleFunctionsInput(key);
    if (key === '/') this.handleFunctionsInput('\u00F7' /* ÷ */);
    if (key === '*') this.handleFunctionsInput('\u00D7' /* × */);
    if (key === '-') this.handleFunctionsInput('\u2212' /* − */);
    if (key === 'Delete') this.handleFunctionsInput('C');
    if (key === 'Backspace') this.handleFunctionsInput('\u279c' /* ➜ */);
    if (key === 'Enter') this.handleFunctionsInput('=');
    return false;
  }

  handleDigitsInput(digits) {
    digits += "";
    digits = digits.trim().replace(new RegExp(' ', 'g'), '');
    if (digits !== "" && !CalcUtils.validateInput(digits)) return false;
    if (digits === '.') {
      if (this.state.inputValue === "" || (this.state.inputValue === '0' && !this.state.caretSelectionStart)) {
        digits = "0."
      }
    }
    // Insert digits
    let newValue = CalcUtils.addCharacters(
      this.state.inputValue,
      this.state.caretSelectionStart,
      this.state.caretSelectionEnd,
      digits
    )
    if (!CalcUtils.validateInput(newValue)) return false;
    this.updateLastCalculation(newValue);
    this.setState(prevState => {
      // Update caret position in input field
      digits += "";
      this.inputRef.current.setSelectionStart =
        prevState.caretSelectionStart + digits.length;
      this.inputRef.current.setSelectionEnd =
        prevState.caretSelectionStart + digits.length;
      // Update state
      return {
        inputValue: newValue,
        caretSelectionStart: prevState.caretSelectionStart + digits.length,
        caretSelectionEnd: prevState.caretSelectionStart + digits.length
      }
    });
  }

  handleFunctionsInput(symbol) {
    switch (symbol) {
      // Clear input on first click, clear all results on second click
      case 'C':
        if (this.state.tempOperator && this.state.inputValue === '0') {
          this.setState({
            lastCalculation: null,
            tempResult: null,
            tempOperator: null
          })
        } else if (this.state.caretSelectionEnd === null &&
          this.state.caretSelectionStart === null) {
          this.setState({
            lastCalculation: null,
            tempResult: null,
            tempOperator: null
          })
        }

        this.setState({
          inputValue: "0",
          caretSelectionStart: null,
          caretSelectionEnd: null
        })
        
        this.updateLastCalculation("");

        if (this.state.inputValue === '0' && this.state.lastCalculation === null) {
          this.setState({
            tempOperator: null
          })
        }
        break;
      // Remove last digit or current selection
      case '\u279c' /* ➜ */:
        if (this.state.caretSelectionStart === this.state.caretSelectionEnd && this.state.caretSelectionStart > 0) {
          // Insert empty string
          const startIndex = this.state.caretSelectionStart - 1;
          const endIndex = this.state.caretSelectionStart;
          let newValue = CalcUtils.addCharacters(
            this.state.inputValue,
            startIndex,
            endIndex,
            ""
          )
          if (!CalcUtils.validateInput(newValue)) return false;
          this.updateLastCalculation(newValue);
          this.setState({
            inputValue: newValue,
            caretSelectionStart: startIndex,
            caretSelectionEnd: startIndex
          })
          if (newValue === '0') {
            this.setState({
              caretSelectionStart: null,
              caretSelectionEnd: null
            })
          }
          break;
        } else if (this.state.caretSelectionStart === null) { 
          this.setState({
            caretSelectionStart: 0,
            caretSelectionEnd: 1
          })
        } 
        // Remove by inserting empty string
        this.handleDigitsInput("");
        break;
      // Set mathematical operator
      case '\u2212' /* − */:
        if ((this.state.caretSelectionStart === null || this.state.caretSelectionStart === 0 || this.state.caretSelectionStart === 1 ) && this.state.inputValue !== "0") {
          // Switch number's +/- sign
          this.setState(prevState => {
            if (CalcUtils.validateInput("-" + prevState.inputValue))
              return {
                inputValue: "-" + prevState.inputValue,
                caretSelectionStart: 1,
                caretSelectionEnd: 1
              }
            if (Number(prevState.inputValue) < 0)
              return {
                inputValue: (Number(prevState.inputValue) * (-1)).toString(),
                caretSelectionStart: 0,
                caretSelectionEnd: 0
              }
          })
          break;
        }
        // fall through
      case '\u00F7' /* ÷ */:
      case '\u00D7' /* × */:
      case '+':
        if (this.state.tempOperator === null || this.state.tempOperator === 'C') {
          // Check if input is completed (not 'weak-number')
          if (CalcUtils.validateInput(this.state.inputValue) === 'number') {
            this.setState({
              lastCalculation: CalcUtils.formatResult(this.state.inputValue) + " " + symbol + " ...",
              tempResult: this.state.inputValue,
              tempOperator: symbol,
              inputValue: "0",
              caretSelectionStart: null,
              caretSelectionEnd: null
            })
          } else {
            this.setState({
              isError: true
            })
          }
        } else {
          if (this.state.inputValue === "0") {
            this.setState({
              lastCalculation: CalcUtils.formatResult(this.state.tempResult) + " " + symbol + " ...",
              tempOperator: symbol
            })
          } else {
            // Check if input is completed (not 'number-weak')
            if (CalcUtils.validateInput(this.state.inputValue) === 'number') {
              const result = CalcUtils.calculateResult(this.state);
              if (!result) {
                this.setState({ isError: true });
                break;
              }
              this.setState({
                lastCalculation: CalcUtils.formatResult(result) + " " + symbol + " ...",
                tempResult: result,
                tempOperator: symbol,
                inputValue: "0",
                caretSelectionStart: null,
                caretSelectionEnd: null
              })
            }
          }
        }
          break;
      case '=':
        if (this.state.tempOperator === null || this.state.tempOperator === 'C') {
          break;
        }
        const result = CalcUtils.calculateResult(this.state);
        if (!result) {
          this.setState({ isError: true });
          break;
        }
        this.setState({
          lastCalculation: "Ans  =  " + CalcUtils.formatResult(result),
          tempResult: result,
          tempOperator: null,
          inputValue: result,
          caretSelectionStart: null,
          caretSelectionEnd: null,
          isResultAnimated: true
        })
        break;
    
      default:
        break;
    }
  }

  removeAnimation() {
    if (this.state.isResultAnimated) this.setState({ isResultAnimated: false });
    if (this.state.isError) this.setState({ isError: false });
  }

  updateLastCalculation(newValue) {
    this.setState(prevState => {
      let prevCalculation = "";
      if (prevState.tempResult && prevState.tempOperator) {
        prevCalculation = CalcUtils.formatResult(prevState.tempResult) + " " + prevState.tempOperator + " ";
      }
      if (prevState.tempOperator && newValue === "")
        newValue = "...";
      return {
        lastCalculation: prevCalculation + newValue
      }
    })
  }

  componentDidMount() {
    const inputField = this.inputRef.current;
    inputField.focus();
    inputField.select();
  }

  componentDidUpdate() {
    const inputField = this.inputRef.current;
    inputField.focus();
    if (this.state.inputValue === '0') {
      inputField.select();
      return;
    }
    inputField.setSelectionRange(this.state.caretSelectionStart, this.state.caretSelectionEnd);
  }

  render() {
    return (
      <div className="App"
        onClick={this.handleWindowClick}
        onKeyDown={this.handleKeyboardEvents}>
        <header className="App-header">
          <CalculatorDisplay lastCalculation={this.state.lastCalculation}
            currentCalculation={this.state.inputValue}
            isError={this.state.isError}
            isResultAnimated={this.state.isResultAnimated}
            ref={this.inputRef}
            onChange={this.handleInputChange}
            onClick={this.handleInputChange}
            onPaste={this.handleInputChange}
            onDrop={this.handleInputChange}
            onDragOver={this.handleInputChange}
            onAnimationEnd={this.removeAnimation} />
        </header>
        <section>
          <Pads>
            <DigitsPad onClick={this.handleDigitsInput}/>
            <FunctionsPad onClick={this.handleFunctionsInput}/>
          </Pads>
        </section>
      </div>
    );
  }
}

export default App;
