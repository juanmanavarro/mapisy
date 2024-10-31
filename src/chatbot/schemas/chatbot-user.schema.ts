import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Address } from 'src/assistant/conversations/gota-gota/schemas/address.schema';

@Schema({
  collection: 'chatbot_users',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  versionKey: false,
  toJSON: {
    virtuals: true,
  },
  toObject: {
    virtuals: true,
  },
})
export class ChatbotUser extends Document {
  @Prop({ required: true })
  name: string;

  @Prop()
  username: string;

  @Prop({ required: true })
  platform: string;

  @Prop({ required: true })
  platform_user_id: string;

  @Prop({ required: true })
  chat_id: string;

  maskedPhone: string;
  addresses: Address[];
}

export const ChatbotUserSchema = SchemaFactory.createForClass(ChatbotUser);

ChatbotUserSchema.virtual('maskedPhone').get(function() {
  return this.platform_user_id ? this.platform_user_id.slice(0, -3).replace(/./g, '*') + this.platform_user_id.slice(-3) : '';
});

ChatbotUserSchema.virtual('addresses', {
  ref: 'Address',
  localField: '_id',
  foreignField: 'user',
});
