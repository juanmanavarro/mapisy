import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  versionKey: false,
  toJSON: {
    virtuals: true,
  },
})
export class AiUsage extends Document {
  @Prop({ required: true })
  name: string;
}

export const AiUsageSchema = SchemaFactory.createForClass(AiUsage);
