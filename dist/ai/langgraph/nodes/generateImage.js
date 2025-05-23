"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateImage = generateImage;
exports.imageGenNode = imageGenNode;
const openai_1 = require("@langchain/openai");
const messages_1 = require("@langchain/core/messages");
const dotenv_1 = require("dotenv");
const messages_2 = require("@langchain/core/messages");
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
    const messages = state.messages.filter(msg => msg instanceof messages_1.HumanMessage);
    const extractedTexts = [];
    for (const msg of messages) {
        const content = msg.content;
        if (typeof content === 'string') {
            if (!content.includes('Document uploaded:')) {
                extractedTexts.push(content);
            }
        }
        else if (Array.isArray(content)) {
            const hasDocumentUpload = content.some(part => part.type === 'text' && part.text.includes('Document uploaded:'));
            if (!hasDocumentUpload) {
                const combinedText = content
                    .filter(part => part.type === 'text')
                    .map(part => typeof part === 'object' && 'text' in part ? part.text : '')
                    .join(' ')
                    .trim();
                if (combinedText) {
                    extractedTexts.push(combinedText);
                }
            }
        }
    }
    console.log('Extracted texts from human messages:', extractedTexts[0]);
    try {
        const imageURL = await generateImage(extractedTexts[extractedTexts.length - 1]);
        const response = new messages_2.AIMessage({
            content: `Here's your generated image: ${imageURL}`,
        });
        return { messages: [...state.messages, response] };
    }
    catch (error) {
        console.error('Error in image generation node:', error);
        const errorResponse = new messages_2.AIMessage({
            content: error.message || 'Failed to generate image. Please try again with a different prompt.',
        });
        return { messages: [...state.messages, errorResponse] };
    }
}
//# sourceMappingURL=generateImage.js.map