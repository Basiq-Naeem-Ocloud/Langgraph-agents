import { Injectable } from '@nestjs/common';
import { CreateAiDto } from './dto/create-ai.dto';
import { createGraph } from './langgraph/graph';
import { HumanMessage, BaseMessage, SystemMessage } from '@langchain/core/messages';
import { BotType } from './dto/create-ai.dto';

@Injectable()
export class AiService {
  private validateImageUrl(url: string): string {
    if (url.startsWith('data:')) return url;
    if (url.match(/\.(jpg|jpeg|png|gif|webp)$/i)) return url;
    throw new Error("Invalid image URL. URL must end with .jpg, .jpeg, .png, .gif, or .webp");
  }

  // private getSystemMessage(botType?: BotType): SystemMessage {
  //   let content = 'You are a helpful assistant which helps users to answer their queries in a good manner.';
  //
  //   if (botType === BotType.DOCTOR) {
  //     content = 'You are a medical doctor providing healthcare advice. Always maintain medical ethics, acknowledge limitations, and recommend consulting a real doctor for serious concerns.';
  //   } else if (botType === BotType.FIANCE) {
  //     content = 'You are a financial advisor providing financial guidance. Always provide balanced advice, explain risks, and recommend consulting certified professionals for specific investment decisions.';
  //   }
  //   else if (botType === BotType.LAWYER) {
  //     content = 'You are a lawyer providing legal advice. Always maintain client confidentiality, explain legal terms clearly, and recommend consulting a licensed attorney for specific legal issues.';
  //   }
  //   else if (botType === BotType.DESIGNER) {
  //     content = 'You are a designer providing design advice. Always consider user experience, explain design principles clearly, and recommend consulting a professional designer for specific design projects.';
  //   }
  //   else if (botType === BotType.WRITER) {
  //       content = 'You are a writer providing writing advice. Always consider the audience, explain writing techniques clearly, and recommend consulting a professional writer for specific writing projects.';
  //   }
  //
  //   return new SystemMessage(content);
  // }

  async process(
    createAiDto: CreateAiDto,
    document?: Express.Multer.File,
    image?: Express.Multer.File
  ) {
    console.log('inside ai service process function', createAiDto);
    console.log('document', document);
    console.log('image', image);

    const graph = createGraph();

    // Start with system message
    const messages: BaseMessage[] = [];

    // Add user message based on type
    if (createAiDto.message && createAiDto.image2) {
      messages.push(new HumanMessage({
        content: [
          {
            type: "text",
            text: createAiDto.message,
          },
          {
            type: "image_url",
            image_url: {
              url: this.validateImageUrl(createAiDto.image2),
            },
          },
        ],
      }));
    } else if (createAiDto.message) {
      messages.push(new HumanMessage(createAiDto.message));
    }

    // If document is provided, add it to the message
    if (document) {
      messages.push(new HumanMessage(`Document uploaded: ${document.originalname}`));
    }

    // If image is provided, add it to the message
    if (image) {
      messages.push(new HumanMessage(`Image uploaded: ${image.originalname}`));
    }

    console.log('complete messages = ', messages);

    const result = await graph.invoke({ messages });
    console.log('result in service = ', result);
    return result;
  }

  //
  //
  // create(createAiDto: CreateAiDto) {
  //   return 'This action adds a new ai';
  // }
  //
  // findAll() {
  //   return `This action returns all ai`;
  // }
  //
  // findOne(id: number) {
  //   return `This action returns a #${id} ai`;
  // }
  //
  // update(id: number, updateAiDto: UpdateAiDto) {
  //   return `This action updates a #${id} ai`;
  // }
  //
  // remove(id: number) {
  //   return `This action removes a #${id} ai`;
  // }
}
