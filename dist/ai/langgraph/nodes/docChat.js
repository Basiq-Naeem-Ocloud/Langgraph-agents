"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.documentChat = documentChat;
exports.documentChatNode = documentChatNode;
const openai_1 = require("@langchain/openai");
const messages_1 = require("@langchain/core/messages");
const path = require("path");
const chroma_service_1 = require("../../services/chroma.service");
const llm = new openai_1.ChatOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    model: "gpt-4o",
});
function findDocumentPath(messages) {
    for (let i = messages.length - 1; i >= 0; i--) {
        const message = messages[i];
        if (message instanceof messages_1.HumanMessage && typeof message.content === 'string') {
            const match = message.content.match(/Document uploaded: (.*?)$/);
            if (match && match[1]) {
                const filename = match[1].trim();
                return path.join(process.cwd(), 'uploads', 'documents', filename);
            }
        }
    }
    return null;
}
async function documentChat(messages, chromaService) {
    try {
        let query = '';
        const message = messages.filter(msg => msg instanceof messages_1.HumanMessage);
        const extractedTexts = [];
        for (const msg of message) {
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
        console.log('Extracted texts from human messages:', extractedTexts);
        query = extractedTexts[extractedTexts.length - 1];
        console.log('Extracted document query:', query);
        if (!query) {
            return await llm.invoke([
                new messages_1.SystemMessage('You are a helpful assistant with access to the full conversation history.'),
                ...messages,
                new messages_1.HumanMessage('No document-related query was found. Please ask a specific question about the document.')
            ]);
        }
        const relevantDocs = await chromaService.similaritySearch(query);
        console.log('Found relevant content from ChromaDB');
        const relevantContent = relevantDocs.map(doc => doc.pageContent).join('\n\n');
        console.log('relevantContent from chroma db = ', relevantContent);
        const systemMessage = new messages_1.SystemMessage(`You are a document analysis assistant with access to the full conversation history. 
            Answer questions based ONLY on the provided document excerpts and conversation context. 
            If the answer cannot be found in the excerpts, say so clearly. 
            Be precise and cite specific parts of the text when possible.
            Focus only on answering the document-related query, but maintain awareness of the conversation context.`);
        const userMessage = new messages_1.HumanMessage(`Here are the relevant document excerpts:\n\n${relevantContent}\n\nDocument-specific question: ${query}\n\nIf you cannot find the specific answer in these excerpts, please say so clearly.`);
        return await llm.invoke([systemMessage, ...messages, userMessage]);
    }
    catch (error) {
        console.error('Error in document chat:', error);
        return await llm.invoke([
            new messages_1.SystemMessage('You are a helpful assistant with access to the full conversation history.'),
            ...messages,
            new messages_1.HumanMessage('There was an error processing your document. Please make sure the file is valid and try again.')
        ]);
    }
}
async function documentChatNode(state) {
    console.log('In document chat node state message = ', state.messages);
    const messages = state.messages;
    const chromaService = new chroma_service_1.ChromaService();
    const documentChatResponse = await documentChat(messages, chromaService);
    console.log('documentChatResponse = ', documentChatResponse);
    return { messages: [...messages, documentChatResponse] };
}
//# sourceMappingURL=docChat.js.map