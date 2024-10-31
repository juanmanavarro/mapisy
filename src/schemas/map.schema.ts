import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Marker } from './marker.schema';

export type MapDocument = Map & Document;

@Schema({
  timestamps: true,
  versionKey: false,
  toJSON: {
    virtuals: true,
  },
})
export class Map {
  @Prop({ required: true })
  id: string;

  @Prop({ default: 0 })
  latitude: number;

  @Prop({ default: 0 })
  longitude: number;

  @Prop({ default: 1 })
  zoom: number;

  markers: Marker[];
}

export const MapSchema = SchemaFactory.createForClass(Map);

MapSchema.virtual('markers', {
  ref: Marker.name,
  localField: 'id',
  foreignField: 'map_id',
});
