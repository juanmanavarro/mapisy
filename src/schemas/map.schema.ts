import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MapDocument = Map & Document;

@Schema({
  timestamps: true,
  versionKey: false,
})
export class Map {
  @Prop({ required: true })
  id: string;
}

export const MapSchema = SchemaFactory.createForClass(Map);
