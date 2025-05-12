"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createGraph = createGraph;
const openai_1 = require("@langchain/openai");
const chatBot_1 = require("./nodes/chatBot");
const generateImage_1 = require("./nodes/generateImage");
const docChat_1 = require("./nodes/docChat");
const langgraph_1 = require("@langchain/langgraph");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const VALID_NEXT_STATES = ['chatbot', 'image', 'document', 'end'];
const model = new openai_1.ChatOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    modelName: "gpt-4o",
    temperature: 0,
});
const routerNode = async (state) => {
    console.log('Router received state:', state);
    return {
        messages: state.messages
    };
};
const documentWrapper = async (state) => {
    console.log('Document node processing with state:', state);
    const result = await (0, docChat_1.documentChatNode)(state);
    return {
        messages: result.messages
    };
};
const chatbotWrapper = async (state) => {
    console.log('Chatbot node processing with state:', state);
    const result = await (0, chatBot_1.chatBotNode)(state);
    return {
        messages: result.messages
    };
};
const imageWrapper = async (state) => {
    console.log('Image node processing with state:', state);
    const result = await (0, generateImage_1.imageGenNode)(state);
    return {
        messages: result.messages
    };
};
function createGraph() {
    const workflow = new langgraph_1.StateGraph(langgraph_1.MessagesAnnotation)
        .addNode('router', routerNode)
        .addNode('document', documentWrapper)
        .addNode('chatbot', chatbotWrapper)
        .addNode('image', imageWrapper)
        .addEdge(langgraph_1.START, 'router')
        .addConditionalEdges('router', (state) => {
        console.log('Router state in conditional edge:', state);
        const hasDocumentUpload = state.messages.some(message => typeof message.content === 'string' &&
            message.content.includes('Document uploaded:'));
        if (hasDocumentUpload) {
            console.log('Document detected, routing to document node');
            return 'document';
        }
        const lastMessage = state.messages[state.messages.length - 1];
        if (lastMessage && typeof lastMessage.content === 'string') {
            const content = lastMessage.content.toLowerCase();
            const imageKeywords = [
                'generate image',
                'create image',
                'make image',
                'draw',
                'generate a picture',
                'create a picture',
                'generate an image',
                'create an image',
                'make a picture',
                'generate picture',
                'please generate',
                'can you generate',
                'could you generate',
                'generate me'
            ];
            const isImageRequest = imageKeywords.some(keyword => content.includes(keyword));
            if (isImageRequest) {
                console.log('Image generation request detected, routing to image node');
                return 'image';
            }
        }
        console.log('No special request detected, routing to chatbot');
        return 'chatbot';
    }, {
        document: 'document',
        chatbot: 'chatbot',
        image: 'image'
    })
        .addEdge('document', langgraph_1.END)
        .addEdge('chatbot', langgraph_1.END)
        .addEdge('image', langgraph_1.END);
    console.log('Graph compiled with nodes:', workflow.nodes);
    return workflow.compile();
}
//# sourceMappingURL=graph.js.map