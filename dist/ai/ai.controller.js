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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const ai_service_1 = require("./ai.service");
const create_ai_dto_1 = require("./dto/create-ai.dto");
const multer_config_1 = require("../config/multer.config");
let AiController = class AiController {
    aiService;
    constructor(aiService) {
        this.aiService = aiService;
    }
    async process(createAiDto, files) {
        try {
            const document = files.document?.[0];
            const image = files.image?.[0];
            if (document) {
                console.log('Document details:', {
                    filename: document.filename,
                    originalname: document.originalname,
                    mimetype: document.mimetype,
                    size: document.size,
                    path: document.path
                });
            }
            if (image) {
                console.log('Image details:', {
                    filename: image.filename,
                    originalname: image.originalname,
                    mimetype: image.mimetype,
                    size: image.size,
                    path: image.path
                });
            }
            return this.aiService.process(createAiDto, document, image);
        }
        catch (error) {
            console.error('Error processing files:', error);
            throw error;
        }
    }
};
exports.AiController = AiController;
__decorate([
    (0, common_1.Post)('chat'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileFieldsInterceptor)([
        { name: 'document', maxCount: 1 },
        { name: 'image', maxCount: 1 }
    ], multer_config_1.multerConfig)),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_ai_dto_1.CreateAiDto, Object]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "process", null);
exports.AiController = AiController = __decorate([
    (0, common_1.Controller)('ai'),
    __metadata("design:paramtypes", [ai_service_1.AiService])
], AiController);
//# sourceMappingURL=ai.controller.js.map