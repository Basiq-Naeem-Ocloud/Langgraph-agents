// export const chatBotNode =  async ({ message }) => {
//     console.log(message)
// }
//

import { ChatOpenAI } from '@langchain/openai'
import { AIMessageChunk, BaseMessageLike, HumanMessage, SystemMessage } from "@langchain/core/messages";
import { MessagesAnnotation } from "@langchain/langgraph";

const llm = new ChatOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    model: "gpt-4o",
});

// export async function chatBot(messages: BaseMessageLike[],
//      botType?: BotType
//     ): Promise<AIMessageChunk> {
//         // botType = BotType.DOCTOR;
//     // const systemMessage = {
//     //     role: 'system',
//     //     // content: botType === BotType.DOCTOR
//     //     //     ? 'You are a medical doctor providing healthcare advice.'
//     //     //     : botType === BotType.FIANCE
//     //     //         ? 'You are a financial advisor providing financial guidance.'
//     //     //         : 'You are a helpful assistant.',
//     //     content: 'You are a helpful assistant which helps users to answer their quries in a good manner.',
//     // };
//     //
//     // console.log('systemMessage = ', systemMessage);
//     const allMessages = [...messages];
//
//     const response = await llm.invoke(allMessages)
//     return response
// }

export async function chatBotNode(state: typeof MessagesAnnotation.State) {
    // Get all messages from the state
    const messages = state.messages;

    // Add a system message to help with conversation awareness
    const conversationAwarePrompt = new SystemMessage(
        "You are a helpful assistant with access to the full conversation history. " +
        "When asked about previous messages or context, refer to the actual conversation history to provide accurate answers."
    );

    // Combine the conversation-aware prompt with all messages
    const fullContext = [conversationAwarePrompt, ...messages];

    // Generate response using full conversation context
    const chatBotResponse = await llm.invoke(fullContext);
    console.log('chatBotResponse = ', chatBotResponse);
    
    return { messages: [...state.messages, chatBotResponse] };
}
// // Test the chat bot
// const response = await chatBot([new HumanMessage('hi!')]);
// console.log(response);
