import { Annotation } from "@langchain/langgraph"

export const agentState = Annotation.Root({
  prompt: Annotation(),
  conversationId: Annotation(),
  history: Annotation(),
  agent: Annotation(),
  aiResponse: Annotation(),
  searchResults:Annotation(),
  images:Annotation(), //because we used images true in earch tool
  artifacts:Annotation(),
  userId:Annotation(),
  file:Annotation()
})