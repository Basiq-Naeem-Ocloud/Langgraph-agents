"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chromadb_1 = require("chromadb");
async function testChromaConnection() {
    try {
        const client = new chromadb_1.ChromaClient({
            path: "http://localhost:8000"
        });
        const collections = await client.listCollections();
        console.log('Successfully connected to ChromaDB!');
        console.log('Available collections:', collections);
        return true;
    }
    catch (error) {
        console.error('Failed to connect to ChromaDB:', error.message);
        console.log('Please make sure ChromaDB is running on http://localhost:8000');
        return false;
    }
}
testChromaConnection();
//# sourceMappingURL=chroma-test.js.map