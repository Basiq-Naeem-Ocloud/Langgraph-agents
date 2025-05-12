// /**
//  * LangChain + LangGraph Agents Example: Agentic Retrieval with Auth0 FGA (Fine-Grained Authorization)
//  */
// import "dotenv/config";
//
// import { OpenAIEmbeddings } from "@langchain/openai";
// import { MemoryVectorStore } from "langchain/vectorstores/memory";
// // import { FGARetriever } from "@auth0/ai-langchain/RAG";
//
// import { readDocuments } from "./helpers/read-documents";
// import { RetrievalAgent } from "./helpers/langchain";
//
// /**
//  * Demonstrates the usage of the Auth0 FGA (Fine-Grained Authorization)
//  * with a vector store index to query documents with permission checks.
//  *
//  * The FGARetriever checks if the user has the "viewer" relation to the document
//  * based on predefined tuples in Auth0 FGA.
//  *
//  * Example:
//  * - A tuple {user: "user:*", relation: "viewer", object: "doc:public-doc"} allows all users to view "public-doc".
//  * - A tuple {user: "user:user1", relation: "viewer", object: "doc:private-doc"} allows "user1" to view "private-doc".
//  *
//  * The output of the query depends on the user's permissions to view the documents.
//  */
// async function main() {
//     console.info(
//         "\n..:: LangChain + LangGraph Agents Example: Agentic Retrieval with Auth0 FGA (Fine-Grained Authorization)\n\n"
//     );
//
//     // UserID
//     const user = "user1";
//     // 1. Read and load documents from the assets folder
//     const documents = await readDocuments();
//     // 2. Create an in-memory vector store from the documents for OpenAI models.
//     const vectorStore = await MemoryVectorStore.fromDocuments(
//         documents,
//         new OpenAIEmbeddings({ model: "text-embedding-3-small" })
//     );
//     // 3. Create a retriever that uses FGA to gate fetching documents on permissions.
//     const retriever = FGARetriever.create({
//         retriever: vectorStore.asRetriever(),
//         // FGA tuple to query for the user's permissions
//         buildQuery: (doc) => ({
//             user: `user:${user}`,
//             object: `doc:${doc.metadata.id}`,
//             relation: "viewer",
//         }),
//     });
//     // 4. Convert the retriever into a tool for an agent.
//     const fgaTool = retriever.asJoinedStringTool();
//     // 5. The agent will call the tool, rephrasing the original question and
//     // populating the "query" argument, until it can answer the user's question.
//     const retrievalAgent = RetrievalAgent.create([fgaTool]);
//     // 6. Query the retrieval agent with a prompt
//     const answer = await retrievalAgent.query("Show me forecast for ZEKO?");
//
//     /**
//      * Output: `The provided context does not include specific financial forecasts...`
//      */
//     console.info(answer);
//
//     /**
//      * If we add the following tuple to the Auth0 FGA:
//      *
//      *    { user: "user:user1", relation: "viewer", object: "doc:private-doc" }
//      *
//      * Then, the output will be: `The forecast for Zeko Advanced Systems Inc. (ZEKO) for fiscal year 2025...`
//      */
// }
//
// main().catch(console.error);



// 1st draft
// import { StateGraphArgs } from "@langchain/langgraph";
// import { MessagesAnnotation } from "@langchain/langgraph";
// import { ChatOpenAI } from "@langchain/openai";
// import { HumanMessage, AIMessage } from '@langchain/core/messages';
// import * as fs from 'fs';
// import * as path from 'path';
// import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
// import { TextLoader } from "langchain/document_loaders/fs/text";
// import { CSVLoader } from "langchain/document_loaders/fs/csv";
//
// const model = new ChatOpenAI({
//     apiKey: process.env.OPENAI_API_KEY,
//     modelName: "gpt-4o",
// });
//
// // Function to get the document loader based on file type
// function getDocumentLoader(filePath: string) {
//     const extension = path.extname(filePath).toLowerCase();
//
//     switch (extension) {
//         case '.pdf':
//             return new PDFLoader(filePath);
//         case '.csv':
//             return new CSVLoader(filePath);
//         default:
//             return new TextLoader(filePath);
//     }
// }
//
// // Simplified document chat node
// export const documentChatNode = async (state: typeof MessagesAnnotation.State, config?: StateGraphArgs) => {
//     try {
//         const messages = state.messages;
//         const lastMessage = messages[messages.length - 1];
//
//         // Check if there's mention of a document in any message
//         let documentPath: string | null = null;
//         let query: string = '';
//
//         // Extract query from last message
//         if (lastMessage && typeof lastMessage.content === 'string') {
//             query = lastMessage.content;
//         }
//
//         // Find document mention in messages
//         for (const message of messages) {
//             if (message instanceof HumanMessage && typeof message.content === 'string') {
//                 const match = message.content.match(/Document uploaded: (.*?)$/);
//                 if (match && match[1]) {
//                     const filename = match[1];
//                     documentPath = path.join(__dirname, '../../uploads/documents', filename);
//                     break;
//                 }
//             }
//         }
//
//         // If no document is found, return the original state
//         if (!documentPath || !fs.existsSync(documentPath)) {
//             console.log('No document found or document does not exist');
//             return { messages };
//         }
//
//         console.log(`Processing document: ${documentPath}`);
//
//         // Load the document content
//         const loader = getDocumentLoader(documentPath);
//         const docs = await loader.load();
//
//         // Extract text from documents
//         let documentContent = '';
//         for (const doc of docs) {
//             documentContent += doc.pageContent + '\n';
//         }
//
//         // Truncate document content if it's too long
//         if (documentContent.length > 10000) {
//             documentContent = documentContent.substring(0, 10000) + '... (content truncated)';
//         }
//
//         // Create a prompt that includes the document content and the question
//         const prompt = `
// The following is content from a document:
//
// ${documentContent}
//
// Based on the document content above, please answer this question: ${query}
//
// If the answer is not in the document content, please say so.
// `;
//
//         // Get answer from the model
//         const response = await model.invoke([new HumanMessage(prompt)]);
//
//         // Add AI message to the messages
//         return {
//             messages: [...messages, new AIMessage(response.content)],
//         };
//
//     } catch (error) {
//         console.error('Error in document chat node:', error);
//         return {
//             messages: [
//                 ...state.messages,
//                 new AIMessage("I encountered an error while processing your document. Please make sure the file is valid and try again."),
//             ],
//         };
//     }
// };


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
        // Find the actual query message
        let query = '';
        for (const message of messages) {
            if (message instanceof HumanMessage && 
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

        console.log('query = ', query);

        // Find document path
        const documentPath = findDocumentPath(messages);
        console.log('documentPath = ', documentPath);

        // If no document found, return generic response
        // if (!documentPath || !fs.existsSync(documentPath)) { // if we donot found any document
        if (!documentPath) { // if we donot found any document
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

        // Load the document
        console.log(`Processing document: ${documentPath}`);
        const loader = getDocumentLoader(documentPath);
        const docs = await loader.load();

        // Initialize text splitter
        const textSplitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000,
            chunkOverlap: 200,
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
        const relevantDocs = await vectorStore.similaritySearchWithScore(query, 4);
        
        // Get relevant content
        const relevantContent = relevantDocs
            .filter(([_, score]) => score > 0.3)
            .map(([doc, _]) => doc.pageContent)
            .join('\n\n');

        // Use top result if no content passes threshold
        const finalContent = relevantContent || relevantDocs[0][0].pageContent;

        const systemMessage = {
            role: 'system',
            content: 'You are a document analysis assistant. Please provide concise answers based only on the relevant document excerpts provided.'
        };

        const userMessage = {
            role: 'user',
            content: `Relevant document excerpts:

${finalContent}

Question: ${query}

If the answer is not in these excerpts, please say so.`
        };

        // Get answer from the model
        console.log('systemMessage = ', systemMessage);
        console.log('userMessage = ', userMessage);
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
