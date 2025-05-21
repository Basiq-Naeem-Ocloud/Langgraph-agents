"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.documentChat = documentChat;
exports.documentChatNode = documentChatNode;
const openai_1 = require("@langchain/openai");
const messages_1 = require("@langchain/core/messages");
const fs = require("fs");
const path = require("path");
const pdf_1 = require("@langchain/community/document_loaders/fs/pdf");
const text_1 = require("langchain/document_loaders/fs/text");
const csv_1 = require("@langchain/community/document_loaders/fs/csv");
const openai_2 = require("@langchain/openai");
const memory_1 = require("langchain/vectorstores/memory");
const text_splitter_1 = require("langchain/text_splitter");
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
        query = extractedTexts[0];
        console.log('Extracted document query:', query);
        if (!query) {
            return await llm.invoke([
                {
                    role: 'system',
                    content: 'You are a helpful assistant.'
                },
                {
                    role: 'user',
                    content: 'No document-related query was found. Please ask a specific question about the document.'
                }
            ]);
        }
        const documentPath = findDocumentPath(messages);
        console.log('Document path:', documentPath);
        if (!documentPath || !fs.existsSync(documentPath)) {
            return await llm.invoke([
                {
                    role: 'system',
                    content: 'You are a helpful assistant.'
                },
                {
                    role: 'user',
                    content: 'No valid document was found. Please upload a document and try again.'
                }
            ]);
        }
        console.log(`Processing document: ${documentPath}`);
        const loader = getDocumentLoader(documentPath);
        const docs = await loader.load();
        console.log('Loaded documents:', docs);
        const textSplitter = new text_splitter_1.RecursiveCharacterTextSplitter({
            chunkSize: 500,
            chunkOverlap: 100,
        });
        console.log('Splitting documents into chunks...', textSplitter);
        const splitDocs = await textSplitter.splitDocuments(docs);
        console.log('Split documents into chunks:', splitDocs);
        const embeddings = new openai_2.OpenAIEmbeddings({
            model: "text-embedding-3-small"
        });
        const vectorStore = await memory_1.MemoryVectorStore.fromDocuments(splitDocs, embeddings);
        console.log('Vector store created with embeddings');
        const relevantDocs = await vectorStore.similaritySearchWithScore(query, 5);
        console.log('Relevant documents found:', relevantDocs);
        const relevantContent = relevantDocs
            .filter(([_, score]) => score > 0.2)
            .map(([doc, score]) => {
            console.log(`Content score: ${score} for chunk: ${doc.pageContent.substring(0, 100)}...`);
            return doc.pageContent;
        })
            .join('\n\n');
        console.log('Found relevant content:', relevantContent.substring(0, 200) + '...');
        const finalContent = relevantContent || relevantDocs[0][0].pageContent;
        const systemMessage = {
            role: 'system',
            content: `You are a document analysis assistant. Answer questions based ONLY on the provided document excerpts. 
            If the answer cannot be found in the excerpts, say so clearly. 
            Be precise and cite specific parts of the text when possible.
            Focus only on answering the document-related query, ignore any other questions in the original message.`
        };
        const userMessage = {
            role: 'user',
            content: `Here are the relevant document excerpts:

${finalContent}

Document-specific question: ${query}

If you cannot find the specific answer in these excerpts, please say so clearly.`
        };
        console.log('Sending query to LLM with relevant content');
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