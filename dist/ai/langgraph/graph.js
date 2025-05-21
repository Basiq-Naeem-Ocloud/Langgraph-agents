"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createGraph = createGraph;
const langgraph_1 = require("@langchain/langgraph");
const messages_1 = require("@langchain/core/messages");
const openai_1 = require("@langchain/openai");
const chatBot_1 = require("./nodes/chatBot");
const generateImage_1 = require("./nodes/generateImage");
const docChat_1 = require("./nodes/docChat");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const routerLLM = new openai_1.ChatOpenAI({
    model: "gpt-4o",
});
function isTaskHandled(messages, taskType) {
    return messages.some(msg => msg instanceof messages_1.SystemMessage &&
        typeof msg.content === 'string' &&
        msg.content === `HANDLED:${taskType}`);
}
async function routerNode(state) {
    console.log('Router received state:', state);
    if (state.messages[state.messages.length - 1] instanceof messages_1.AIMessage) {
        state.messages.push(new messages_1.HumanMessage("Which node should router visit next"));
    }
    const systemPrompt = new messages_1.SystemMessage(`
       You are a routing agent. You must only return one of the following exact strings based on the user's latest message:

        'document' — if the user asks about documents (PDFs, CSVs, text files) and wanted some information from a document.

        'image' — if the user wants to generate or create an image.

        'chatbot' — if the user wants a general conversation or provides an image URL for analysis.

        'end' — if the request is handled or does not fit in any category.

    Rules:

        1-DO NOT respond with anything except one of the above strings.

        2-DO NOT answer the user, describe, or explain anything.

        3-If you are not certain, respond with 'end' only.

        4-Do not infer new agent names or go beyond the 4 listed options.
        
    Simply return 'end' when job is done.
    
    IMPORTANT: DON'T PROCESS ANY URLS OR IMAGES. 
    
    REMEMBER: DO NOT GO IN LOOP BY RETURNING SAME NODE NAME AGAIN AND AGAIN JUST RETURN ONE NODE ONLY ONCE AND IF THE USER'S REQUEST IS SERVED.
    
    Return each node name only once.!!
    
    YOU ARE NOT ALLOWED TO ANSWER USER'S REQUEST JUST SIMPLY ANALYZE THE USER'S INTEND AND RETURN THE ONE OF TH APPROPRIATE NODE NAME.
        
    NOTE: IF YOU THINK USER IS ASKING FOR SOMETHING ELSE, THEN JUST RETURN 'end' WITHOUT ANY EXPLANATION.

     DO NOT INCLUDE WORDS LIKE: "ROUTE" or "route" Return only one of the following exact words:
        'document', 'image', 'chatbot', 'end'
        
      
     NOTE: SIMPLY RETURN end when request is processed. 
     
     RETURN EACH NODE NAME ONLY ONE TIME.
    `);
    console.log('state beforte calling llm: ', state.messages);
    const response = await routerLLM.invoke([systemPrompt, ...state.messages]);
    console.log('llm response on route= ', response);
    let route = String(response.content).toLowerCase().trim();
    console.log('raw route: ', route);
    route = route.replace(/^['"]+|['"]+$/g, '');
    const validRoutes = ['chatbot', 'document', 'image', 'end'];
    if (!validRoutes.includes(route)) {
        console.log(`Invalid route returned: ${route}, defaulting to 'end'`);
        route = 'end';
    }
    console.log('final route: ', route);
    const routingMessage = new messages_1.AIMessage(`ROUTE:${route}`);
    console.log('routingMessage: ', routingMessage);
    return {
        messages: [...state.messages, routingMessage]
    };
}
function markTaskHandled(messages, taskType) {
    if (isTaskHandled(messages, taskType)) {
        return messages;
    }
    return [...messages, new messages_1.SystemMessage(`HANDLED:${taskType}`)];
}
function extractRoute(message) {
    if (!(message instanceof messages_1.SystemMessage))
        return null;
    const content = message.content;
    if (typeof content !== 'string')
        return null;
    if (!content.startsWith('ROUTE:'))
        return null;
    return content.substring(6).replace(/['"]/g, '');
}
function createGraph() {
    const workflow = new langgraph_1.StateGraph(langgraph_1.MessagesAnnotation)
        .addNode('router', routerNode)
        .addNode('document', async (state) => {
        console.log('Document node processing with state:', state);
        const result = await (0, docChat_1.documentChatNode)({ messages: state.messages });
        return { messages: result.messages };
    })
        .addNode('chatbot', async (state) => {
        console.log('Chatbot node processing with state:', state);
        const result = await (0, chatBot_1.chatBotNode)({ messages: state.messages });
        return { messages: result.messages };
    })
        .addNode('image', async (state) => {
        console.log('Image node processing with state:', state);
        const result = await (0, generateImage_1.imageGenNode)({ messages: state.messages });
        return { messages: result.messages };
    })
        .addEdge(langgraph_1.START, 'router')
        .addConditionalEdges('router', (state) => {
        const lastMessage = state.messages
            .filter(msg => msg instanceof messages_1.AIMessage)
            .map(msg => msg.content)
            .filter((content) => typeof content === 'string')
            .reverse()
            .find(content => content.startsWith('ROUTE:'));
        if (!lastMessage) {
            console.warn('No routing message found, defaulting to chatbot');
            return 'chatbot';
        }
        const route = lastMessage.split(':')[1].replace(/['"]/g, '');
        console.log('Route found:', route);
        if (route === 'end')
            return langgraph_1.END;
        return route;
    }, {
        document: 'document',
        chatbot: 'chatbot',
        image: 'image',
        [langgraph_1.END]: langgraph_1.END
    })
        .addEdge('document', 'router')
        .addEdge('image', 'router')
        .addEdge('chatbot', 'router');
    return workflow.compile();
}
//# sourceMappingURL=graph.js.map