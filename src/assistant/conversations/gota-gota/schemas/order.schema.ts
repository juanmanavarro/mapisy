import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import axios from 'axios';

@Schema({
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  versionKey: false,
  toJSON: {
    virtuals: true,
  },
})
export class Order extends Document {
  @Prop({ type: Types.ObjectId, required: true, ref: 'ChatbotUser' })
  user: Types.ObjectId;

  @Prop([{ quantity: { type: Number, required: true }, id: { type: String, required: true } }])
  products: { quantity: number, id: string }[];

  @Prop({ default: false })
  completed: boolean;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

// OrderSchema.post('save', async function (doc) {
//   await doc.populate('user');

//   const user: any = doc.user;

//   const customerOrderData = {
//     email: `${user.platform_user_id}-${user.platform}@gota-gota.es`,
//     username: user.username || user.name,
//     password: Array.from({length: 12}, () => Math.random().toString(36).charAt(2)).join(''), // Ensure password is handled securely
//     first_name: user.name,
//     billing: {
//       first_name: user.first_name,
//       last_name: user.last_name,
//       company: user.company,
//       // address_1: user.address.address_1,
//       // address_2: user.address.address_2,
//       // city: user.address.city,
//       // state: user.address.state,
//       // postcode: user.address.postcode,
//       // country: user.address.country,
//       // email: user.address.email,
//       // phone: user.address.phone
//     },
//     shipping: {
//       first_name: user.first_name,
//       last_name: user.last_name,
//       company: user.company,
//       // address_1: user.address.address_1,
//       // address_2: user.address.address_2,
//       // city: user.address.city,
//       // state: user.address.state,
//       // postcode: user.address.postcode,
//       // country: user.address.country
//     },
//     line_items: doc.products.map(product => ({
//       product_id: parseInt(product.id, 10),
//       quantity: product.quantity
//     })),
//     meta_data: [
//       {
//           key: 'platform',
//           value: user.platform,
//       },
//       {
//           key: 'platform_user_id',
//           value: user.platform_user_id,
//       }
//   ]
//   };

//   try {
//     const response = await axios.post('http://juanma-shop.local/wp-json/dialogbot/v1/create-customer-order', customerOrderData);
//     console.log('Customer and Order created:', response.data);
//   } catch (error) {
//     console.error('Error creating customer and order:', error.response ? error.response.data : error.message);
//   }
// });
