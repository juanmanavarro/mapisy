import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Marker } from './marker.schema';

export type MapDocument = Map & Document;

@Schema({
  timestamps: true,
  versionKey: false,
})
export class Map {
  @Prop({ required: true })
  id: string;

  markers: Marker[];
}

export const MapSchema = SchemaFactory.createForClass(Map);

MapSchema.virtual('markers', {
  ref: Marker.name,
  localField: 'id',
  foreignField: 'map_id',
});
