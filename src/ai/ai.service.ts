import { Injectable } from '@nestjs/common';
import { CreateAiDto } from './dto/create-ai.dto';
import { createGraph } from './langgraph/graph';
import { HumanMessage, BaseMessage, SystemMessage, AIMessage } from '@langchain/core/messages';
import { ChatHistoryService } from './services/chat-history.service';
import { ChromaService } from './services/chroma.service';

@Injectable()
export class AiService {
  constructor(
    private chatHistoryService: ChatHistoryService,
    private chromaService: ChromaService
  ) {}

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

    // If document is provided, add it to ChromaDB and add a message
    if (document) {
      try {
        await this.chromaService.addDocument(`uploads/documents/${document.filename}`);
        messages.push(new HumanMessage(`Document uploaded: ${document.originalname}`));
      } catch (error) {
        console.error('Error adding document to ChromaDB:', error);
        messages.push(new SystemMessage(`Error processing document: ${error.message}`));
      }
    }

    // If image is provided, add it to the message
    if (image) {
      messages.push(new HumanMessage(`Image uploaded: ${image.originalname}`));
    }


    // todo message streaming start:
    //   const config = {
    //       configurable:{
    //          thread_id:"stream_events",
    //
    //  },
    //   };
    //
    // const stream = await graph.stream({messages}, config); // here is function name is stream only
    // for await (const event of stream){
    //     console.log("Event: ", event);
    // }

    // todo message streaming end

    //todo  event streaming start


    const config = {
        configurable:{
           thread_id:"stream_events",
        },
        version: "v2" as const,
    };

    const stream = await graph.streamEvents({messages}, config);
    let lastMessage = '';

    for await (const event of stream) {
        if (event.event === 'on_chat_model_stream') {
            console.dir({
                event: event.event,
                data: event.data.chunk.content,
            }, { depth: 3 });
            
            // Accumulate the message content
            lastMessage += event.data.chunk.content || '';
        }
    }

    // After the stream is complete, add both user and AI messages to history
    if (lastMessage) {
        const messagesToAdd: BaseMessage[] = [];
        
        // Add user message if it exists
        if (createAiDto.message) {
            messagesToAdd.push(new HumanMessage(createAiDto.message));
        }
        
        // Add AI response
        messagesToAdd.push(new AIMessage(lastMessage));
        
        // Add both messages to chat history
        this.chatHistoryService.addMessages(sessionId, messagesToAdd);
    }

    return {
        messages: [
            ...(createAiDto.message ? [{ role: 'user', content: createAiDto.message }] : []),
            { role: 'assistant', content: lastMessage }
        ],
        sessionId
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
