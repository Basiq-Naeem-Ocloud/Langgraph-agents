import { AIMessageChunk, BaseMessageLike } from "@langchain/core/messages";
import { MessagesAnnotation } from "@langchain/langgraph";
import { BotType } from '../../dto/create-ai.dto';
export declare function chatBot(messages: BaseMessageLike[], botType?: BotType): Promise<AIMessageChunk>;
export declare function chatBotNode(state: typeof MessagesAnnotation.State): Promise<{
    messages: AIMessageChunk[];
}>;
