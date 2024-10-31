import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MarkerDocument = Marker & Document;

@Schema({
  timestamps: true,
  versionKey: false,
})
export class Marker {
  @Prop({ required: true })
  map_id: string;

  @Prop({ required: true })
  latitude: string;

  @Prop({ required: true })
  longitude: string;
}

export const MarkerSchema = SchemaFactory.createForClass(Marker);
