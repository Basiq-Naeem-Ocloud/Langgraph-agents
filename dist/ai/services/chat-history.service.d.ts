import { BaseMessage } from '@langchain/core/messages';
export declare class ChatHistoryService {
    private conversations;
    createSession(): string;
    getHistory(sessionId: string): BaseMessage[];
    addMessages(sessionId: string, messages: BaseMessage[]): void;
    clearHistory(sessionId: string): void;
}
