type Operator = '+' | '-' | '*' | '/' | '%' | '^' | '!' | 'u-';
type Token =
  | { type: 'number'; value: number }
  | { type: 'identifier'; value: string }
  | { type: 'function'; value: string }
  | { type: 'operator'; value: Operator }
  | { type: 'leftParen' }
  | { type: 'rightParen' };

const BINARY_OPERATORS = new Set<Operator>(['+', '-', '*', '/', '%', '^']);
const OPERATOR_PRECEDENCE: Record<Operator, number> = {
  '+': 1,
  '-': 1,
  '*': 2,
  '/': 2,
  '%': 2,
  '^': 4,
  'u-': 4,
  '!': 5,
};
const RIGHT_ASSOCIATIVE = new Set<Operator>(['^', 'u-']);
const log10 = Math.log10 ?? ((value: number) => Math.log(value) / Math.LN10);
const FUNCTIONS: Record<string, (value: number) => number> = {
  sin: Math.sin,
  cos: Math.cos,
  tan: Math.tan,
  log: log10,
  ln: Math.log,
  sqrt: Math.sqrt,
  exp: Math.exp,
};
const CONSTANTS: Record<string, number> = {
  pi: Math.PI,
  e: Math.E,
};

function isDigit(char: string) {
  return char >= '0' && char <= '9';
}

function isIdentifierStart(char: string) {
  return /[a-zA-Z_]/.test(char);
}

function isIdentifierPart(char: string) {
  return /[a-zA-Z0-9_]/.test(char);
}

function normalizeResult(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error('Invalid math result');
  }

  return value;
}

function factorial(value: number) {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error('Factorial requires a non-negative integer');
  }

  let result = 1;
  for (let current = 2; current <= value; current += 1) {
    result *= current;
  }

  return result;
}

function readNumber(expression: string, startIndex: number) {
  let index = startIndex;

  while (index < expression.length && isDigit(expression[index])) {
    index += 1;
  }

  if (expression[index] === '.') {
    index += 1;
    while (index < expression.length && isDigit(expression[index])) {
      index += 1;
    }
  }

  if ((expression[index] === 'e' || expression[index] === 'E') && index + 1 < expression.length) {
    let exponentIndex = index + 1;
    if (expression[exponentIndex] === '+' || expression[exponentIndex] === '-') {
      exponentIndex += 1;
    }

    const exponentStart = exponentIndex;
    while (exponentIndex < expression.length && isDigit(expression[exponentIndex])) {
      exponentIndex += 1;
    }

    if (exponentIndex > exponentStart) {
      index = exponentIndex;
    }
  }

  const value = Number(expression.slice(startIndex, index));
  if (!Number.isFinite(value)) {
    throw new Error('Invalid number');
  }

  return {
    token: { type: 'number', value } as Token,
    nextIndex: index,
  };
}

function readIdentifier(expression: string, startIndex: number) {
  let index = startIndex + 1;
  while (index < expression.length && isIdentifierPart(expression[index])) {
    index += 1;
  }

  const rawValue = expression.slice(startIndex, index);
  const value = rawValue.toLowerCase();
  let nextNonSpaceIndex = index;
  while (nextNonSpaceIndex < expression.length && expression[nextNonSpaceIndex] === ' ') {
    nextNonSpaceIndex += 1;
  }

  return {
    token: {
      type: FUNCTIONS[value] && expression[nextNonSpaceIndex] === '(' ? 'function' : 'identifier',
      value,
    } as Token,
    nextIndex: index,
  };
}

function tokenize(expression: string) {
  const tokens: Token[] = [];

  for (let index = 0; index < expression.length;) {
    const char = expression[index];

    if (char === ' ') {
      index += 1;
      continue;
    }

    if (isDigit(char) || char === '.') {
      const { token, nextIndex } = readNumber(expression, index);
      tokens.push(token);
      index = nextIndex;
      continue;
    }

    if (isIdentifierStart(char)) {
      const { token, nextIndex } = readIdentifier(expression, index);
      tokens.push(token);
      index = nextIndex;
      continue;
    }

    if (char === '(') {
      tokens.push({ type: 'leftParen' });
      index += 1;
      continue;
    }

    if (char === ')') {
      tokens.push({ type: 'rightParen' });
      index += 1;
      continue;
    }

    if ('+-*/%^!'.includes(char)) {
      tokens.push({ type: 'operator', value: char as Operator });
      index += 1;
      continue;
    }

    throw new Error(`Unexpected token: ${char}`);
  }

  return tokens;
}

function normalizeOperators(tokens: Token[]) {
  const normalized: Token[] = [];

  for (const token of tokens) {
    if (token.type === 'operator' && token.value === '-') {
      const previous = normalized[normalized.length - 1];
      const isUnary = !previous || previous.type === 'operator' || previous.type === 'leftParen';
      normalized.push({ type: 'operator', value: isUnary ? 'u-' : '-' });
      continue;
    }

    if (token.type === 'operator' && token.value === '+') {
      const previous = normalized[normalized.length - 1];
      const isUnary = !previous || previous.type === 'operator' || previous.type === 'leftParen';
      if (isUnary) {
        continue;
      }
    }

    normalized.push(token);
  }

  return normalized;
}

function toRpn(expression: string) {
  const tokens = normalizeOperators(tokenize(expression));
  const output: Token[] = [];
  const operators: Token[] = [];

  for (const token of tokens) {
    if (token.type === 'number' || token.type === 'identifier') {
      output.push(token);
      continue;
    }

    if (token.type === 'function') {
      operators.push(token);
      continue;
    }

    if (token.type === 'leftParen') {
      operators.push(token);
      continue;
    }

    if (token.type === 'rightParen') {
      while (operators.length > 0 && operators[operators.length - 1].type !== 'leftParen') {
        output.push(operators.pop()!);
      }

      if (operators.length === 0) {
        throw new Error('Mismatched parentheses');
      }

      operators.pop();
      if (operators[operators.length - 1]?.type === 'function') {
        output.push(operators.pop()!);
      }
      continue;
    }

    while (operators.length > 0) {
      const top = operators[operators.length - 1];
      if (top.type !== 'operator') {
        break;
      }

      const tokenPrecedence = OPERATOR_PRECEDENCE[token.value];
      const topPrecedence = OPERATOR_PRECEDENCE[top.value];
      const shouldPop = RIGHT_ASSOCIATIVE.has(token.value)
        ? tokenPrecedence < topPrecedence
        : tokenPrecedence <= topPrecedence;

      if (!shouldPop) {
        break;
      }

      output.push(operators.pop()!);
    }

    operators.push(token);
  }

  while (operators.length > 0) {
    const token = operators.pop()!;
    if (token.type === 'leftParen' || token.type === 'rightParen') {
      throw new Error('Mismatched parentheses');
    }
    output.push(token);
  }

  return output;
}

function resolveIdentifier(name: string, scope: Record<string, number>) {
  if (Object.prototype.hasOwnProperty.call(scope, name)) {
    return normalizeResult(scope[name]);
  }

  if (Object.prototype.hasOwnProperty.call(CONSTANTS, name)) {
    return CONSTANTS[name];
  }

  throw new Error(`Unknown identifier: ${name}`);
}

function evaluateRpn(rpnTokens: Token[], scope: Record<string, number>) {
  const stack: number[] = [];

  for (const token of rpnTokens) {
    if (token.type === 'number') {
      stack.push(token.value);
      continue;
    }

    if (token.type === 'identifier') {
      stack.push(resolveIdentifier(token.value, scope));
      continue;
    }

    if (token.type === 'function') {
      const value = stack.pop();
      if (value === undefined) {
        throw new Error('Invalid function call');
      }
      stack.push(normalizeResult(FUNCTIONS[token.value](value)));
      continue;
    }

    if (token.type !== 'operator') {
      throw new Error('Invalid expression');
    }

    if (token.value === '!') {
      const value = stack.pop();
      if (value === undefined) {
        throw new Error('Invalid factorial');
      }
      stack.push(factorial(value));
      continue;
    }

    if (token.value === 'u-') {
      const value = stack.pop();
      if (value === undefined) {
        throw new Error('Invalid unary operator');
      }
      stack.push(-value);
      continue;
    }

    const right = stack.pop();
    const left = stack.pop();
    if (left === undefined || right === undefined) {
      throw new Error('Invalid binary operator');
    }

    switch (token.value) {
      case '+':
        stack.push(left + right);
        break;
      case '-':
        stack.push(left - right);
        break;
      case '*':
        stack.push(left * right);
        break;
      case '/':
        stack.push(left / right);
        break;
      case '%':
        stack.push(left % right);
        break;
      case '^':
        stack.push(left ** right);
        break;
      default:
        throw new Error('Unsupported operator');
    }
  }

  if (stack.length !== 1) {
    throw new Error('Invalid expression');
  }

  return normalizeResult(stack[0]);
}

export function evaluateExpression(expression: string, scope: Record<string, number> = {}) {
  return evaluateRpn(toRpn(expression), scope);
}

export function compileExpression(expression: string) {
  const rpnTokens = toRpn(expression);

  return {
    evaluate(scope: Record<string, number> = {}) {
      return evaluateRpn(rpnTokens, scope);
    },
  };
}

export function roundExpressionResult(value: number, precision: number) {
  const rounded = Number(value.toFixed(precision));
  return rounded.toString();
}