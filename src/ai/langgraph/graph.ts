// import { tool } from '@langchain/core/tools'
// import { ChatOpenAI } from "@langchain/openai";
// import { ToolNode } from "@langchain/langgraph/prebuilt";
// import { chatBotNode } from "./nodes/chatBot";
// import { imageGenNode } from "./nodes/generateImage";
// import { BotType } from '../dto/create-ai.dto';
// import { documentChatNode } from "./nodes/docChat";
// import { HumanMessage } from "@langchain/core/messages";
//
// import { BaseMessage } from '@langchain/core/messages';
//
// import { config } from 'dotenv'
// import { MessagesAnnotation, StateGraph, END, START } from "@langchain/langgraph";
//
// config();
//
// console.log( 'api key  = ', process.env.OPENAI_API_KEY)
// const model = new ChatOpenAI({
//     apiKey: process.env.OPENAI_API_KEY,
//     modelName: "gpt-4o",
// });
//
//
// console.log('model', model);



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




// todo last working code
// function shouldContinue(state: typeof MessagesAnnotation.State) {
//     const messages = state.messages;
//     const lastMessage = messages[messages.length - 1];
//
//     // Check if the message is a request for image generation
//     if (lastMessage && typeof lastMessage.content === 'string' &&
//         lastMessage.content.toLowerCase().includes('generate image')) {
//         return 'image';
//     }
//     // Check for document mention in any message
//     const hasDocumentReference = messages.some(message =>
//         typeof message.content === 'string' &&
//         message.content.includes('Document uploaded:'));
//
//     // If there's a document reference and the latest message is likely about the document
//     if (hasDocumentReference && lastMessage instanceof HumanMessage) {
//         return 'document';
//     }
//     if (messages.length > 3) {
//         return END;
//     } else if (lastMessage.content === 'FINISHED') {
//         return END;
//     } else {
//         return 'continue';
//     }
// }
//
// export function createGraph(botType?: BotType) {
//     const workflow = new StateGraph(MessagesAnnotation)
//         // .addNode('chatbot', chatBotNode)
//         // .addNode('image', imageGenNode)
//         .addNode('document', documentChatNode)
//         .addConditionalEdges('document', shouldContinue, {
//             [END]: END,
//             document: 'document'
//         })
//         // .addConditionalEdges('document', shouldContinue, {
//         //     [END]: END,
//         //     continue: 'chatbot',
//         //     image: 'image',
//         //     document: 'document'
//         // })
//         // .addEdge('image', 'chatbot')
//         // .addEdge('document', 'chatbot')
//
//         // .addEdge(START, 'chatbot')
//         .addEdge(START, 'document')
//
//     const graph = workflow.compile()
//     return graph;
// }
//
// // export { createGraph };


// todo last working code end

import { tool } from '@langchain/core/tools';
import { ChatOpenAI } from "@langchain/openai";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { chatBotNode } from "./nodes/chatBot";
import { imageGenNode } from "./nodes/generateImage";
import { documentChatNode } from "./nodes/docChat";
import { MessagesAnnotation, StateGraph, END, START } from "@langchain/langgraph";
import { config } from 'dotenv';
import { BaseMessage } from '@langchain/core/messages';

config();

// Define valid next states
const VALID_NEXT_STATES = ['chatbot', 'image', 'document', 'end'] as const;
type NextState = typeof VALID_NEXT_STATES[number];

// Define the state type
interface RouterState {
    messages: BaseMessage[];
    next: NextState;
}

// Define the graph state type
interface GraphState {
    messages: BaseMessage[];
    next: NextState;
}

const model = new ChatOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    modelName: "gpt-4o",
    temperature: 0,
});

const routerNode = async (state: typeof MessagesAnnotation.State) => {
    console.log('Router received state:', state);
    return {
        messages: state.messages
    };
};

// Document wrapper for handling documents
const documentWrapper = async (state: typeof MessagesAnnotation.State) => {
    console.log('Document node processing with state:', state);
    const result = await documentChatNode(state);
    return { 
        messages: result.messages
    };
};

// Chatbot wrapper for general conversation
const chatbotWrapper = async (state: typeof MessagesAnnotation.State) => {
    console.log('Chatbot node processing with state:', state);
    const result = await chatBotNode(state);
    return { 
        messages: result.messages
    };
};

// Image wrapper for handling image generation
const imageWrapper = async (state: typeof MessagesAnnotation.State) => {
    console.log('Image node processing with state:', state);
    const result = await imageGenNode(state);
    return { 
        messages: result.messages
    };
};

export function createGraph() {
    const workflow = new StateGraph(MessagesAnnotation)
        .addNode('router', routerNode)
        .addNode('document', documentWrapper)
        .addNode('chatbot', chatbotWrapper)
        .addNode('image', imageWrapper)
        // First edge from START goes to router
        .addEdge(START, 'router')
        // Add conditional edges from router
        .addConditionalEdges(
            'router',
            (state) => {
                console.log('Router state in conditional edge:', state);
                
                // Check for document upload
                const hasDocumentUpload = state.messages.some(message => 
                    typeof message.content === 'string' && 
                    message.content.includes('Document uploaded:')
                );
                
                if (hasDocumentUpload) {
                    console.log('Document detected, routing to document node');
                    return 'document';
                }

                // Check for image generation request
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
                
                // For all other cases, go to chatbot
                console.log('No special request detected, routing to chatbot');
                return 'chatbot';
            },
            {
                document: 'document',
                chatbot: 'chatbot',
                image: 'image'
            }
        )
        // All nodes end after processing
        .addEdge('document', END)
        .addEdge('chatbot', END)
        .addEdge('image', END);

    console.log('Graph compiled with nodes:', workflow.nodes);
    return workflow.compile();
}
