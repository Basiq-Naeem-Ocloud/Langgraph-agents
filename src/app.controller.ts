import { Controller, Get, Post, Body, UseInterceptors, UploadedFiles, BadRequestException } from '@nestjs/common';
import { FileInterceptor
  // FilesInterceptor

 } from '@nestjs/platform-express';
import { AppService } from './app.service';
import { multerConfig } from './config/multer.config';
import { ChatRequestDto } from './dto/chat-request.dto';

@Controller('ai')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }}

//   @Post('chat')
//   @UseInterceptors(FileInterceptor('document'), FileInterceptor('image'))  async chat(
//     @Body() chatRequest: ChatRequestDto,
//     @UploadedFiles() files: Express.Multer.File[],
//   ) {
//     try {
//       // Process the uploaded files
//       const document = files?.find(file => file.fieldname === 'document');
//       const image = files?.find(file => file.fieldname === 'image');
//
//       // Validate file types
//       if (document && !['application/pdf', 'text/csv'].includes(document.mimetype)) {
//         throw new BadRequestException('Invalid document file type. Only PDF and CSV files are allowed.');
//       }
//
//       if (image && !['image/png', 'image/jpeg', 'image/jpg'].includes(image.mimetype)) {
//         throw new BadRequestException('Invalid image file type. Only PNG and JPG files are allowed.');
//       }
//
//       // Process the chat request with files
//       return this.appService.processChat(chatRequest, { document, image });
//     } catch (error) {
//       throw new BadRequestException(error.message);
//     }
//   }
// }





// @Post('chat')
// @UseInterceptors(FilesInterceptor('files', 2, multerConfig))
// async chat(
//   @Body() chatRequest: ChatRequestDto,
//   @UploadedFiles() files: Express.Multer.File[],
// ) {
//   try {
//     // Process the uploaded files
//     const document = files?.find(file => file.fieldname === 'document');
//     const image = files?.find(file => file.fieldname === 'image');

//     // Validate file types
//     if (document && !['application/pdf', 'text/csv'].includes(document.mimetype)) {
//       throw new BadRequestException('Invalid document file type. Only PDF and CSV files are allowed.');
//     }

//     if (image && !['image/png', 'image/jpeg', 'image/jpg'].includes(image.mimetype)) {
//       throw new BadRequestException('Invalid image file type. Only PNG and JPG files are allowed.');
//     }

//     // Process the chat request with files
//     return this.appService.processChat(chatRequest, { document, image });
//   } catch (error) {
//     throw new BadRequestException(error.message);
//   }
// }
// }
