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
    n: 1,
    model: "dall-e-3",
    apiKey: process.env.OPENAI_API_KEY,
    size: "1024x1024",
});
async function generateImage(prompt) {
    console.log('image key = ', process.env.OPENAI_API_KEY);
    try {
        const imageURL = await dallE.invoke(prompt);
        return imageURL;
    }
    catch (error) {
        console.error('Error generating image:', error);
        throw error;
    }
}
async function imageGenNode(state) {
    const messages = state.messages;
    console.log('messages = ', messages);
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || typeof lastMessage.content !== 'string') {
        throw new Error('Invalid message format for image generation');
    }
    const imageURL = await generateImage(lastMessage.content);
    console.log('imageURL = ', imageURL);
    const response = new messages_1.AIMessageChunk({
        content: `Here's your generated image: ${imageURL}`,
    });
    return { messages: [response] };
}
//# sourceMappingURL=generateImage.js.map