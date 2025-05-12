"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateImage = generateImage;
exports.imageGenNode = imageGenNode;
const openai_1 = require("@langchain/openai");
const messages_1 = require("@langchain/core/messages");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY environment variable is not set. Please add it to your .env file.');
}
const dallE = new openai_1.DallEAPIWrapper({
    modelName: "dall-e-3",
    apiKey: process.env.OPENAI_API_KEY,
    quality: "standard",
    size: "1024x1024",
});
async function generateImage(prompt) {
    console.log('Generating image with prompt:', prompt);
    try {
        const imageURL = await dallE.invoke(prompt);
        console.log('Image generated successfully:', imageURL);
        return imageURL;
    }
    catch (error) {
        console.error('Error generating image:', error);
        if (error.error?.message) {
            throw new Error(`Failed to generate image: ${error.error.message}`);
        }
        else {
            throw new Error('Failed to generate image. Please try again with a different prompt.');
        }
    }
}
async function imageGenNode(state) {
    const messages = state.messages;
    console.log('Processing image generation with messages:', messages);
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || typeof lastMessage.content !== 'string') {
        throw new Error('Invalid message format for image generation');
    }
    try {
        const imageURL = await generateImage(lastMessage.content);
        const response = new messages_1.AIMessageChunk({
            content: `Here's your generated image: ${imageURL}`,
        });
        return { messages: [...messages, response] };
    }
    catch (error) {
        console.error('Error in image generation node:', error);
        const errorResponse = new messages_1.AIMessageChunk({
            content: error.message || 'Failed to generate image. Please try again with a different prompt.',
        });
        return { messages: [...messages, errorResponse] };
    }
}
//# sourceMappingURL=generateImage.js.map