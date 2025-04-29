// export const chatBotNode =  async ({ message }) => {
//     console.log(message)
// }
//

import { ChatOpenAI } from '@langchain/openai'
import { AIMessageChunk, BaseMessageLike, HumanMessage } from "@langchain/core/messages";
import { MessagesAnnotation } from "@langchain/langgraph";
import { BotType } from '../../dto/create-ai.dto';

const llm = new ChatOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    model: "gpt-4o",
});

export async function chatBot(messages: BaseMessageLike[],
     botType?: BotType
    ): Promise<AIMessageChunk> {
        botType = BotType.DOCTOR;
    const systemMessage = {
        role: 'system',
        content: botType === BotType.DOCTOR
            ? 'You are a medical doctor providing healthcare advice.'
            : botType === BotType.FIANCE
                ? 'You are a financial advisor providing financial guidance.'
                : 'You are a helpful assistant.',
    };

    console.log('systemMessage = ', systemMessage);
    const allMessages = [systemMessage, ...messages];

    const response = await llm.invoke(allMessages)
    return response
}

export async function chatBotNode (state: typeof MessagesAnnotation.State) {
    console.log('process.env.OPENAI_API_KEY = ', process.env.OPENAI_API_KEY);
    const messages = state.messages
    const chatBotResponse = await chatBot(messages);
    console.log('chatBotResponse = ', chatBotResponse);
    return { messages: [chatBotResponse] }
}
// // Test the chat bot
// const response = await chatBot([new HumanMessage('hi!')]);
// console.log(response);
