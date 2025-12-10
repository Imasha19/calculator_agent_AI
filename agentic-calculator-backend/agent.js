import dotenv from "dotenv";
import { ChatOpenAI } from "@langchain/openai";
import { initializeAgentExecutorWithOptions } from "langchain/agents";
import { DynamicTool } from "langchain/tools";
import { OpenAI } from "openai";

dotenv.config();

// Set a dummy OpenAI key to satisfy the validation, but use OpenRouter through the custom client
process.env.OPENAI_API_KEY = process.env.OPENROUTER_API_KEY || "dummy";

const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": "http://localhost:5000",
  },
});

const llm = new ChatOpenAI({
  model: "mosaicml/mpt-7b-instruct",
  client: client,
  temperature: 0,
  openAIApiKey: process.env.OPENROUTER_API_KEY,
});

const calculator = new DynamicTool({
  name: "calculator",
  description: "Evaluates a mathematical expression.",
  func: async (input) => {
    try {
      return eval(input).toString();
    } catch {
      return "Invalid math expression";
    }
  },
});

export async function runAgent(prompt) {
  const executor = await initializeAgentExecutorWithOptions(
    [calculator],
    llm,
    {
      agentType: "zero-shot-react-description",
      verbose: false,
    }
  );
  return await executor.run(prompt);
}
