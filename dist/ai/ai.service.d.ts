import { CreateAiDto } from './dto/create-ai.dto';
import { BaseMessage } from '@langchain/core/messages';
import { ChatHistoryService } from './services/chat-history.service';
export declare class AiService {
    private chatHistoryService;
    constructor(chatHistoryService: ChatHistoryService);
    private validateImageUrl;
    process(createAiDto: CreateAiDto, document?: Express.Multer.File, image?: Express.Multer.File): Promise<{
        sessionId: string;
        messages: BaseMessage[];
    }>;
}
