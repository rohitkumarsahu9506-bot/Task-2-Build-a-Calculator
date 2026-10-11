const screen = document.getElementById("screen");
const history = document.getElementById("history");
const buttons = document.querySelector(".buttons");

let expression = "";
let justCalculated = false;

// Display update karna
function updateScreen() {
    screen.value = expression || "0";
    updatePreview();
}

// Mathematical expression calculate karna
function calculateExpression(input) {
    let pos = 0;

    function parseExpression() {
        let result = parseTerm();

        while (input[pos] === "+" || input[pos] === "-") {
            const operator = input[pos++];
            const right = parseTerm();

            result = operator === "+"
                ? result + right
                : result - right;
        }

        return result;
    }

    function parseTerm() {
        let result = parseUnary();

        while (
            input[pos] === "*" ||
            input[pos] === "/" ||
            input[pos] === "%"
        ) {
            const operator = input[pos++];
            const right = parseUnary();

            if (operator === "*") {
                result *= right;
            } else if (operator === "/") {
                if (right === 0) {
                    throw new Error("Cannot divide by zero");
                }
                result /= right;
            } else {
                if (right === 0) {
                    throw new Error("Cannot divide by zero");
                }
                result %= right;
            }
        }

        return result;
    }

    function parseUnary() {
        if (input[pos] === "+") {
            pos++;
            return parseUnary();
        }

        if (input[pos] === "-") {
            pos++;
            return -parseUnary();
        }

        return parseNumber();
    }

    function parseNumber() {
        const start = pos;
        let dots = 0;

        while (
            pos < input.length &&
            ((input[pos] >= "0" && input[pos] <= "9") ||
                input[pos] === ".")
        ) {
            if (input[pos] === ".") {
                dots++;
                if (dots > 1) {
                    throw new Error("Invalid number");
                }
            }
            pos++;
        }

        if (start === pos || input.slice(start, pos) === ".") {
            throw new Error("Invalid expression");
        }

        return Number(input.slice(start, pos));
    }

    const result = parseExpression();

    if (pos !== input.length || !Number.isFinite(result)) {
        throw new Error("Invalid expression");
    }

    return result;
}

// Result ko clean format mein dikhana
function formatResult(number) {
    if (!Number.isFinite(number)) {
        throw new Error("Invalid result");
    }

    return String(Number(number.toPrecision(12)));
}

// Typing ke saath live preview
function updatePreview() {
    if (!expression) {
        history.textContent = "";
        return;
    }

    try {
        const result = calculateExpression(expression);
        history.textContent = "= " + formatResult(result);
    } catch {
        history.textContent = "";
    }
}

// Number ya operator add karna
function addValue(value) {
    if (justCalculated) {
        if ("0123456789.".includes(value)) {
            expression = "";
        }
        justCalculated = false;
    }

    if ("0123456789".includes(value) && value.length === 1) {
        if (expression === "0") {
            expression = value;
        } else {
            expression += value;
        }
    } else if (value === ".") {
        const currentNumber = expression.split(/[+\-*/%]/).pop();

        if (!currentNumber.includes(".")) {
            expression += currentNumber === "" ? "0." : ".";
        }
    } else {
        expression += value;
    }

    updateScreen();
}

// AC aur DEL buttons
function clearCalculator() {
    expression = "";
    justCalculated = false;
    history.textContent = "";
    updateScreen();
}

function deleteLast() {
    expression = expression.slice(0, -1);
    justCalculated = false;
    updateScreen();
}

// Final answer
function calculate() {
    if (!expression) return;

    try {
        const answer = formatResult(
            calculateExpression(expression)
        );

        history.textContent = expression + " =";
        expression = answer;
        screen.value = answer;
        justCalculated = true;
    } catch {
        history.textContent = "Invalid calculation";
        expression = "";
        screen.value = "Error";
        justCalculated = true;
    }
}

// Button clicks handle karna
buttons.addEventListener("click", function (event) {
    const button = event.target.closest("button");

    if (!button) return;

    const action = button.dataset.action;
    const value = button.dataset.value;

    if (action === "clear") {
        clearCalculator();
    } else if (action === "delete") {
        deleteLast();
    } else if (action === "calculate") {
        calculate();
    } else if (value !== undefined) {
        addValue(value);
    }
});

// Keyboard support
document.addEventListener("keydown", function (event) {
    const key = event.key;

    if (/^[0-9]$/.test(key)) {
        addValue(key);
    } else if (key === ".") {
        addValue(".");
    } else if (["+", "-", "*", "/", "%"].includes(key)) {
        addValue(key);
    } else if (key === "Enter" || key === "=") {
        event.preventDefault();
        calculate();
    } else if (key === "Backspace") {
        deleteLast();
    } else if (key === "Escape") {
        clearCalculator();
    }
});

updateScreen();