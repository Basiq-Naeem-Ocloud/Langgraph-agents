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
exports.AiService = void 0;
const common_1 = require("@nestjs/common");
const graph_1 = require("./langgraph/graph");
const messages_1 = require("@langchain/core/messages");
const chat_history_service_1 = require("./services/chat-history.service");
let AiService = class AiService {
    chatHistoryService;
    constructor(chatHistoryService) {
        this.chatHistoryService = chatHistoryService;
    }
    validateImageUrl(url) {
        if (url.startsWith('data:'))
            return url;
        if (url.match(/\.(jpg|jpeg|png|gif|webp)$/i))
            return url;
        throw new Error("Invalid image URL. URL must end with .jpg, .jpeg, .png, .gif, or .webp");
    }
    async process(createAiDto, document, image) {
        console.log('inside ai service process function', createAiDto);
        console.log('document', document);
        console.log('image', image);
        const graph = (0, graph_1.createGraph)();
        let sessionId = createAiDto.sessionId;
        if (!sessionId) {
            sessionId = this.chatHistoryService.createSession();
        }
        console.log('sessionId = ', sessionId);
        let messages = this.chatHistoryService.getHistory(sessionId);
        if (messages.length === 0) {
            messages = [new messages_1.SystemMessage('You are a helpful assistant which helps users to answer their queries in a good manner.')];
        }
        if (createAiDto.message && createAiDto.image2) {
            messages.push(new messages_1.HumanMessage({
                content: [
                    {
                        type: "text",
                        text: createAiDto.message,
                    },
                    {
                        type: "image_url",
                        image_url: {
                            url: this.validateImageUrl(createAiDto.image2),
                        },
                    },
                ],
            }));
        }
        else if (createAiDto.message) {
            messages.push(new messages_1.HumanMessage(createAiDto.message));
        }
        if (document) {
            messages.push(new messages_1.HumanMessage(`Document uploaded: ${document.originalname}`));
        }
        if (image) {
            messages.push(new messages_1.HumanMessage(`Image uploaded: ${image.originalname}`));
        }
        const result = await graph.invoke({ messages });
        console.log('result in service = ', result);
        this.chatHistoryService.addMessages(sessionId, result.messages);
        return {
            ...result,
            sessionId
        };
    }
};
exports.AiService = AiService;
exports.AiService = AiService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [chat_history_service_1.ChatHistoryService])
], AiService);
//# sourceMappingURL=ai.service.js.map