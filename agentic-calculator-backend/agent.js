import dotenv from "dotenv";

dotenv.config();

export async function runAgent(prompt) {
  try {
    console.log("Processing prompt:", prompt);
    
    // Extract the mathematical expression from the prompt
    const mathExpression = extractMathExpression(prompt);
    
    if (mathExpression) {
      try {
        // Use Function constructor instead of eval for safer evaluation
        const result = Function('"use strict"; return (' + mathExpression + ')')();
        return `${mathExpression} = ${result}`;
      } catch (e) {
        return `Invalid expression: ${mathExpression}. Please check your math notation.`;
      }
    }
    
    return `I'm a calculator agent. Ask me something like "What is 5 + 3 * 2?" or "Calculate (10 + 5) * 2" or "800 * 2 + 1".`;
  } catch (error) {
    console.error("Agent error:", error);
    throw new Error(`Agent processing failed: ${error.message}`);
  }
}

function extractMathExpression(prompt) {
  // Replace common words with operators
  let expression = prompt
    .toLowerCase()
    .replace(/\bplus\b/g, '+')
    .replace(/\bminus\b/g, '-')
    .replace(/\btimes\b/g, '*')
    .replace(/\bdivided\s+by\b/g, '/')
    .replace(/\bdivide\b/g, '/')
    .replace(/[^0-9+\-*/.()]/g, ' ') // Keep only numbers and operators
    .trim();
  
  // Remove spaces between operators and numbers for cleaner expression
  expression = expression.replace(/\s+/g, '');
  
  // Validate the expression contains at least one operator and numbers
  if (/\d/.test(expression) && /[+\-*/]/.test(expression)) {
    return expression;
  }
  
  // Try to extract just the numbers and operators from the original prompt
  const match = prompt.match(/[\d+\-*/.()]+/g);
  if (match) {
    const combined = match.join('');
    if (/\d/.test(combined) && /[+\-*/]/.test(combined)) {
      return combined;
    }
  }
  
  return null;
}
