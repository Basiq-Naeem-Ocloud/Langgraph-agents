import { ChatOpenAI } from '@langchain/openai';
import { AIMessageChunk, BaseMessageLike, HumanMessage } from "@langchain/core/messages";
import { MessagesAnnotation } from "@langchain/langgraph";
import * as fs from 'fs';
import * as path from 'path';
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { TextLoader } from "langchain/document_loaders/fs/text";
// import { TextLoader } from "@langchain/community/document_loaders/fs/text";
import { CSVLoader } from "@langchain/community/document_loaders/fs/csv";
import { OpenAIEmbeddings } from "@langchain/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

const llm = new ChatOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    model: "gpt-4o",
});

// Function to get the document loader based on file type
function getDocumentLoader(filePath: string) {
    const extension = path.extname(filePath).toLowerCase();

    switch (extension) {
        case '.pdf':
            return new PDFLoader(filePath);
        case '.csv':
            return new CSVLoader(filePath);
        default:
            return new TextLoader(filePath);
    }
}

// Find document reference in messages
function findDocumentPath(messages: BaseMessageLike[]): string | null {
    for (const message of messages) {
        if (message instanceof HumanMessage && typeof message.content === 'string') {
            const match = message.content.match(/Document uploaded: (.*?)$/); // todo this is we are harcoding in grapgh file need to address this
            console.log('match = ', JSON.stringify(match));
            if (match && match[1]) {
                const filename = match[1];
                return path.join(process.cwd(), 'uploads', 'documents', filename);
            }
        }
    }
    return null;
}

// Process document and answer question
export async function documentChat(
    messages: BaseMessageLike[]
): Promise<AIMessageChunk> {
    try {
        // Find the actual query message (the last human message that's not about document upload)
        let query = '';
        const userMessages = messages
            .filter(msg => msg instanceof HumanMessage)
            .filter(msg => {
                const content = msg.content;
                // return !content.includes('Document uploaded:');
                return typeof content === 'string' && !content.includes('Document uploaded:');
            });

        console.log('userMessages = ', userMessages);
        if (userMessages.length > 0) {
            const lastMessage = userMessages[userMessages.length - 1].content as string;
            console.log('lastMessage = ', lastMessage);

            // Split compound message and extract document-related query
            const sentences = lastMessage.split(/[.!?]+\s*/);
            query = sentences
                .filter(sentence =>
                    sentence.toLowerCase().includes('document') ||
                    sentence.toLowerCase().includes('pdf') ||
                    sentence.toLowerCase().includes('text') ||
                    sentence.toLowerCase().includes('file'))
                .join(' ');

            // If no document-specific part found, use the first sentence as fallback
            if (!query && sentences.length > 0) {
                query = sentences[0];
            }
        }

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

        // Find document path
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

        // Load and process the document
        console.log(`Processing document: ${documentPath}`);
        const loader = getDocumentLoader(documentPath);
        const docs = await loader.load();

        // Initialize text splitter with smaller chunks for more precise matching
        const textSplitter = new RecursiveCharacterTextSplitter({
            chunkSize: 500,  // Smaller chunk size for more precise matching
            chunkOverlap: 100,  // Decent overlap to maintain context
        });

        // Split documents into chunks
        const splitDocs = await textSplitter.splitDocuments(docs);

        // Create embeddings
        const embeddings = new OpenAIEmbeddings({
            modelName: "text-embedding-3-small"
        });

        // Create vector store
        const vectorStore = await MemoryVectorStore.fromDocuments(
            splitDocs,
            embeddings
        );

        // Perform similarity search with scores
        // Increase the number of results and lower the score threshold for better coverage
        const relevantDocs = await vectorStore.similaritySearchWithScore(query, 5);

        // Get relevant content with a lower threshold
        const relevantContent = relevantDocs
            .filter(([_, score]) => score > 0.2) // Lower threshold for better recall
            .map(([doc, score]) => {
                console.log(`Content score: ${score} for chunk: ${doc.pageContent.substring(0, 100)}...`);
                return doc.pageContent;
            })
            .join('\n\n');

        console.log('Found relevant content:', relevantContent.substring(0, 200) + '...');

        // If no relevant content found, use broader context
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

        // Get answer from the model
        console.log('Sending query to LLM with relevant content');
        return await llm.invoke([systemMessage, userMessage]);

    } catch (error) {
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

// Document chat node for the graph
export async function documentChatNode(state: typeof MessagesAnnotation.State) {
    console.log('In document chat node state message = ', state.messages);
    const messages = state.messages;
    const documentChatResponse = await documentChat(messages);
    console.log('documentChatResponse = ', documentChatResponse);
    return { messages: [...messages, documentChatResponse] };
}
