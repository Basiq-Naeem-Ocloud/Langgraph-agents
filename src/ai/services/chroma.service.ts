import { Injectable } from '@nestjs/common';
import { Chroma } from '@langchain/community/vectorstores/chroma';
import { OpenAIEmbeddings } from '@langchain/openai';
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { CSVLoader } from "@langchain/community/document_loaders/fs/csv";
import { DocxLoader } from "@langchain/community/document_loaders/fs/docx";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import * as path from 'path';

@Injectable()
export class ChromaService {
    private embeddings: OpenAIEmbeddings;
    private vectorStore: Chroma;

    constructor() {
        this.embeddings = new OpenAIEmbeddings({
            modelName: "text-embedding-3-small"
        });
        this.initVectorStore();
    }

    private async initVectorStore() {
        try {
            this.vectorStore = new Chroma(this.embeddings, {
                collectionName: "documents",
                url: "http://localhost:8000",
                collectionMetadata: {
                    "hnsw:space": "cosine"
                },
                numDimensions: 1536
            });

            await this.vectorStore.ensureCollection();
            console.log('ChromaDB initialized successfully');
        } catch (error) {
            console.error('Error initializing ChromaDB:', error);
            throw new Error(`Failed to initialize ChromaDB: ${error.message}`);
        }
    }

    private getDocumentLoader(filePath: string) {
        const loaders = {
            '.pdf': () => new PDFLoader(filePath, {
                splitPages: true,
                parsedItemSeparator: '\n\n',
                pdfjs: () => import('pdfjs-dist/build/pdf.js')
            }),
            '.csv': () => new CSVLoader(filePath),
            '.docx': () => new DocxLoader(filePath),
            'default': () => new TextLoader(filePath)
        };

        const extension = path.extname(filePath).toLowerCase();
        return (loaders[extension] || loaders['default'])();
    }

    private async processDocument(filePath: string) {
        const loader = this.getDocumentLoader(filePath);
        const docs = await loader.load();
        
        if (!docs?.length) {
            throw new Error('No content could be extracted from the document');
        }

        const textSplitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000,
            chunkOverlap: 200,
            separators: ["\n\n", "\n", ".", " ", ""]
        });

        return await textSplitter.splitDocuments(docs);
    }

    private prepareDocumentsForChroma(splitDocs: any[], filePath: string) {
        return splitDocs.map((doc, index) => ({
            pageContent: doc.pageContent,
            metadata: {
                chunk_id: `chunk_${index}`,
                filename: path.basename(filePath),
                file_type: path.extname(filePath).toLowerCase(),
                page_number: doc.metadata.page || 0
            }
        }));
    }

    async addDocument(filePath: string) {
        try {
            console.log('Processing document:', filePath);
            
            const splitDocs = await this.processDocument(filePath);
            console.log(`Document split into ${splitDocs.length} chunks`);

            const documents = this.prepareDocumentsForChroma(splitDocs, filePath);
            await this.vectorStore.addDocuments(documents);
            
            console.log('Document successfully uploaded to ChromaDB');
            return {
                success: true,
                message: `Document ${path.basename(filePath)} added successfully`,
                chunks: documents.length
            };
        } catch (error) {
            console.error('Error processing document:', error);
            throw new Error(`Failed to add document: ${error.message}`);
        }
    }

    async similaritySearch(query: string, k: number = 5) {
        try {
            return await this.vectorStore.similaritySearch(query, k);
        } catch (error) {
            console.error('Error searching in ChromaDB:', error);
            throw new Error(`Failed to search documents: ${error.message}`);
        }
    }
}
