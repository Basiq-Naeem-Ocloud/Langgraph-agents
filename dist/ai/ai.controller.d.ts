import { AiService } from './ai.service';
import { CreateAiDto } from './dto/create-ai.dto';
export declare class AiController {
    private readonly aiService;
    constructor(aiService: AiService);
    process(createAiDto: CreateAiDto, files: {
        document?: Express.Multer.File[];
        image?: Express.Multer.File[];
    }): Promise<{
        messages: {
            role: string;
            content: string;
        }[];
        sessionId: string;
    }>;
}
