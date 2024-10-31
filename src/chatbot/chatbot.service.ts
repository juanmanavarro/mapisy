import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConversationService } from './services/conversation.service';
import { ChatbotUser } from 'src/chatbot/schemas/chatbot-user.schema';

@Injectable()
export class ChatbotService {
  constructor(
    @InjectModel(ChatbotUser.name) private userModel: Model<ChatbotUser>,
    private readonly conversationService: ConversationService,
  ) {}

  async listen(message, conversation) {
    let user = await this.userModel.findOne({
      platform: message.platform,
      platform_user_id: message.from,
      chat_id: message.chat_id,
    });

    if (!user) {
      user = new this.userModel({
        platform: message.platform,
        platform_user_id: message.from,
        chat_id: message.chat_id,
        name: message.profile.name,
        username: message.profile.username,
      });
      await user.save();
    }

    await this.conversationService.execute(user, message, conversation);
  }
}
