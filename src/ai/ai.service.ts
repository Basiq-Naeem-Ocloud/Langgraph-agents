import { Injectable } from '@nestjs/common';
import { CreateAiDto } from './dto/create-ai.dto';
import {createGraph} from './langgraph/graph';
import { HumanMessage, BaseMessage } from '@langchain/core/messages';

@Injectable()
export class AiService {



  async process(
    createAiDto: CreateAiDto,
    document?: Express.Multer.File,
    image?: Express.Multer.File
  ) {
    console.log('inside ai service process function', createAiDto);
    console.log('document', document);
    console.log('image', image);

    const graph = createGraph();

    const messages = createAiDto.message ? [new HumanMessage(createAiDto.message)] : [];

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
