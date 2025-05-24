import { AIMessageChunk, BaseMessageLike } from "@langchain/core/messages";
import { MessagesAnnotation } from "@langchain/langgraph";
import { ChromaService } from '../../services/chroma.service';
export declare function documentChat(messages: BaseMessageLike[], chromaService: ChromaService): Promise<AIMessageChunk>;
export declare function documentChatNode(state: typeof MessagesAnnotation.State): Promise<{
    messages: import("@langchain/core/messages").BaseMessage[];
}>;
