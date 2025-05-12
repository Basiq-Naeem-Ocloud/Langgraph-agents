"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.documentChat = documentChat;
exports.documentChatNode = documentChatNode;
const openai_1 = require("@langchain/openai");
const messages_1 = require("@langchain/core/messages");
const path = require("path");
const pdf_1 = require("@langchain/community/document_loaders/fs/pdf");
const text_1 = require("langchain/document_loaders/fs/text");
const csv_1 = require("@langchain/community/document_loaders/fs/csv");
const llm = new openai_1.ChatOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    model: "gpt-4o",
});
function getDocumentLoader(filePath) {
    const extension = path.extname(filePath).toLowerCase();
    switch (extension) {
        case '.pdf':
            return new pdf_1.PDFLoader(filePath);
        case '.csv':
            return new csv_1.CSVLoader(filePath);
        default:
            return new text_1.TextLoader(filePath);
    }
}
function findDocumentPath(messages) {
    for (const message of messages) {
        if (message instanceof messages_1.HumanMessage && typeof message.content === 'string') {
            const match = message.content.match(/Document uploaded: (.*?)$/);
            console.log('match = ', JSON.stringify(match));
            if (match && match[1]) {
                const filename = match[1];
                return path.join(process.cwd(), 'uploads', 'documents', filename);
            }
        }
    }
    return null;
}
async function documentChat(messages) {
    try {
        let query = '';
        for (const message of messages) {
            if (message instanceof messages_1.HumanMessage &&
                typeof message.content === 'string' &&
                !message.content.includes('Document uploaded:')) {
                query = message.content;
                break;
            }
        }
        if (!query) {
            return await llm.invoke([
                {
                    role: 'system',
                    content: 'You are a helpful assistant.'
                },
                {
                    role: 'user',
                    content: 'No query was provided. Please ask a question about the document.'
                }
            ]);
        }
        const documentPath = findDocumentPath(messages);
        console.log('documentPath = ', documentPath);
        if (!documentPath) {
            console.log('inisde if of documentPath');
            return await llm.invoke([
                {
                    role: 'system',
                    content: 'You are a helpful assistant.'
                },
                {
                    role: 'user',
                    content: query
                }
            ]);
        }
        console.log(`Processing document: ${documentPath}`);
        const loader = getDocumentLoader(documentPath);
        const docs = await loader.load();
        let documentContent = '';
        for (const doc of docs) {
            documentContent += doc.pageContent + '\n';
        }
        if (documentContent.length > 8000) {
            documentContent = documentContent.substring(0, 8000) + '... (content truncated)';
        }
        console.log('\n documentContent = ', documentContent);
        const systemMessage = {
            role: 'system',
            content: `You are a document analysis assistant. You help users understand and extract information from their documents.`
        };
        const userMessage = {
            role: 'user',
            content: `The following is content from a document:

${documentContent}

Based on this document content, please answer my question: ${query}

If the answer is not in the document content, please say so and provide general information if possible.`
        };
        console.log('systemMessage = ', systemMessage);
        console.log('userMessage = ', userMessage);
        return await llm.invoke([systemMessage, userMessage]);
    }
    catch (error) {
        console.error('Error in document chat:', error);
        return await llm.invoke([
            {
                role: 'system',
                content: 'You are a helpful assistant.'
            },
            {
                role: 'user',
                content: 'There was an error processing your document. Please make sure the file is valid and try again.'
            }
        ]);
    }
}
async function documentChatNode(state) {
    console.log('In document chat node state message = ', state.messages);
    const messages = state.messages;
    const documentChatResponse = await documentChat(messages);
    console.log('documentChatResponse = ', documentChatResponse);
    return { messages: [...messages, documentChatResponse] };
}
//# sourceMappingURL=docChat.js.map