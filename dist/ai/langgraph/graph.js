"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSimulation = createSimulation;
const openai_1 = require("@langchain/openai");
const chatBot_1 = require("./nodes/chatBot");
const generateImage_1 = require("./nodes/generateImage");
const dotenv_1 = require("dotenv");
const langgraph_1 = require("@langchain/langgraph");
(0, dotenv_1.config)();
console.log('api key  = ', process.env.OPENAI_API_KEY);
const model = new openai_1.ChatOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    modelName: "gpt-4o",
});
console.log('model', model);
function shouldContinue(state) {
    const messages = state.messages;
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && typeof lastMessage.content === 'string' &&
        lastMessage.content.toLowerCase().includes('generate image')) {
        return 'image';
    }
    if (messages.length > 3) {
        return langgraph_1.END;
    }
    else if (lastMessage.content === 'FINISHED') {
        return langgraph_1.END;
    }
    else {
        return 'continue';
    }
}
function createSimulation(botType) {
    const workflow = new langgraph_1.StateGraph(langgraph_1.MessagesAnnotation)
        .addNode('chatbot', chatBot_1.chatBotNode)
        .addNode('image', generateImage_1.imageGenNode)
        .addConditionalEdges('chatbot', shouldContinue, {
        [langgraph_1.END]: langgraph_1.END,
        continue: 'chatbot',
        image: 'image'
    })
        .addEdge('image', 'chatbot')
        .addEdge(langgraph_1.START, 'chatbot');
    const simulation = workflow.compile();
    return simulation;
}
//# sourceMappingURL=graph.js.map