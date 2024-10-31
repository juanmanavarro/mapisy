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
  @Prop({ required: true, unique: true })
  id: string;

  @Prop({ default: 0 })
  latitude: number;

  @Prop({ default: 0 })
  longitude: number;

  @Prop({ default: 2 })
  zoom: number;

  @Prop()
  api_key: string;

  @Prop({ default: false })
  isNew: boolean;

  markers: Marker[];
}

export const MapSchema = SchemaFactory.createForClass(Map);

MapSchema.virtual('markers', {
  ref: Marker.name,
  localField: 'id',
  foreignField: 'map_id',
});

MapSchema.pre('save', function(next) {
  if (this.isNew) {
    this.api_key = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
  next();
});
