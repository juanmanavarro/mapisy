import { Module } from '@nestjs/common';
import { CheckoutController } from './controllers/checkout.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Address, AddressSchema } from 'src/assistant/conversations/gota-gota/schemas/address.schema';
import { Order, OrderSchema } from 'src/assistant/conversations/gota-gota/schemas/order.schema';
import { ChatbotUser, ChatbotUserSchema } from 'src/chatbot/schemas/chatbot-user.schema';
import { WordpressModule } from 'src/wordpress/wordpress.module';

@Module({
  imports: [
    WordpressModule,
    MongooseModule.forFeature([
      { name: ChatbotUser.name, schema: ChatbotUserSchema, collection: 'chatbot_user' },
      { name: Order.name, schema: OrderSchema },
      { name: Address.name, schema: AddressSchema },
    ]),
  ],
  controllers: [CheckoutController]
})
export class StripeModule {}
