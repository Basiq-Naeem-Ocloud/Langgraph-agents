import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { ChatHistoryService } from './services/chat-history.service';
// import { LangGraphService } from './langgraph/langgraph.service';


@Module({
  controllers: [AiController],
  providers: [AiService, ChatHistoryService,
    // LangGraphService
  ],


})
export class AiModule {}
