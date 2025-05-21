import { AIMessageChunk } from "@langchain/core/messages";
import { MessagesAnnotation } from "@langchain/langgraph";
export declare function chatBotNode(state: typeof MessagesAnnotation.State): Promise<{
    messages: AIMessageChunk[];
}>;
