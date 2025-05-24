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



// todo 12 may working code
//
// import { tool } from '@langchain/core/tools';
// import { ChatOpenAI } from "@langchain/openai";
// import { ToolNode } from "@langchain/langgraph/prebuilt";
// import { chatBotNode } from "./nodes/chatBot";
// import { imageGenNode } from "./nodes/generateImage";
// import { documentChatNode } from "./nodes/docChat";
// import { MessagesAnnotation, StateGraph, END, START } from "@langchain/langgraph";
// import { config } from 'dotenv';
// import { BaseMessage } from '@langchain/core/messages';
//
// config();
//
// // Define valid next states
// const VALID_NEXT_STATES = ['chatbot', 'image', 'document', 'end'] as const;
// type NextState = typeof VALID_NEXT_STATES[number];
//
// // Define the state type
// interface RouterState {
//     messages: BaseMessage[];
//     next: ValidRoute;
// }
//
// // Define the graph state type
// interface GraphState {
//     messages: BaseMessage[];
//     next: NextState;
// }
//
// const model = new ChatOpenAI({
//     apiKey: process.env.OPENAI_API_KEY,
//     modelName: "gpt-4o",
//     temperature: 0,
// });
//
// const routerNode = async (state: typeof MessagesAnnotation.State) => {
//     console.log('Router received state:', state);
//     return {
//         messages: state.messages
//     };
// };
//
// // Document wrapper for handling documents
// const documentWrapper = async (state: typeof MessagesAnnotation.State) => {
//     console.log('Document node processing with state:', state);
//     const result = await documentChatNode(state);
//     return {
//         messages: result.messages
//     };
// };
//
// // Chatbot wrapper for general conversation
// const chatbotWrapper = async (state: typeof MessagesAnnotation.State) => {
//     console.log('Chatbot node processing with state:', state);
//     const result = await chatBotNode(state);
//     return {
//         messages: result.messages
//     };
// };
//
// // Image wrapper for handling image generation
// const imageWrapper = async (state: typeof MessagesAnnotation.State) => {
//     console.log('Image node processing with state:', state);
//     const result = await imageGenNode(state);
//     return {
//         messages: result.messages
//     };
// };
//
// export function createGraph() {
//     const workflow = new StateGraph(MessagesAnnotation)
//         .addNode('router', routerNode)
//         .addNode('document', documentWrapper)
//         .addNode('chatbot', chatbotWrapper)
//         .addNode('image', imageWrapper)
//         // First edge from START goes to router
//         .addEdge(START, 'router')
//         // Add conditional edges from router
//         .addConditionalEdges(
//             'router',
//             (state) => {
//                 console.log('Router state in conditional edge:', state);
//
//                 // Check for document upload
//                 const hasDocumentUpload = state.messages.some(message =>
//                     typeof message.content === 'string' &&
//                     message.content.includes('Document uploaded:')
//                 );
//
//                 if (hasDocumentUpload) {
//                     console.log('Document detected, routing to document node');
//                     return 'document';
//                 }
//
//                 // Check for image generation request
//                 const lastMessage = state.messages[state.messages.length - 1];
//                 if (lastMessage && typeof lastMessage.content === 'string') {
//                     const content = lastMessage.content.toLowerCase();
//                     const imageKeywords = [
//                         'generate image',
//                         'create image',
//                         'make image',
//                         'draw',
//                         'generate a picture',
//                         'create a picture',
//                         'generate an image',
//                         'create an image',
//                         'make a picture',
//                         'generate picture',
//                         'please generate',
//                         'can you generate',
//                         'could you generate',
//                         'generate me'
//                     ];
//
//                     const isImageRequest = imageKeywords.some(keyword => content.includes(keyword));
//
//                     if (isImageRequest) {
//                         console.log('Image generation request detected, routing to image node');
//                         return 'image';
//                     }
//                 }
//
//                 // For all other cases, go to chatbot
//                 console.log('No special request detected, routing to chatbot');
//                 return 'chatbot';
//             },
//             {
//                 document: 'document',
//                 chatbot: 'chatbot',
//                 image: 'image'
//             }
//         )
//         // All nodes end after processing
//         .addEdge('document', END)
//         .addEdge('chatbot', END)
//         .addEdge('image', END);
//
//     console.log('Graph compiled with nodes:', workflow.nodes);
//     return workflow.compile();
// }
// todo 12 may working code end




// todo just need to fix the conditional edge case as next is getting undefined


import { MessagesAnnotation, StateGraph, END, START } from "@langchain/langgraph";
import { BaseMessage, SystemMessage, HumanMessage, AIMessage } from "@langchain/core/messages";
import { ChatOpenAI } from "@langchain/openai";
import { chatBotNode } from "./nodes/chatBot";
import { imageGenNode } from "./nodes/generateImage";
import { documentChatNode } from "./nodes/docChat";
// import _ from 'lodash';
import { cloneDeep } from 'lodash';

import { config } from 'dotenv';
config();

// Define valid routes
type ValidRoute = 'document' | 'image' | 'chatbot' | 'end';

// const VALID_NEXT_STATES = ['chatbot', 'image', 'document', 'end'] as const;
// type NextState = typeof VALID_NEXT_STATES[number];
//
// // Define the state type
// interface RouterState {
//     messages: MessagesAnnotation[];
//     next: string;
// }
// Initialize the LLM for routing
const routerLLM = new ChatOpenAI({
    model: "gpt-4o",
    // model: "gpt-3.5-turbo",
});

// Helper function to check if a task has been handled
function isTaskHandled(messages: BaseMessage[], taskType: string): boolean {
    return messages.some(msg =>
        msg instanceof SystemMessage &&
        typeof msg.content === 'string' &&
        msg.content === `HANDLED:${taskType}`
    );
}

// Router node implementation
async function routerNode(state: { messages: BaseMessage[] }) {
    console.log('Router received state:', state);


    // todo old appending human message.
    // if (state.messages[state.messages.length - 1] instanceof AIMessage) {
    //     // include a human message to state
    //     state.messages.push(new HumanMessage("Which node should router visit next"));
    //     // state.messages.push(new HumanMessage({ content: 'Human: ' + state.messages[state.messages.length - 1].content }));
    // }

    if (state.messages[state.messages.length - 1] instanceof AIMessage) {
        // include a human message to state
        state.messages.push(new SystemMessage("Which node should router visit next?"));
        // state.messages.push(new HumanMessage({ content: 'Human: ' + state.messages[state.messages.length - 1].content }));
    }

    // Get the actual query message, not the document upload notification
    // const lastHumanMessage = state.messages
    //     .filter(msg => {
    //         // if (!(msg instanceof HumanMessage)) return false;
    //         // For array content (multimodal messages)
    //         if (msg instanceof HumanMessage  && Array.isArray(msg.content)) {
    //             return msg.content[0]; // Keep multimodal messages
    //             // return true; // Keep multimodal messages
    //         }
    //         else
    //         {
    //             return msg.content;
    //         }
    //         // For string content
    //         // return typeof msg.content === 'string' &&
    //         //        !msg.content.startsWith('Document uploaded:');
    //     })
    //     .pop();
    // const lastHumanMessageContent = state.messages
    //     .filter(msg => msg instanceof HumanMessage)
    //     .map(msg => {
    //         if (Array.isArray(msg.content)) {
    //             return msg.content[0]; // extract first item from multimodal
    //         } else {
    //             return msg.content;
    //         }
    //     })
    //     .filter(Boolean) // remove null/undefined/falsey values
    //     .pop();
    //
    // console.log('lastHumanMessageContent: ', lastHumanMessageContent);


    // const clonedState = cloneDeep(state);
    //
    // // Find last HumanMessage in cloned state messages
    // const lastHumanMessage = [...clonedState.messages]
    //     .reverse()
    //     .find(msg => msg instanceof HumanMessage);
    //
    // if (lastHumanMessage) {
    //     const content = lastHumanMessage.content;
    //
    //     if (Array.isArray(content)) {
    //         // Filter out any image_url parts from the content array
    //         lastHumanMessage.content = content.filter(part => part.type !== 'image_url');
    //     }
    // }
    //
    // console.log('Cleaned lastHumanMessage:', lastHumanMessage);
    // console.log('original state', state);
    // console.log('cloned state :', clonedState);


    // todo old
    // const lastHumanMessage = [...state.messages]
    //     .reverse()
    //     .find(msg => msg instanceof HumanMessage);
    //
    // if (lastHumanMessage) {
    //     const content = lastHumanMessage.content;
    //
    //     if (Array.isArray(content)) {
    //         // Remove image_url objects from content array
    //         lastHumanMessage.content = content.filter(part => part.type !== 'image_url');
    //     }
    // }
    //
    // console.log('Cleaned lastHumanMessage:', lastHumanMessage);

    // todo old end


    // let extractedContent;

    // if (lastHumanMessage) {
    //     if (Array.isArray(lastHumanMessage.content)) {
    //         extractedContent = lastHumanMessage.content[0];
    //     } else {
    //         extractedContent = lastHumanMessage.content;
    //     }
    // }

    // console.log('extractedContent: ', extractedContent);

    // whose  job is to choose one of
    // Based on the conversation history choose from these options:
    const systemPrompt = new SystemMessage(`
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
    
    If user ask question regarding old chatHistory or user asked question about some previous response redirect the user to chatbot node.
    
    If user ask GENERIC Question route the user to chatbot node.
    
    IMPORTANT: DON'T PROCESS ANY URLS OR IMAGES. 
    
    REMEMBER: DO NOT GO IN LOOP BY RETURNING SAME NODE NAME AGAIN AND AGAIN JUST RETURN ONE NODE ONLY ONCE AND IF THE USER'S REQUEST IS SERVED.
    
    Return each node name only once.!!
    
    YOU ARE NOT ALLOWED TO ANSWER USER'S REQUEST JUST SIMPLY ANALYZE THE USER'S INTEND AND RETURN THE ONE OF TH APPROPRIATE NODE NAME.
        
    NOTE: IF YOU THINK USER IS ASKING FOR SOMETHING ELSE, THEN JUST RETURN 'end' WITHOUT ANY EXPLANATION.

     DO NOT INCLUDE WORDS LIKE: "ROUTE" or "route" in any case. 
     
     Return only one of the following exact words:
        'document', 'image', 'chatbot', 'end'
        
      
     NOTE: SIMPLY RETURN end when request is processed. 
     
     RETURN EACH NODE NAME ONLY ONE TIME.
    `);

    // choose on of the above based on the user’s *TEXTUAL* intent.  Do NOT process URLs or images.
    //
    //
    //          Respond with exactly one of these words—nothing else.
    //
    //         PLEASE CHOOSE ONLY FROM THE ABOVE OPTIONS AND DON'T ADD ANY OTHER TEXT.
    //
    //         You are not supposed to answer and user message just simply return the next node to go to like: 'document', 'image', 'chatbot' or 'end'.
    //
    //         GOTO: to 'end' if user's request is already handled.
    //
    //         Analyze the user's intent and route to the most appropriate node.
    //
    //         IMPORTANT: Respond ONLY with one of these exact words: 'document', 'image', 'chatbot' or 'end'.
    //
    //         NOTE: DON'T ADD WORD LIKE "ROUTE:" or "route:" IN ANY CASE JUST SIMPLY RESPOND WITH THE NODE NAME: 'document', 'image', 'chatbot' or 'end'.


    // const routingPrompt = new HumanMessage(
    //     // `Please determine which node should handle this message: "${lastHumanMessage?.content}"`
    //     `"${lastHumanMessage?.content}"`
    // );


    console.log('state beforte calling llm: ', state.messages);
    // Get routing decision from LLM
    // const messages = lastHumanMessage ? [systemPrompt, lastHumanMessage] : [systemPrompt];
    //
    // console.log('messages to llm: ', messages);
    //
    // const response = await routerLLM.invoke(messages);

    // const response = await routerLLM.invoke([systemPrompt,...clonedState.messages]);
    const response = await routerLLM.invoke([systemPrompt,...state.messages]); // todo old way

    console.log('llm response on route= ', response);
    let route = String(response.content).toLowerCase().trim();
    console.log('raw route: ', route);

// Clean up quotes and whitespace
    route = route.replace(/^['"]+|['"]+$/g, ''); // remove wrapping quotes
    if (route.includes(':')) {
        console.log('colon exists , = ', route)

        route = route.split(':')[1].trim();
        console.log('after removing colon  = ', route)

    }
// Validate against known valid routes
    const validRoutes = ['chatbot', 'document', 'image', 'end'];

    if (!validRoutes.includes(route)) {
        console.log(`Invalid route returned: ${route}, defaulting to 'end'`);
        route = 'end';
    }

    console.log('final route: ', route);

//     let route = String(response.content);
//     console.log('rote : ', route);
//
//     if (route.includes(':')) {
//         route = route.split(':')[1].trim();
//     }
//
//     console.log('route after split: ', route);
// // Optionally validate
//     const validRoutes = ['chatbot', 'document', 'image', 'end'];
// //     if (!validRoutes.includes(route)) {
// //         throw new Error(`Invalid route: ${route}`);
// //     }
//
//     // route = route as 'chatbot' | 'document' | 'image' | 'end';
//
//     route = route.toLowerCase();
//
//     // route = validRoutes.includes(route) ? route as typeof validRoutes[number] : 'end';
//     const matchedRoute = validRoutes.find(resultRoute => resultRoute.includes(route));
//
// // Use matched route or fallback to 'end'
//     route = matchedRoute ?? 'end';

    // Add the routing decision as a system message
    // const routingMessage = new AIMessage(`ROUTE:${route}`); // todo old system message
    const routingMessage = new SystemMessage(`ROUTE:${route}`);

    console.log('routingMessage: ', routingMessage);
    return {
        messages: [...state.messages, routingMessage]
    };
}

// Helper function to mark tasks as handled
// function markTaskHandled(messages: BaseMessage[], taskType: string): BaseMessage[] {
//     // Check if this task type has already been handled
//     if (isTaskHandled(messages, taskType)) {
//         return messages;
//     }
//     return [...messages, new SystemMessage(`HANDLED:${taskType}`)];
// }
//
// // Helper function to extract route from message
// function extractRoute(message: BaseMessage): string | null {
//     if (!(message instanceof SystemMessage)) return null;
//     const content = message.content;
//     if (typeof content !== 'string') return null;
//     if (!content.startsWith('ROUTE:')) return null;
//     return content.substring(6).replace(/['"]/g, ''); // Remove any quotes from route
// }

export function createGraph() {
    const workflow = new StateGraph(MessagesAnnotation)
        .addNode('router', routerNode)
        .addNode('document', async (state: { messages: BaseMessage[] }) => {
            // console.log('Document node processing with state:', state);
            const result = await documentChatNode({ messages: state.messages });
            return { messages: result.messages };
        })
        .addNode('chatbot', async (state: { messages: BaseMessage[] }) => {
            // console.log('Chatbot node processing with state:', state);
            const result = await chatBotNode({ messages: state.messages });
            return { messages: result.messages };
        })
        .addNode('image', async (state: { messages: BaseMessage[] }) => {
            // console.log('Image node processing with state:', state);
            const result = await imageGenNode({ messages: state.messages });
            return { messages: result.messages };
        })
        .addEdge(START, 'router')
        .addConditionalEdges(
            'router',
            (state: { messages: BaseMessage[] }) => {
                const lastMessage = state.messages
                    .filter(msg => msg instanceof SystemMessage)
                    .map(msg => msg.content)
                    .filter((content): content is string => typeof content === 'string')
                    .reverse()
                    .find(content => content.startsWith('ROUTE:'));

                if (!lastMessage) {
                    console.warn('No routing message found, defaulting to chatbot');
                    return 'chatbot';
                }

                const route = lastMessage.split(':')[1].replace(/['"]/g, '');
                console.log('Route found:', route);

                if (route === 'end') return END;
                return route;
            },
            {
                document: 'document',
                chatbot: 'chatbot',
                image: 'image',
                [END]: END
            }
        )
        // Document and image nodes return to router
        .addEdge('document', 'router')
        .addEdge('image', 'router')
        .addEdge('chatbot', 'router');

    return workflow.compile();
}



// todo need to fix the conditional edge case as next is getting undefined in upeer code





// this code is calling different nodes side by side whihc is wrong
//
// import {
//     StateGraph,
//     START,
//     END,
//     MessagesAnnotation,
//     Command,
// } from "@langchain/langgraph";
// import { ChatOpenAI } from "@langchain/openai";
// import { AIMessage, SystemMessage, BaseMessage } from "@langchain/core/messages";
// // import { BaseMessage } from "langchain-core/messages";
//
// import { chatBotNode } from "./nodes/chatBot";
// import { imageGenNode } from "./nodes/generateImage";
// import { documentChatNode } from "./nodes/docChat";
// import { config } from "dotenv";
//
// config();
//
// // Define the state structure using MessagesAnnotation
// type GraphState = typeof MessagesAnnotation.State;
//
// // Chat model for router logic
// const routerLLM = new ChatOpenAI({
//     modelName: "gpt-4",
//     temperature: 0,
// });
//
// // =========================
// // ROUTER NODE
// // =========================
// const routerNode = async (state: GraphState) => {
//     const lastMessage = state.messages[state.messages.length - 1];
//
//     if (!lastMessage) {
//         return new Command({ goto: END, update: {} });
//     }
//
//     const systemPrompt = new SystemMessage(
//         `You are a routing assistant that decides which node should handle the user's request.
//
// Based on the conversation history and the latest message, choose one of:
//
// 1. 'document' - For document-related queries (PDFs, CSVs, text files)
// 2. 'image' - For image generation requests
// 3. 'chatbot' - For general conversation
//
// Only respond with one of: 'document', 'image', or 'chatbot'.`
//     );
//
//     const userPrompt = lastMessage.content;
//
//     const response = await routerLLM.invoke([
//         systemPrompt,
//         new SystemMessage(`User said: "${userPrompt}"`),
//     ]);
//
//     const nextNode = String(response.content).toLowerCase();
//
//     console.log("Router decided on node:", nextNode);
//
//     if (!["document", "image", "chatbot"].includes(nextNode)) {
//         console.log('ruuning default chat bot node')
//         console.warn(`Invalid routing response "${nextNode}", defaulting to chatbot`);
//         return new Command({ goto: "chatbot", update: {} });
//     }
//
//     return new Command({ goto: nextNode, update: {} });
// };
//
// // =========================
// // CHATBOT NODE
// // =========================
// const chatBotNodeWrapper = async (state: GraphState) => {
//     const result = await chatBotNode({ messages: state.messages });
//     return {
//         messages: result.messages,
//     };
// };
//
// // =========================
// // IMAGE NODE
// // =========================
// const imageNodeWrapper = async (state: GraphState) => {
//     const result = await imageGenNode({ messages: state.messages });
//     return {
//         messages: result.messages,
//     };
// };
//
// // =========================
// // DOCUMENT NODE
// // =========================
// const documentNodeWrapper = async (state: GraphState) => {
//     const result = await documentChatNode({ messages: state.messages });
//     return {
//         messages: result.messages,
//     };
// };
//
// // =========================
// // GRAPH CREATION FUNCTION
// // =========================
// export function createGraph() {
//     return new StateGraph(MessagesAnnotation)
//         // Add nodes
//         .addNode("router", routerNode, { ends: ["chatbot", "document", "image", END] })
//         .addNode("chatbot", chatBotNodeWrapper, { ends: ["router"] })
//         .addNode("document", documentNodeWrapper, { ends: ["router"] })
//         .addNode("image", imageNodeWrapper, { ends: ["router"] })
//
//         // Add edges
//         .addEdge(START, "router")
//         .addEdge("router", "chatbot")
//         .addEdge("router", "document")
//         .addEdge("router", "image")
//         .addEdge("router", END)
//         .addEdge("chatbot", "router")
//         .addEdge("document", "router")
//         .addEdge("image", "router")
//
//         .compile({
//             name: "supervisor_graph",
//         });
// }
