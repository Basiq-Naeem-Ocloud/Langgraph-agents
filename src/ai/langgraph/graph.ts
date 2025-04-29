import { tool } from '@langchain/core/tools'
import { ChatOpenAI } from "@langchain/openai";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { chatBotNode } from "./nodes/chatBot";
import { imageGenNode } from "./nodes/generateImage";
import { BotType } from '../dto/create-ai.dto';
import { BaseMessage } from '@langchain/core/messages';

import { config } from 'dotenv'
import { MessagesAnnotation, StateGraph, END, START } from "@langchain/langgraph";

config();

console.log( 'api key  = ', process.env.OPENAI_API_KEY)
const model = new ChatOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    modelName: "gpt-4o",
});


console.log('model', model);



// const buildLangGraph = new StateGraph(MessagesAnnotation)
//     .addNode("llmCall", llmCall)
//     .addNode("tools", toolNode)
//     // Add edges to connect nodes
//     .addEdge("__start__", "llmCall")
//     .addConditionalEdges(
//         "llmCall",
//         shouldContinue,
//         {
//             // Name returned by shouldContinue : Name of next node to visit
//             "Action": "tools", // as we are saying tools see 2nd node
//             "__end__": "__end__",
//         }
//     )
//     .addEdge("tools", "llmCall")
//     .compile();
// export function buildLangGraph() {
//     return createGraph()
//         .addNode('chat', chatBotNode)
//         .addNode('image', imageGenNode)
//         .addNode('docQA', documentQANode)
//         .addEdge('start', ({ taskType }) => {
//             if (taskType === 'chat') return 'chat';
//             if (taskType === 'image') return 'image';
//             if (taskType === 'docQA') return 'docQA';
//         })
//         .finish();
// }

function shouldContinue(state: typeof MessagesAnnotation.State) {
    const messages = state.messages;
    const lastMessage = messages[messages.length - 1];
    
    // Check if the message is a request for image generation
    if (lastMessage && typeof lastMessage.content === 'string' && 
        lastMessage.content.toLowerCase().includes('generate image')) {
        return 'image';
    }
    
    if (messages.length > 3) {
        return END;
    } else if (lastMessage.content === 'FINISHED') {
        return END;
    } else {
        return 'continue';
    }
}

function createSimulation(botType?: BotType) {
    const workflow = new StateGraph(MessagesAnnotation)
        .addNode('chatbot', chatBotNode)
        .addNode('image', imageGenNode)
        .addConditionalEdges('chatbot', shouldContinue, {
            [END]: END,
            continue: 'chatbot',
            image: 'image'
        })
        .addEdge('image', 'chatbot')
        .addEdge(START, 'chatbot')

    const simulation = workflow.compile()
    return simulation;
}

export { createSimulation };
