import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  versionKey: false,
  toJSON: {
    virtuals: true,
  },
})
export class Address extends Document {
  @Prop({ type: Types.ObjectId, required: true, ref: 'ChatbotUser' })
  user: Types.ObjectId;

  @Prop({ type: String, required: true })
  street: string;

  @Prop({ type: String, required: true })
  city: string;

  @Prop({ type: String, required: true })
  number: string;

  @Prop({ type: String })
  extra: string;

  @Prop({ type: String, required: true })
  province: string;

  @Prop({ type: String, required: true })
  zipcode: string;
}

export const AddressSchema = SchemaFactory.createForClass(Address);
