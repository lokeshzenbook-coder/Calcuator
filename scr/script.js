class Calculator {
    constructor(previousOperandTextElement, currentOperandTextElement) {
        this.previousOperandTextElement = previousOperandTextElement;
        this.currentOperandTextElement = currentOperandTextElement;
        this.clear();
        this.radians = false; // Default to degrees
    }

    clear() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = undefined;
        this.shouldResetScreen = false;
    }

    delete() {
        if (this.currentOperand === '0') return;
        if (this.currentOperand.length === 1) {
            this.currentOperand = '0';
        } else {
            this.currentOperand = this.currentOperand.toString().slice(0, -1);
        }
    }

    appendNumber(number) {
        if (this.shouldResetScreen) {
            this.currentOperand = '';
            this.shouldResetScreen = false;
        }
        if (number === '.' && this.currentOperand.includes('.')) return;
        if (this.currentOperand === '0' && number !== '.') {
            this.currentOperand = number.toString();
        } else {
            this.currentOperand = this.currentOperand.toString() + number.toString();
        }
    }

    chooseOperation(operation) {
        if (this.currentOperand === '') return;
        if (this.previousOperand !== '') {
            this.compute();
        }
        this.operation = operation;
        this.previousOperand = this.currentOperand;
        this.currentOperand = '';
    }

    compute() {
        let computation;
        const prev = parseFloat(this.previousOperand);
        const current = parseFloat(this.currentOperand);
        if (isNaN(prev) || isNaN(current)) return;

        switch (this.operation) {
            case '+':
                computation = prev + current;
                break;
            case '-':
                computation = prev - current;
                break;
            case '*':
                computation = prev * current;
                break;
            case '/':
                computation = prev / current;
                break;
            case 'pow': // x^y
                computation = Math.pow(prev, current);
                break;
            case '%':
                computation = prev % current;
                break;
            default:
                return;
        }
        this.currentOperand = computation;
        this.operation = undefined;
        this.previousOperand = '';
    }

    calculateScientific(action) {
        let current = parseFloat(this.currentOperand);
        if (isNaN(current)) return;

        let result;
        switch (action) {
            case 'sin':
                result = this.radians ? Math.sin(current) : Math.sin(current * Math.PI / 180);
                break;
            case 'cos':
                result = this.radians ? Math.cos(current) : Math.cos(current * Math.PI / 180);
                break;
            case 'tan':
                result = this.radians ? Math.tan(current) : Math.tan(current * Math.PI / 180);
                break;
            case 'log':
                result = Math.log10(current);
                break;
            case 'ln':
                result = Math.log(current);
                break;
            case 'sqrt':
                result = Math.sqrt(current);
                break;
            case 'pi':
                this.currentOperand = Math.PI;
                return;
            case 'e':
                this.currentOperand = Math.E;
                return;
            case 'deg':
                // Toggle mode button visual if needed, currently just internal state or basic toggle
                // Since there is no visual indicator in HTML for RAD/DEG, we'll just alert or console log for now, 
                // or just toggle. Let's toggle and show on display momentarily
                this.radians = !this.radians;
                const mode = this.radians ? "RAD" : "DEG";
                // Show mode briefly using a hack or just update button text? 
                // Let's just update the button text if there was one, or specific button.
                // The button says "deg", let's assume it switches to Radian mode.
                const btn = document.querySelector('[data-action="deg"]');
                if (btn) btn.innerText = this.radians ? "rad" : "deg";
                return;
            default:
                return;
        }

        // Handle precision errors slightly
        this.currentOperand = Math.round(result * 1000000000) / 1000000000;
        this.shouldResetScreen = true;
    }

    updateDisplay() {
        this.currentOperandTextElement.innerText = this.getDisplayNumber(this.currentOperand);
        if (this.operation != null) {
            this.previousOperandTextElement.innerText =
                `${this.getDisplayNumber(this.previousOperand)} ${this.getOperationSymbol(this.operation)}`;
        } else {
            this.previousOperandTextElement.innerText = '';
        }
    }

    getOperationSymbol(op) {
        if (op === 'pow') return '^';
        return op;
    }

    getDisplayNumber(number) {
        const stringNumber = number.toString();
        const integerDigits = parseFloat(stringNumber.split('.')[0]);
        const decimalDigits = stringNumber.split('.')[1];
        let integerDisplay;
        if (isNaN(integerDigits)) {
            integerDisplay = '';
        } else {
            integerDisplay = integerDigits.toLocaleString('en', { maximumFractionDigits: 0 });
        }
        if (decimalDigits != null) {
            return `${integerDisplay}.${decimalDigits}`;
        } else {
            return integerDisplay;
        }
    }
}

const previousOperandTextElement = document.getElementById('previous-operand');
const currentOperandTextElement = document.getElementById('current-operand');

const calculator = new Calculator(previousOperandTextElement, currentOperandTextElement);

// Event Listeners
document.querySelectorAll('[data-number]').forEach(button => {
    button.addEventListener('click', () => {
        calculator.appendNumber(button.innerText);
        calculator.updateDisplay();
    });
});

document.querySelectorAll('[data-action]').forEach(button => {
    button.addEventListener('click', () => {
        const action = button.dataset.action;

        if (action === 'calculate') {
            calculator.compute();
            calculator.updateDisplay();
            calculator.shouldResetScreen = true;
        } else if (action === 'clear') {
            calculator.clear();
            calculator.updateDisplay();
        } else if (action === 'delete') {
            calculator.delete();
            calculator.updateDisplay();
        } else if (['+', '-', '*', '/', '%'].includes(action)) {
            calculator.chooseOperation(action);
            calculator.updateDisplay();
        } else if (action === 'pow') {
            calculator.chooseOperation('pow');
            calculator.updateDisplay();
        } else {
            // Scientific functions
            calculator.calculateScientific(action);
            calculator.updateDisplay();
        }
    });
});

// Keyboard support
document.addEventListener('keydown', e => {
    if (e.key >= '0' && e.key <= '9' || e.key === '.') {
        calculator.appendNumber(e.key);
        calculator.updateDisplay();
    }
    if (e.key === '+' || e.key === '-' || e.key === '*' || e.key === '/') {
        calculator.chooseOperation(e.key);
        calculator.updateDisplay();
    }
    if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault(); // Prevent submitting forms if form existed
        calculator.compute();
        calculator.updateDisplay();
        calculator.shouldResetScreen = true;
    }
    if (e.key === 'Backspace') {
        calculator.delete();
        calculator.updateDisplay();
    }
    if (e.key === 'Escape') {
        calculator.clear();
        calculator.updateDisplay();
    }
});
