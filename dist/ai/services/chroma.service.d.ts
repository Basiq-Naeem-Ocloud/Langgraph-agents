export declare class ChromaService {
    private embeddings;
    private vectorStore;
    constructor();
    private initVectorStore;
    private getDocumentLoader;
    private processDocument;
    private prepareDocumentsForChroma;
    addDocument(filePath: string): Promise<{
        success: boolean;
        message: string;
        chunks: number;
    }>;
    similaritySearch(query: string, k?: number): Promise<import("@langchain/core/documents").DocumentInterface<Record<string, any>>[]>;
}
