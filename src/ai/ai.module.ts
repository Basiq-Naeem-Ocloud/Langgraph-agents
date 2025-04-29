import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
// import { LangGraphService } from './langgraph/langgraph.service';


@Module({
  controllers: [AiController],
  providers: [AiService,
    // LangGraphService
  ],


})
export class AiModule {}
