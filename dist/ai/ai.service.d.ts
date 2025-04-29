import { CreateAiDto } from './dto/create-ai.dto';
import { BaseMessage } from '@langchain/core/messages';
export declare class AiService {
    process(createAiDto: CreateAiDto): Promise<import("@langchain/langgraph").StateType<{
        messages: import("@langchain/langgraph").BinaryOperatorAggregate<BaseMessage[], import("@langchain/langgraph").Messages>;
    }>>;
}
