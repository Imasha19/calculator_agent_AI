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
      const formattedResult = Number.isInteger(result)
        ? result
        : parseFloat(Number(result).toPrecision(12));

      const recommendations = generateRecommendations(mathExpression, result, prompt);

      return `${mathExpression} = ${formattedResult}\n\nRecommendations:\n${recommendations}`;
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

function generateRecommendations(expression, result, originalPrompt) {
  const recs = [];

  // Parentheses and order of operations
  if (/[()]/.test(expression)) {
    recs.push("This expression uses parentheses — operations inside parentheses are evaluated first.");
  } else if (/[+\-]/.test(expression) && /[*\/]/.test(expression)) {
    recs.push("Order of operations applied: multiplication/division before addition/subtraction.");
  }

  // Percentage handling
  if (/\%|percent|per cent|\bof\b/i.test(originalPrompt)) {
    // Try to extract simple "X% of Y" pattern for clearer recommendation
    const m = originalPrompt.match(/(\d+(?:\.\d+)?)\s*%\s*of\s*(\d+(?:\.\d+)?)/i);
    if (m) {
      const pct = parseFloat(m[1]);
      const base = parseFloat(m[2]);
      const pctValue = (pct / 100) * base;
      recs.push(`${pct}% of ${base} = ${pctValue}. Use this to compute relative shares or discounts.`);
    } else {
      recs.push("This involves a percentage — remember that X% of Y means (X/100) * Y.");
    }
  }

  // Exponent handling
  if (/Math\.pow|\^|\bpower\b/i.test(originalPrompt) || /Math\.pow/.test(expression)) {
    recs.push("Exponentiation detected — e.g. 2^10 = 1024. For large exponents, consider scientific notation.");
  }

  // Floating point / rounding suggestion
  if (!Number.isInteger(result)) {
    const rounded = parseFloat(Number(result).toPrecision(6));
    recs.push(`Result is a decimal — consider rounding: ${rounded} (rounded to 6 significant digits).`);
  }

  // Large/small numbers suggestion
  if (Math.abs(result) >= 1e6 || (Math.abs(result) > 0 && Math.abs(result) < 1e-3)) {
    recs.push("Result has large/small magnitude — scientific notation may be helpful.");
  }

  // Practical next steps
  recs.push("Next: verify units (if applicable), try related calculations, or ask for step-by-step breakdown.");

  return recs.map((r) => `- ${r}`).join("\n");
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

// Export breakdown function
export async function getBreakdown(prompt) {
  try {
    const mathExpression = extractAndProcessExpression(prompt);
    
    if (!mathExpression) {
      return "Unable to extract a mathematical expression from your question.";
    }
    
    const steps = [];
    
    // Parse the original prompt to show intent
    steps.push(`Question: ${prompt}`);
    steps.push(`Expression: ${mathExpression}`);
    steps.push("");
    
    // Show step-by-step evaluation based on expression type
    if (mathExpression.includes('Math.pow')) {
      steps.push("Step 1: Evaluate exponentiation (highest priority)");
      const expMatch = mathExpression.match(/Math\.pow\(([^,]+),(\d+(?:\.\d+)?)\)/);
      if (expMatch) {
        const base = parseFloat(expMatch[1]);
        const exp = parseFloat(expMatch[2]);
        const expResult = Math.pow(base, exp);
        steps.push(`  → ${base}^${exp} = ${expResult}`);
      }
    }
    
    if (/[*/]/.test(mathExpression)) {
      steps.push("Step 2: Evaluate multiplication and division (left to right)");
      steps.push("  → Apply * and / operations from left to right");
    }
    
    if (/[+\-]/.test(mathExpression)) {
      steps.push("Step 3: Evaluate addition and subtraction (left to right)");
      steps.push("  → Apply + and - operations from left to right");
    }
    
    // Evaluate final result
    try {
      const result = Function('"use strict"; const Math = globalThis.Math; return (' + mathExpression + ')')();
      const formattedResult = Number.isInteger(result) ? result : parseFloat(Number(result).toPrecision(12));
      steps.push("");
      steps.push(`Final Result: ${formattedResult}`);
    } catch (e) {
      steps.push("Error evaluating expression: " + e.message);
    }
    
    steps.push("");
    steps.push("Related Calculations:");
    
    // Generate related calculations based on the expression
    const numbers = mathExpression.match(/\d+(?:\.\d+)?/g) || [];
    if (numbers.length >= 2) {
      const num1 = parseFloat(numbers[0]);
      const num2 = parseFloat(numbers[numbers.length - 1]);
      
      steps.push(`  → ${num1} + ${num2} = ${num1 + num2}`);
      steps.push(`  → ${num1} - ${num2} = ${num1 - num2}`);
      steps.push(`  → ${num1} * ${num2} = ${num1 * num2}`);
      if (num2 !== 0) {
        steps.push(`  → ${num1} / ${num2} = ${(num1 / num2).toFixed(2)}`);
      }
    }
    
    return steps.join("\n");
  } catch (error) {
    console.error("Breakdown error:", error);
    throw new Error(`Failed to generate breakdown: ${error.message}`);
  }
}
