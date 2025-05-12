"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiService = void 0;
const common_1 = require("@nestjs/common");
const graph_1 = require("./langgraph/graph");
const messages_1 = require("@langchain/core/messages");
let AiService = class AiService {
    async process(createAiDto, document, image) {
        console.log('inside ai service process function', createAiDto);
        console.log('document', document);
        console.log('image', image);
        const graph = (0, graph_1.createGraph)();
        const messages = createAiDto.message ? [new messages_1.HumanMessage(createAiDto.message)] : [];
        if (document) {
            messages.push(new messages_1.HumanMessage(`Document uploaded: ${document.originalname}`));
        }
        if (image) {
            messages.push(new messages_1.HumanMessage(`Image uploaded: ${image.originalname}`));
        }
        const result = await graph.invoke({ messages });
        console.log('result in service = ', result);
        return result;
    }
};
exports.AiService = AiService;
exports.AiService = AiService = __decorate([
    (0, common_1.Injectable)()
], AiService);
//# sourceMappingURL=ai.service.js.map