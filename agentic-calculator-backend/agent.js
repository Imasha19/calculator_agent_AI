import dotenv from "dotenv";

dotenv.config();

export async function runAgent(prompt) {
  try {
    console.log("Processing prompt:", prompt);
    
  // Extract and process the mathematical expression from the prompt
  const mathExpression = extractAndProcessExpression(prompt);
  
  if (mathExpression) {
    try {
      // Use Function constructor with Math.pow available
      const result = Function('"use strict"; const Math = globalThis.Math; return (' + mathExpression + ')')();
      
      // Format the result to avoid floating point issues
      const formattedResult = Number.isInteger(result) ? result : parseFloat(result.toFixed(2));
      
      return `${mathExpression} = ${formattedResult}`;
    } catch (e) {
      console.error("Calculation error:", e.message);
      return `Invalid expression: ${mathExpression}. Please check your math notation.`;
    }
  }    return `I'm a calculator agent. I can solve:
- Basic operations: 5 + 3 * 2
- Parentheses: (10 + 5) * 2
- Percentages: 15% of 300
- Exponents: 2^10
- Complex expressions: 25 * 4 + 18`;
  } catch (error) {
    console.error("Agent error:", error);
    throw new Error(`Agent processing failed: ${error.message}`);
  }
}

function extractAndProcessExpression(prompt) {
  let expression = prompt.toLowerCase();
  
  // Handle percentage calculations (e.g., "15% of 300" -> "15/100*300")
  expression = expression.replace(/(\d+(?:\.\d+)?)\s*%\s+of\s+(\d+(?:\.\d+)?)/gi, '($1/100)*$2');
  expression = expression.replace(/(\d+(?:\.\d+)?)\s*per\s+cent\s+of\s+(\d+(?:\.\d+)?)/gi, '($1/100)*$2');
  
  // Replace word operators with symbols
  expression = expression.replace(/\bplus\b/g, '+');
  expression = expression.replace(/\bminus\b/g, '-');
  expression = expression.replace(/\btimes\b/g, '*');
  expression = expression.replace(/\bdivided\s+by\b/g, '/');
  expression = expression.replace(/\bdivide\b/g, '/');
  
  // Remove question words and extra text
  expression = expression.replace(/\bwhat\s+is\b/g, '');
  expression = expression.replace(/\bcalculate\b/g, '');
  expression = expression.replace(/\bgive\s+answer\s+for\b/g, '');
  expression = expression.replace(/\banswer\s+for\b/g, '');
  expression = expression.replace(/[?!.]/g, '');
  
  // Extract the mathematical expression (keep numbers, operators, parentheses, and caret)
  let cleaned = expression.replace(/[^0-9+\-*/.()^%]/g, ' ').trim();
  
  // Remove excess spaces but keep structure
  cleaned = cleaned.replace(/\s+/g, '');
  
  // Convert exponentiation: handle both simple (2^10) and parenthesized ((15+5)^2) cases
  // First handle parenthesized base: (expr)^num -> Math.pow((expr),num)
  cleaned = cleaned.replace(/\(([^)]+)\)\^(\d+(?:\.\d+)?)/g, 'Math.pow(($1),$2)');
  // Then handle simple base: num^num -> Math.pow(num,num)
  cleaned = cleaned.replace(/(\d+(?:\.\d+)?)\^(\d+(?:\.\d+)?)/g, 'Math.pow($1,$2)');
  
  // Convert percentage of: 15% of 300 -> (15/100)*300 (if not already done)
  cleaned = cleaned.replace(/(\d+(?:\.\d+)?)%of(\d+(?:\.\d+)?)/g, '($1/100)*$2');
  
  // Validate the expression
  if (cleaned && /\d/.test(cleaned)) {
    // Check for balanced parentheses
    if (isBalancedParentheses(cleaned)) {
      // Check if it has at least one operator or Math function
      if (/[+\-*/%]|Math\.pow/.test(cleaned)) {
        return cleaned;
      }
    }
  }
  
  return null;
}

function isBalancedParentheses(str) {
  let count = 0;
  for (let i = 0; i < str.length; i++) {
    if (str[i] === '(') count++;
    if (str[i] === ')') count--;
    if (count < 0) return false;
  }
  return count === 0;
}
