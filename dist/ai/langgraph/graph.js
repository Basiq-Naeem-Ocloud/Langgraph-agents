"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createGraph = createGraph;
const openai_1 = require("@langchain/openai");
const docChat_1 = require("./nodes/docChat");
const messages_1 = require("@langchain/core/messages");
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
    const hasDocumentReference = messages.some(message => typeof message.content === 'string' &&
        message.content.includes('Document uploaded:'));
    if (hasDocumentReference && lastMessage instanceof messages_1.HumanMessage) {
        return 'document';
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
function createGraph(botType) {
    const workflow = new langgraph_1.StateGraph(langgraph_1.MessagesAnnotation)
        .addNode('document', docChat_1.documentChatNode)
        .addConditionalEdges('document', shouldContinue, {
        [langgraph_1.END]: langgraph_1.END,
        document: 'document'
    })
        .addEdge(langgraph_1.START, 'document');
    const graph = workflow.compile();
    return graph;
}
//# sourceMappingURL=graph.js.map