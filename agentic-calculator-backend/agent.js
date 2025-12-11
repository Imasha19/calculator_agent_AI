import dotenv from "dotenv";

dotenv.config();

// OpenRouter API client
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";

async function callOpenRouterAPI(messages, tools = null) {
  const payload = {
    model: "tngtech/deepseek-r1t2-chimera:free", // Free tier model
    messages: messages,
    temperature: 0.7,
    max_tokens: 2048,
  };

  if (tools) {
    payload.tools = tools;
  }

  const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      "HTTP-Referer": "https://github.com/Imasha19/calculator_agent_AI",
      "X-Title": "Calculator Agent",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`OpenRouter API error: ${error.error?.message || response.statusText}`);
  }

  return await response.json();
}

// Define the tools that Claude can use
const tools = [
  {
    name: "calculate_expression",
    description:
      "Evaluates a mathematical expression and returns the result. Supports basic arithmetic (+, -, *, /), exponents (^), parentheses, and percentages.",
    input_schema: {
      type: "object",
      properties: {
        expression: {
          type: "string",
          description:
            "The mathematical expression to evaluate (e.g., '2^10', '(5+3)*2', '15% of 300')",
        },
      },
      required: ["expression"],
    },
  },
  {
    name: "solve_equation",
    description:
      "Solves simple algebraic equations and word problems that involve mathematical calculations.",
    input_schema: {
      type: "object",
      properties: {
        problem: {
          type: "string",
          description:
            "The word problem or equation to solve (e.g., 'If John has 5 apples and buys 3 more, how many does he have?')",
        },
      },
      required: ["problem"],
    },
  },
  {
    name: "convert_units",
    description:
      "Converts between different units of measurement (distance, weight, temperature, time, etc.)",
    input_schema: {
      type: "object",
      properties: {
        value: {
          type: "number",
          description: "The value to convert",
        },
        from_unit: {
          type: "string",
          description:
            "The unit to convert from (e.g., 'meters', 'feet', 'kg', 'pounds', 'celsius', 'fahrenheit')",
        },
        to_unit: {
          type: "string",
          description: "The unit to convert to",
        },
      },
      required: ["value", "from_unit", "to_unit"],
    },
  },
];

// Tool execution functions
function execute_calculate_expression(expression) {
  try {
    // Normalize the expression
    let processed = expression.toLowerCase();

    // Handle percentage calculations
    processed = processed.replace(
      /(\d+(?:\.\d+)?)\s*%\s+of\s+(\d+(?:\.\d+)?)/gi,
      "($1/100)*$2"
    );

    // Replace word operators
    processed = processed.replace(/\bplus\b/g, "+");
    processed = processed.replace(/\bminus\b/g, "-");
    processed = processed.replace(/\btimes\b/g, "*");
    processed = processed.replace(/\bdivided\s+by\b/g, "/");
    processed = processed.replace(/\bpower\b/g, "^");

    // Remove non-math characters except operators and parentheses
    processed = processed.replace(/[^0-9+\-*/.()^%]/g, " ");
    processed = processed.replace(/\s+/g, "");

    // Convert exponents
    processed = processed.replace(
      /\(([^)]+)\)\^(\d+(?:\.\d+)?)/g,
      "Math.pow(($1),$2)"
    );
    processed = processed.replace(
      /(\d+(?:\.\d+)?)\^(\d+(?:\.\d+)?)/g,
      "Math.pow($1,$2)"
    );

    // Validate and execute
    if (processed && /\d/.test(processed)) {
      if (isBalancedParentheses(processed)) {
        const result = Function(
          '"use strict"; const Math = globalThis.Math; return (' +
            processed +
            ")"
        )();
        const formatted = Number.isInteger(result)
          ? result
          : parseFloat(Number(result).toPrecision(12));

        return {
          success: true,
          expression: processed,
          result: formatted,
          original: expression,
        };
      }
    }

    return {
      success: false,
      error: "Invalid expression format",
      original: expression,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      original: expression,
    };
  }
}

function execute_solve_equation(problem) {
  try {
    // Extract numbers and operations from the problem
    const numbers = problem.match(/\d+(?:\.\d+)?/g) || [];

    if (numbers.length === 0) {
      return {
        success: false,
        error: "No numbers found in the problem",
      };
    }

    // Common patterns
    let result = null;
    let explanation = "";

    // Pattern: "If X ... has Y and ... adds Z" (addition)
    if (
      /has|gets|receives|buys|adds|gains/i.test(problem) &&
      numbers.length >= 2
    ) {
      result = parseFloat(numbers[0]) + parseFloat(numbers[1]);
      explanation = `${numbers[0]} + ${numbers[1]} = ${result}`;
    }

    // Pattern: "X ... minus/loses/removes Y"
    if (
      /removes|loses|takes|minus|subtract|spend/i.test(problem) &&
      numbers.length >= 2
    ) {
      result = parseFloat(numbers[0]) - parseFloat(numbers[1]);
      explanation = `${numbers[0]} - ${numbers[1]} = ${result}`;
    }

    // Pattern: "X groups of Y" (multiplication)
    if (
      /groups?|times|each|per|multiply|of.*each/i.test(problem) &&
      numbers.length >= 2
    ) {
      result = parseFloat(numbers[0]) * parseFloat(numbers[1]);
      explanation = `${numbers[0]} × ${numbers[1]} = ${result}`;
    }

    // Pattern: "X divided among Y" (division)
    if (
      /divided|split|shared|among|per|each/i.test(problem) &&
      numbers.length >= 2
    ) {
      result = parseFloat(numbers[0]) / parseFloat(numbers[1]);
      explanation = `${numbers[0]} ÷ ${numbers[1]} = ${result.toFixed(2)}`;
    }

    if (result !== null) {
      return {
        success: true,
        problem: problem,
        result: result,
        explanation: explanation,
      };
    }

    return {
      success: false,
      error: "Could not determine the operation from the problem",
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

function execute_convert_units(value, from_unit, to_unit) {
  const conversions = {
    // Length
    meter: { feet: 3.28084, kilometers: 0.001, miles: 0.000621371, inches: 39.3701 },
    feet: { meter: 0.3048, kilometers: 0.0003048, miles: 0.000189394, inches: 12 },
    kilometers: { meter: 1000, feet: 3280.84, miles: 0.621371, inches: 39370.1 },
    miles: { meter: 1609.34, feet: 5280, kilometers: 1.60934, inches: 63360 },
    inches: { meter: 0.0254, feet: 0.0833333, kilometers: 0.0000254, miles: 0.0000157828 },

    // Weight
    kg: { grams: 1000, pounds: 2.20462, ounces: 35.274 },
    grams: { kg: 0.001, pounds: 0.00220462, ounces: 0.035274 },
    pounds: { kg: 0.453592, grams: 453.592, ounces: 16 },
    ounces: { kg: 0.0283495, grams: 28.3495, pounds: 0.0625 },

    // Temperature (special handling)
    celsius: { fahrenheit: "special", kelvin: "special" },
    fahrenheit: { celsius: "special", kelvin: "special" },
    kelvin: { celsius: "special", fahrenheit: "special" },
  };

  try {
    const from = from_unit.toLowerCase();
    const to = to_unit.toLowerCase();

    if (from === to) {
      return {
        success: true,
        value: value,
        from_unit: from_unit,
        to_unit: to_unit,
        result: value,
      };
    }

    // Handle temperature conversions
    if (
      ["celsius", "fahrenheit", "kelvin"].includes(from) &&
      ["celsius", "fahrenheit", "kelvin"].includes(to)
    ) {
      let kelvin = value;

      if (from === "celsius") kelvin = value + 273.15;
      else if (from === "fahrenheit") kelvin = (value - 32) * (5 / 9) + 273.15;

      let result = kelvin;
      if (to === "celsius") result = kelvin - 273.15;
      else if (to === "fahrenheit") result = (kelvin - 273.15) * (9 / 5) + 32;

      return {
        success: true,
        value: value,
        from_unit: from_unit,
        to_unit: to_unit,
        result: parseFloat(result.toFixed(2)),
      };
    }

    // Handle regular conversions
    if (conversions[from] && conversions[from][to]) {
      const factor = conversions[from][to];
      if (factor === "special") {
        return {
          success: false,
          error: "Temperature conversion requires special handling",
        };
      }

      const result = value * factor;
      return {
        success: true,
        value: value,
        from_unit: from_unit,
        to_unit: to_unit,
        result: parseFloat(result.toFixed(4)),
      };
    }

    return {
      success: false,
      error: `Conversion from ${from_unit} to ${to_unit} not supported`,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

function isBalancedParentheses(str) {
  let count = 0;
  for (let i = 0; i < str.length; i++) {
    if (str[i] === "(") count++;
    if (str[i] === ")") count--;
    if (count < 0) return false;
  }
  return count === 0;
}

// Process tool calls from Claude
async function processTool(toolName, toolInput) {
  switch (toolName) {
    case "calculate_expression":
      return execute_calculate_expression(toolInput.expression);
    case "solve_equation":
      return execute_solve_equation(toolInput.problem);
    case "convert_units":
      return execute_convert_units(
        toolInput.value,
        toolInput.from_unit,
        toolInput.to_unit
      );
    default:
      return { error: "Unknown tool" };
  }
}

// Main agent function with tool calling
export async function runAgent(prompt) {
  try {
    const messages = [
      {
        role: "user",
        content: `You are a helpful calculator assistant with access to math tools. Solve this problem: ${prompt}`,
      },
    ];

    console.log("Calling OpenRouter API with prompt:", prompt);
    
    // First attempt: Simple calculation without tools
    const response = await callOpenRouterAPI(messages);
    
    let finalResponse = "";
    
    if (response.choices && response.choices[0]) {
      finalResponse = response.choices[0].message.content;
    }

    // Add recommendations
    const recommendations = generateRecommendations(prompt, finalResponse);

    return `${finalResponse}\n\nRecommendations:\n${recommendations}`;
  } catch (error) {
    console.error("Agent error:", error);
    throw new Error(`Agent processing failed: ${error.message}`);
  }
}

function generateRecommendations(prompt, response) {
  const recs = [];

  if (/percent|%/i.test(prompt)) {
    recs.push("- Remember: X% of Y = (X/100) × Y");
  }

  if (/exponent|power|\^/i.test(prompt)) {
    recs.push("- For large exponents, consider scientific notation");
  }

  if (/word problem|math problem/i.test(prompt)) {
    recs.push("- Break down word problems into steps");
  }

  if (/convert|unit/i.test(prompt)) {
    recs.push("- Always verify your conversion factors");
  }

  if (recs.length === 0) {
    recs.push("- Try asking for more complex calculations or word problems");
    recs.push("- You can also request unit conversions");
  }

  return recs.join("\n");
}

// Breakdown function for detailed step-by-step explanation
export async function getBreakdown(prompt) {
  try {
    const messages = [
      {
        role: "user",
        content: `Please provide a detailed step-by-step breakdown of how to solve this problem. Show each step clearly and explain your reasoning: "${prompt}"`,
      },
    ];

    console.log("Getting breakdown from OpenRouter for:", prompt);
    
    const response = await callOpenRouterAPI(messages);
    
    let breakdown = `Problem: ${prompt}\n\n`;
    
    if (response.choices && response.choices[0]) {
      breakdown += response.choices[0].message.content;
    }

    return breakdown;
  } catch (error) {
    console.error("Breakdown error:", error);
    throw new Error(`Failed to generate breakdown: ${error.message}`);
  }
}
