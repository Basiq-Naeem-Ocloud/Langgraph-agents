import { DallEAPIWrapper } from "@langchain/openai";
import { AIMessageChunk, BaseMessageLike, HumanMessage } from "@langchain/core/messages";
import { MessagesAnnotation } from "@langchain/langgraph";
// import * as process from "node:process";
import { config } from 'dotenv';

// Load environment variables
config();

// Verify API key is present
if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY environment variable is not set. Please add it to your .env file.');
}

const dallE = new DallEAPIWrapper({
    n: 1,
    model: "dall-e-3",
    apiKey: process.env.OPENAI_API_KEY,
    size: "1024x1024",
});

export async function generateImage(prompt: string): Promise<string> {
    console.log('image key = ', process.env.OPENAI_API_KEY);
    try {
        const imageURL = await dallE.invoke(prompt);
        return imageURL;
    } catch (error) {
        console.error('Error generating image:', error);
        throw error;
    }
}

export async function imageGenNode(state: typeof MessagesAnnotation.State) {
    const messages = state.messages;
    console.log('messages = ', messages);
    const lastMessage = messages[messages.length - 1];

    if (!lastMessage || typeof lastMessage.content !== 'string') {
        throw new Error('Invalid message format for image generation');
    }

    const imageURL = await generateImage(lastMessage.content);

    console.log('imageURL = ', imageURL);

    // Create a response message with the image URL
    const response = new AIMessageChunk({
        content: `Here's your generated image: ${imageURL}`,
    });

    return { messages: [response] };
}
