import { HumanMessage } from "@langchain/core/messages";
import { MessagesAnnotation } from "@langchain/langgraph";
import { AIMessage } from "@langchain/core/messages";
export declare function generateImage(prompt: string): Promise<string>;
export declare function imageGenNode(state: typeof MessagesAnnotation.State): Promise<{
    messages: (HumanMessage | AIMessage)[];
}>;
