import { BaseMessage } from '@langchain/core/messages';
export declare function createGraph(): import("@langchain/langgraph").CompiledStateGraph<import("@langchain/langgraph").StateType<{
    messages: import("@langchain/langgraph").BinaryOperatorAggregate<BaseMessage[], import("@langchain/langgraph").Messages>;
}>, import("@langchain/langgraph").UpdateType<{
    messages: import("@langchain/langgraph").BinaryOperatorAggregate<BaseMessage[], import("@langchain/langgraph").Messages>;
}>, "document" | "image" | "chatbot" | "__start__" | "router", {
    messages: import("@langchain/langgraph").BinaryOperatorAggregate<BaseMessage[], import("@langchain/langgraph").Messages>;
}, {
    messages: import("@langchain/langgraph").BinaryOperatorAggregate<BaseMessage[], import("@langchain/langgraph").Messages>;
}, import("@langchain/langgraph").StateDefinition>;
