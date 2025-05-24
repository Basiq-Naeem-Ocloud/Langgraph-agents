"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChromaService = void 0;
const common_1 = require("@nestjs/common");
const chroma_1 = require("@langchain/community/vectorstores/chroma");
const openai_1 = require("@langchain/openai");
const pdf_1 = require("@langchain/community/document_loaders/fs/pdf");
const text_1 = require("langchain/document_loaders/fs/text");
const csv_1 = require("@langchain/community/document_loaders/fs/csv");
const docx_1 = require("@langchain/community/document_loaders/fs/docx");
const text_splitter_1 = require("langchain/text_splitter");
const path = require("path");
let ChromaService = class ChromaService {
    embeddings;
    vectorStore;
    constructor() {
        this.embeddings = new openai_1.OpenAIEmbeddings({
            modelName: "text-embedding-3-small"
        });
        this.initVectorStore();
    }
    async initVectorStore() {
        try {
            this.vectorStore = new chroma_1.Chroma(this.embeddings, {
                collectionName: "documents",
                url: "http://localhost:8000",
                collectionMetadata: {
                    "hnsw:space": "cosine"
                },
                numDimensions: 1536
            });
            await this.vectorStore.ensureCollection();
            console.log('ChromaDB initialized successfully');
        }
        catch (error) {
            console.error('Error initializing ChromaDB:', error);
            throw new Error(`Failed to initialize ChromaDB: ${error.message}`);
        }
    }
    getDocumentLoader(filePath) {
        const loaders = {
            '.pdf': () => new pdf_1.PDFLoader(filePath, {
                splitPages: true,
                parsedItemSeparator: '\n\n',
                pdfjs: () => Promise.resolve().then(() => require('pdfjs-dist/build/pdf.js'))
            }),
            '.csv': () => new csv_1.CSVLoader(filePath),
            '.docx': () => new docx_1.DocxLoader(filePath),
            'default': () => new text_1.TextLoader(filePath)
        };
        const extension = path.extname(filePath).toLowerCase();
        return (loaders[extension] || loaders['default'])();
    }
    async processDocument(filePath) {
        const loader = this.getDocumentLoader(filePath);
        const docs = await loader.load();
        if (!docs?.length) {
            throw new Error('No content could be extracted from the document');
        }
        const textSplitter = new text_splitter_1.RecursiveCharacterTextSplitter({
            chunkSize: 1000,
            chunkOverlap: 200,
            separators: ["\n\n", "\n", ".", " ", ""]
        });
        return await textSplitter.splitDocuments(docs);
    }
    prepareDocumentsForChroma(splitDocs, filePath) {
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
    async addDocument(filePath) {
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
        }
        catch (error) {
            console.error('Error processing document:', error);
            throw new Error(`Failed to add document: ${error.message}`);
        }
    }
    async similaritySearch(query, k = 5) {
        try {
            return await this.vectorStore.similaritySearch(query, k);
        }
        catch (error) {
            console.error('Error searching in ChromaDB:', error);
            throw new Error(`Failed to search documents: ${error.message}`);
        }
    }
};
exports.ChromaService = ChromaService;
exports.ChromaService = ChromaService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], ChromaService);
//# sourceMappingURL=chroma.service.js.map