"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatBotNode = chatBotNode;
const openai_1 = require("@langchain/openai");
const llm = new openai_1.ChatOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    model: "gpt-4o",
});
async function chatBotNode(state) {
    const messages = state.messages;
    console.log('messages in chatbot node = ', messages);
    const chatBotResponse = await llm.invoke(messages);
    console.log('chatBotResponse = ', chatBotResponse);
    return { messages: [chatBotResponse] };
}
//# sourceMappingURL=chatBot.js.map