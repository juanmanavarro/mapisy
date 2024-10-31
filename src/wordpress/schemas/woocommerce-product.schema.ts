import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  versionKey: false,
})
export class WooCommerceProduct extends Document {
  @Prop({ required: true })
  id: number;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  price: string;

  @Prop()
  description: string;

  @Prop()
  short_description: string;

  @Prop()
  sku: string;

  @Prop()
  stock_status: string;

  @Prop({ type: [String] })
  categories: string[];

  @Prop()
  image: string;
}

export const WooCommerceProductSchema = SchemaFactory.createForClass(WooCommerceProduct);
