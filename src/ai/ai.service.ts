import { Injectable } from '@nestjs/common';
import { CreateAiDto } from './dto/create-ai.dto';
import { createGraph } from './langgraph/graph';
import { HumanMessage, BaseMessage, SystemMessage } from '@langchain/core/messages';
import { ChatHistoryService } from './services/chat-history.service';

@Injectable()
export class AiService {
  constructor(private chatHistoryService: ChatHistoryService) {}

  private validateImageUrl(url: string): string {
    if (url.startsWith('data:')) return url;
    if (url.match(/\.(jpg|jpeg|png|gif|webp)$/i)) return url;
    throw new Error("Invalid image URL. URL must end with .jpg, .jpeg, .png, .gif, or .webp");
  }

  async process(
    createAiDto: CreateAiDto,
    document?: Express.Multer.File,
    image?: Express.Multer.File
  ) {
    console.log('inside ai service process function', createAiDto);
    console.log('document', document);
    console.log('image', image);

    const graph = createGraph();

    // Get or create session
    let sessionId = createAiDto.sessionId;
    if (!sessionId) {
      sessionId = this.chatHistoryService.createSession();
    }

    console.log('sessionId = ', sessionId);

    // Get existing messages or start with system message
    let messages: BaseMessage[] = this.chatHistoryService.getHistory(sessionId); // getting history based on the sessionId
    if (messages.length === 0) {
      messages = [new SystemMessage('You are a helpful assistant which helps users to answer their queries in a good manner.')];
    }

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

    const result = await graph.invoke({ messages });
    console.log('result in service = ', result);

    // Update chat history with new messages
    this.chatHistoryService.addMessages(sessionId, result.messages);

    return {
      ...result,
      sessionId // Return sessionId to client
    };
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
