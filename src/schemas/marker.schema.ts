import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { MapDocument } from './map.schema';

export type MarkerDocument = Marker & Document;

@Schema({
  timestamps: true,
  versionKey: false,
  toJSON: {
    virtuals: true,
  },
  toObject: {
    virtuals: true,
  },
})
export class Marker {
  @Prop({ required: true })
  map_id: string;

  @Prop({ required: true })
  latitude: string;

  @Prop({ required: true })
  longitude: string;

  map: MapDocument;
}

export const MarkerSchema = SchemaFactory.createForClass(Marker);

MarkerSchema.virtual('map', {
  ref: 'Map',
  localField: 'map_id',
  foreignField: 'id',
  justOne: true,
});
