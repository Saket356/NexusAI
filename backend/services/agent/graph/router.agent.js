import { getModel } from "../config/llmModels.js";

const VALID_AGENTS = ["chat", "search", "coding", "pdf", "ppt", "vision"];

export const routerAgent = async (state) => {
  // user picked a specific chip, skip the LLM call
  if (state.file) {
    if (state.agent && state.agent !== "auto") {
      return { agent: state.agent };
    }

    console.log("file in routers", state.file.mimetype)
    if (state.file.mimetype === "application/pdf") {
      return {
        ...state,
        agent: "pdfRag"
      }
    }

    if (state.file.mimetype.startsWith("image/")) {
      return {
        ...state,
        agent: "imageAnalyzer"
      }
    }
  }


  const llm = await getModel("router");

  const prompt = `You are an agent router. Your only job is to read the user's query and choose the single best agent to handle it.

Available agents:
- chat
- search
- coding
- pdf
- ppt
- vision

Rules:

chat:
General conversation, greetings, explanations, learning, advice, brainstorming, writing help, and questions that can be answered from general knowledge.

search:
Anything that needs current or live information: current events, latest news, recent developments, prices, scores, weather, "latest" or "today" questions, or an explicit request to look something up on the internet.

coding:
Writing code, debugging errors, explaining code, building projects, software architecture, API design, databases, and technical implementation questions.

pdf:
Requests to generate, create, or export a PDF, or questions about a PDF or document the user provided.

ppt:
Requests to generate, create, or design a PowerPoint or presentation (slides, decks), or questions about an existing presentation.

vision:
Requests that involve an image: describing an image, reading text from an image, analyzing a screenshot, chart, or photo, or generating or editing an image.

Priority rules:
- If the query clearly matches a specialized agent (pdf, ppt, vision, coding), choose that one.
- If the query needs up-to-date information, choose search.
- If you are unsure, or it is simple conversation, choose chat.

Return ONLY one word, exactly as written below, in lowercase, with no punctuation, quotes, or explanation:

chat
search
coding
pdf
ppt
vision

User Query:
${state.prompt}`;

  const response = await llm.invoke(prompt);

  const picked = String(response.content)
    .trim()
    .toLowerCase()
    .replace(/[^a-z]/g, "");

  return {
    agent: VALID_AGENTS.includes(picked) ? picked : "chat",
  };
};