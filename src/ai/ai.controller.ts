import { Controller, Post, Body, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AiService } from './ai.service';
import { CreateAiDto } from './dto/create-ai.dto';
import { multerConfig } from '../config/multer.config';

@Controller('ai')
export class AiController {
    constructor(private readonly aiService: AiService) {}

    @Post('chat')
    // @UseInterceptors(FileInterceptor('document', multerConfig))
    async process(
        @Body() createAiDto: CreateAiDto,
        // @UploadedFiles() files: { document?: Express.Multer.File; image?: Express.Multer.File }
    ) {
        return this.aiService.process(createAiDto);
    }
} 