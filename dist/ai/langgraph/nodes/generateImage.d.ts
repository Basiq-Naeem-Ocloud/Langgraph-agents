import { MessagesAnnotation } from "@langchain/langgraph";
export declare function generateImage(prompt: string): Promise<string>;
export declare function imageGenNode(state: typeof MessagesAnnotation.State): Promise<{
    messages: import("@langchain/core/messages").BaseMessage[];
}>;
