"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatHistoryService = void 0;
const common_1 = require("@nestjs/common");
const uuid_1 = require("uuid");
let ChatHistoryService = class ChatHistoryService {
    conversations = new Map();
    createSession() {
        const sessionId = (0, uuid_1.v4)();
        this.conversations.set(sessionId, []);
        return sessionId;
    }
    getHistory(sessionId) {
        return this.conversations.get(sessionId) || [];
    }
    addMessages(sessionId, messages) {
        const history = this.getHistory(sessionId);
        this.conversations.set(sessionId, [...history, ...messages]);
    }
    clearHistory(sessionId) {
        this.conversations.delete(sessionId);
    }
};
exports.ChatHistoryService = ChatHistoryService;
exports.ChatHistoryService = ChatHistoryService = __decorate([
    (0, common_1.Injectable)()
], ChatHistoryService);
//# sourceMappingURL=chat-history.service.js.map