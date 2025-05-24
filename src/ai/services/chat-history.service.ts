import { Injectable } from '@nestjs/common';
import { BaseMessage } from '@langchain/core/messages';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ChatHistoryService {
    private conversations: Map<string, BaseMessage[]> = new Map();

    createSession(): string {
        const sessionId = uuidv4();
        this.conversations.set(sessionId, []);
        return sessionId;
    }

    getHistory(sessionId: string): BaseMessage[] {
        return this.conversations.get(sessionId) || [];
    }

    addMessages(sessionId: string, messages: BaseMessage[]) {
        const history = this.getHistory(sessionId);
        this.conversations.set(sessionId, [...history, ...messages]);
    }

    clearHistory(sessionId: string) {
        this.conversations.delete(sessionId);
    }
}
