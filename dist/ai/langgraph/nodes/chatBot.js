"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatBotNode = chatBotNode;
const openai_1 = require("@langchain/openai");
const messages_1 = require("@langchain/core/messages");
const llm = new openai_1.ChatOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    model: "gpt-4o",
});
async function chatBotNode(state) {
    const messages = state.messages;
    const conversationAwarePrompt = new messages_1.SystemMessage("You are a helpful assistant with access to the full conversation history. " +
        "When asked about previous messages or context, refer to the actual conversation history to provide accurate answers.");
    const fullContext = [conversationAwarePrompt, ...messages];
    const chatBotResponse = await llm.invoke(fullContext);
    console.log('chatBotResponse = ', chatBotResponse);
    return { messages: [...state.messages, chatBotResponse] };
}
//# sourceMappingURL=chatBot.js.map