import { Module } from '@nestjs/common';
import { BaseConversation } from './conversations/base.conversation';
import { AssistantInput } from './assistant.input';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatbotUser, ChatbotUserSchema } from 'src/chatbot/schemas/chatbot-user.schema';
import { ChatbotModule } from 'src/chatbot/chatbot.module';
import { GotaGotaConversation } from './conversations/gota-gota/gota-gota.conversation';
import { Order, OrderSchema } from './conversations/gota-gota/schemas/order.schema';
import { Address, AddressSchema } from './conversations/gota-gota/schemas/address.schema';
import { MotorentalConversation } from './conversations/motorental/motorental.conversation';
import { IaModule } from 'src/ia/ia.module';
import { WordpressModule } from 'src/wordpress/wordpress.module';
import { WooCommerceProduct, WooCommerceProductSchema } from 'src/wordpress/schemas/woocommerce-product.schema';
import { PurchaseAssistantConversation } from './conversations/purchase-assistant/purchase-assistant.conversation';
import { ProductConversation } from './conversations/purchase-assistant/conversations/product.conversation';
import { UtilsModule } from 'src/utils/utils.module';
import { AlertConversation } from './conversations/alert/alert.conversation';
import { IaService } from './conversations/alert/services/ia.service';
import { AppGateway } from 'src/app.gateway';

@Module({
  imports: [
    ChatbotModule,
    IaModule,
    WordpressModule,
    UtilsModule,
    MongooseModule.forFeature([
      { name: ChatbotUser.name, schema: ChatbotUserSchema, collection: 'chatbot_user' },
      { name: Order.name, schema: OrderSchema },
      { name: Address.name, schema: AddressSchema },
      { name: WooCommerceProduct.name, schema: WooCommerceProductSchema },
    ]),
  ],
  controllers: [
    AssistantInput,
  ],
  providers: [
    BaseConversation,
    MotorentalConversation,
    GotaGotaConversation,
    PurchaseAssistantConversation,
    ProductConversation,
    AlertConversation,
    IaService,
    AppGateway,
  ],
})
export class AssistantModule {}
