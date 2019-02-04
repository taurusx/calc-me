const CalcUtils = {
  
  addCharacters(expression, posStart, posEnd, chars) {
    chars += "";
    expression += "";
    if ((posStart === null && posEnd === null) || expression === '0') {
      posStart = 0;
      posEnd = expression.length;
    }

    let exprArr = expression.split("")
    exprArr.splice(posStart, posEnd - posStart, chars)
    return exprArr.join("")
  },

  replaceWithMap(data, map) {
    data += "";
    let regex = [];
    for(let key in map)
        regex.push(key.replace(/[=:[\]/{}()*+?.\\^$|-]/g, "\\$&"));
    
    data = data.replace(new RegExp(regex.join('|'),"g"), function(word){
      return map[word];
    });
    return data;
  },

  validateInput(input) {
    input += "";
    if (input.length === 0) return 'empty';
    // Simple test for a single char
    if (input.length === 1) {
      if (/[\d]/.test(input)) return 'number';
      if (/[-.]/.test(input)) return input;
    }
    // Multiple chars input
    // Allowing thousands separator ',' or ' ': 
    // /^(-?[1-9]\d{0,2}([, ]\d{3})*(?:\.\d+(?:e-?\d+)?)?)$/
    let numberRegex = /^(-?[1-9]\d*(?:\.\d+(?:e-?\d+)?)?)$/; 
    let numberSmallRegex = /^(-?0\.\d+(?:e-?\d+)?)$/; // (-1, 1)
    let numberWeakERegex = /^(-?[1-9]\d*(?:\.\d+e-?)?)$/;
    let numberWeakRegex = /^(-?[1-9]\d*\.)$/;
    let numberSmallWeakERegex = /^(-?0\.\d+e-?)$/;
    let numberSmallWeakRegex = /^(-?0\.)$/;
    if (numberRegex.test(input)) return 'number';
    if (numberSmallRegex.test(input)) return 'number';
    if (numberWeakERegex.test(input) ||
      numberWeakRegex.test(input) ||
      numberSmallWeakERegex.test(input) ||
      numberSmallWeakRegex.test(input)) return 'weak-number';
    return false;
  },

  formatResult(input) {
    input += "";
    let numberRegex = /^(?:(-?\d+(?:\d{3})*)(\.\d+(?:e-?\d+)?)?)/;
    let array = numberRegex.exec(input);
    if (!array[1]) return;
    let digitsArray = array[1].split("")
    const mod = digitsArray.length % 3;
    const steps = Math.ceil(digitsArray.length / 3) - 1;
    if (mod !== 0 && steps > 0) {
      input = digitsArray.slice(0, mod).join("") + " ";
    }
    if (mod === 0 && steps > 0) {
      input = "";
    }
    if (steps > 0) {
      for (let i = mod; i < digitsArray.length; i+=3) {
        input += digitsArray.slice(i, i + 3).join("")
        if (i < digitsArray.length - 3) input += " ";
      }
    }
    if (steps === 0) {
      input = array[1]
    }
    if (!array[2]) return input;
    return input + array[2];
  },

  calculateResult(state) {
    const a = Number(state.tempResult);
    let b = state.inputValue;
    if (CalcUtils.validateInput(b) !== 'number') return false;
    b = Number(b);
    let result;
    switch (state.tempOperator) {
      // Read mathematical operator
      case '\u2212' /* − */:
        result = a - b;
        break;
      case '\u00F7' /* ÷ */:
        if (b === 0) return false;
        result = a / b;
        break;
      case '\u00D7' /* × */:
        result = a * b;
        break;
      case '+':
        result = a + b;
        break;
      default:
        break;
    }
    result = Number(result);
    result = parseFloat(result.toFixed(8));
    return result.toString();
  }
}

export default CalcUtils;