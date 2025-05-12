import { Controller, Post, Body, UseInterceptors, UploadedFiles, BadRequestException } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { AiService } from './ai.service';
import { CreateAiDto } from './dto/create-ai.dto';
import { multerConfig } from '../config/multer.config';

@Controller('ai')
export class AiController {
    constructor(private readonly aiService: AiService) {}

    @Post('chat')
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'document', maxCount: 1 },
        { name: 'image', maxCount: 1 }
    ], multerConfig))
    async process(
        @Body() createAiDto: CreateAiDto,
        @UploadedFiles() files: { document?: Express.Multer.File[], image?: Express.Multer.File[] },
    ) {
        try {
            const document = files.document?.[0];
            const image = files.image?.[0];

            if (document) {
                console.log('Document details:', {
                    filename: document.filename,
                    originalname: document.originalname,
                    mimetype: document.mimetype,
                    size: document.size,
                    path: document.path
                });
            }

            if (image) {
                console.log('Image details:', {
                    filename: image.filename,
                    originalname: image.originalname,
                    mimetype: image.mimetype,
                    size: image.size,
                    path: image.path
                });
            }

            return this.aiService.process(createAiDto, document, image);
        } catch (error) {
            console.error('Error processing files:', error);
            throw error;
        }
    }
}
