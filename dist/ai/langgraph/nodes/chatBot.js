"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatBot = chatBot;
exports.chatBotNode = chatBotNode;
const openai_1 = require("@langchain/openai");
const create_ai_dto_1 = require("../../dto/create-ai.dto");
const llm = new openai_1.ChatOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    model: "gpt-4o",
});
async function chatBot(messages, botType) {
    botType = create_ai_dto_1.BotType.DOCTOR;
    const systemMessage = {
        role: 'system',
        content: botType === create_ai_dto_1.BotType.DOCTOR
            ? 'You are a medical doctor providing healthcare advice.'
            : botType === create_ai_dto_1.BotType.FIANCE
                ? 'You are a financial advisor providing financial guidance.'
                : 'You are a helpful assistant.',
    };
    console.log('systemMessage = ', systemMessage);
    const allMessages = [systemMessage, ...messages];
    const response = await llm.invoke(allMessages);
    return response;
}
async function chatBotNode(state) {
    console.log('process.env.OPENAI_API_KEY = ', process.env.OPENAI_API_KEY);
    const messages = state.messages;
    const chatBotResponse = await chatBot(messages);
    console.log('chatBotResponse = ', chatBotResponse);
    return { messages: [chatBotResponse] };
}
//# sourceMappingURL=chatBot.js.map