import { CreateAiDto } from './dto/create-ai.dto';
import { BaseMessage } from '@langchain/core/messages';
export declare class AiService {
    private validateImageUrl;
    process(createAiDto: CreateAiDto, document?: Express.Multer.File, image?: Express.Multer.File): Promise<import("@langchain/langgraph").StateType<{
        messages: import("@langchain/langgraph").BinaryOperatorAggregate<BaseMessage[], import("@langchain/langgraph").Messages>;
    }>>;
}
