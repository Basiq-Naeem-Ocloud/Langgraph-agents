import { AIMessageChunk, BaseMessageLike } from "@langchain/core/messages";
import { MessagesAnnotation } from "@langchain/langgraph";
export declare function documentChat(messages: BaseMessageLike[]): Promise<AIMessageChunk>;
export declare function documentChatNode(state: typeof MessagesAnnotation.State): Promise<{
    messages: import("@langchain/core/messages").BaseMessage[];
}>;
