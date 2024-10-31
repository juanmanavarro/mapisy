import { Module } from '@nestjs/common';
import { ConversationService } from './services/conversation.service';
import { MongooseModule } from '@nestjs/mongoose';
import { TestConversation } from './conversations/test.conversation';
import { ChatbotService } from './chatbot.service';
import { ChatbotUser, ChatbotUserSchema } from './schemas/chatbot-user.schema';
import { SelectProductConversation } from './conversations/select-product.conversation';
import { SelectProductsConversation } from './conversations/select-products.conversation';
import { IaModule } from 'src/ia/ia.module';
import { SelectTimeConversation } from './conversations/select-time.conversation';
import { SelectDateConversation } from './conversations/select-date.conversation';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    IaModule,
    MongooseModule.forFeature([
      { name: ChatbotUser.name, schema: ChatbotUserSchema },
    ]),
    CacheModule.register({
      ttl: 86400 * 1000,
    }),
  ],
  providers: [
    ConversationService,
    TestConversation,
    ChatbotService,
    SelectProductConversation,
    SelectProductsConversation,
    SelectTimeConversation,
    SelectDateConversation,
  ],
  exports: [
    ChatbotService,
    SelectProductConversation,
    SelectProductsConversation,
    SelectTimeConversation,
    SelectDateConversation,
  ]
})
export class ChatbotModule {}
