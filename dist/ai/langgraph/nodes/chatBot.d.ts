import { MessagesAnnotation } from "@langchain/langgraph";
export declare function chatBotNode(state: typeof MessagesAnnotation.State): Promise<{
    messages: import("@langchain/core/messages").BaseMessage[];
}>;
