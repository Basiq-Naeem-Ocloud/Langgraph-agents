import { MessagesAnnotation } from "@langchain/langgraph";
import { BaseMessage } from "@langchain/core/messages";
export declare function generateImage(prompt: string): Promise<string>;
export declare function imageGenNode(state: typeof MessagesAnnotation.State): Promise<{
    messages: BaseMessage[];
}>;
