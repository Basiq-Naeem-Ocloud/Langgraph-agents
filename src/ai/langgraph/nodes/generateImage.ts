import { DallEAPIWrapper } from "@langchain/openai";
import { AIMessageChunk, BaseMessageLike, HumanMessage } from "@langchain/core/messages";
import { MessagesAnnotation } from "@langchain/langgraph";
// import * as process from "node:process";
import { config } from 'dotenv';
import { BaseMessage, SystemMessage, AIMessage, ToolMessage } from "@langchain/core/messages";


// Load environment variables
config();

// Verify API key is presentxw
if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY environment variable is not set. Please add it to your .env file.');
}

const dallE = new DallEAPIWrapper({
    modelName: "dall-e-3",
    apiKey: process.env.OPENAI_API_KEY,
    quality: "standard",
    size: "1024x1024",
});

export async function generateImage(prompt: string): Promise<string> {
    console.log('Generating image with prompt:', prompt);
    try {
        const imageURL = await dallE.invoke(prompt);
        console.log('Image generated successfully:', imageURL);
        return imageURL;
    } catch (error) {
        console.error('Error generating image:', error);
        if (error.error?.message) {
            throw new Error(`Failed to generate image: ${error.error.message}`);
        } else {
            throw new Error('Failed to generate image. Please try again with a different prompt.');
        }
    }
}

export async function imageGenNode(state: typeof MessagesAnnotation.State) {
    const messages = state.messages
        .filter(msg => msg instanceof HumanMessage)
        .filter(msg => {
            const content = msg.content;
            return typeof content === 'string';
        });
    console.log('Processing image generation with messages:', messages);
    const lastMessage = messages[messages.length - 1];


    console.log('lastMessage = ', lastMessage);
    if (!lastMessage || typeof lastMessage.content !== 'string') {
        throw new Error('Invalid message format for image generation');
    }

    try {
        const imageURL = await generateImage(lastMessage.content);
        const response = new AIMessage({
            content: `Here's your generated image: ${imageURL}`,
        });
        return { messages: [...messages, response] };
    } catch (error) {
        console.error('Error in image generation node:', error);
        const errorResponse = new AIMessage({
            content: error.message || 'Failed to generate image. Please try again with a different prompt.',
        });
        return { messages: [...messages, errorResponse] };
    }
}
