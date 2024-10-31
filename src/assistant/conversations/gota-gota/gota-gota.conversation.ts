import { Injectable } from '@nestjs/common';
import { Button } from 'src/chatbot/components/button';
import { Send } from 'src/chatbot/helpers/send';
import { ConfirmButtons } from 'src/chatbot/components/confirm-buttons';
import { toEuros } from 'src/chatbot/helpers/text';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Address } from './schemas/address.schema';
import { Order } from './schemas/order.schema';
import { NewConversation } from 'src/chatbot/conversations/conversation';
import { Context } from 'src/chatbot/conversations/context';
import { SelectProductsConversation } from 'src/chatbot/conversations/select-products.conversation';
import { ProductsService } from 'src/wordpress/services/products.service';
import { AddressService } from 'src/utils/services/address/address.service';
import { AddressConversation } from 'src/chatbot/conversations/address.conversation';

@Injectable()
export class GotaGotaConversation extends NewConversation {
  constructor(
    @InjectModel(Address.name) private addressModel: Model<Address>,
    @InjectModel(Order.name) private orderModel: Model<Order>,
    protected readonly selectProductsConversation: SelectProductsConversation,
    protected readonly productsService: ProductsService,
    protected readonly addressService: AddressService,
  ) {
    super();
  }

  async steps() {
    const products = await this.productsService.findAll();

    return {
      ...AddressConversation.create(40, 'AddressConversation', async (user) => {
        const address = Context.get(user, 'order.address');

        await this.addressModel.create({
          user: user._id,
          number: address.number,
          extra: address.extra,
          ...address,
        });
      }),
      0: {
        message: async ({ user }) => {
          return {
            text: `¡Hola ${user.name}! Envia tu código postal para ver si podemos darte servicio.`,
          };
        },
        action: async ({ message, user }) => {
          const zipcode = this.validateZipcode({ message, user });
          if ( !zipcode ) return false;

          const isValidZipcode = ['46160'].find(z => z === message.text);
          if ( false ) {
            await Send.to(user, ['Lo siento, no hay reparto en tu zona.']);
            return 1000;
          }

          await Send.to(user, 'Bien, si tenemos reparto en tu zona.');

          Context.set(user, 'address.zipcode', message.text);

          return 'PackSelectConversation.0';
        },
      },
      ...this.selectProductsConversation.steps({
        products,
        message: '¿Qué pack de agua mineral te gustaría pedir?',
        id: 'PackSelectConversation',
        next: 'AddressConversation.0',
      }),
      40: {
        message: () => {
          return {
            text: 'Bien. El próximo día de reparto por tu zona es el martes. ¿Cuando podemos pasar?',
            options: {
              buttons: [
                Button.create('Por la mañana', 'morning'),
                Button.create('Por la tarde', 'afternoon'),
              ]
            }
          }
        },
        action: ({ message, user }) => {
          if ( !message.interaction ) {
            Send.to(user, 'Por favor, escoge una opcion.');
            return false;
          }

          Context.set(user, 'order.delivery', message.interaction);

          return 45;
        }
      },
      45: {
        message: ({ user }) => {
          const order = Context.get(user, 'order');

          const cart = order.products.map(p => {
            return {
              quantity: p.quantity,
              product: products.find(gp => gp.id === p.id),
            }
          });

          const total = cart.reduce((sum, item) => {
            return sum + item.quantity * item.product.price;
          }, 0);

          return {
            text: [
              `Estos son los datos del pedido:`,
              '',
              cart
                .map(p => `${p.product.name}: ${p.quantity} x ${toEuros(p.product.price)} = ${toEuros(p.product.price * p.quantity)}`).join('\n'),
              '',
              `Total: ${toEuros(total)}`,
              '',
              `Entrega el martes por la ${order.delivery} en la dirección:`,
              '',
              `${order.address.road}, ${order.address.number} ${order.address.extra}`,
              `${order.address.postcode} ${order.address.village || order.address.town || order.address.city}`,,
              '',
              '¿Es correcto?'
            ].join('\n'),
            options: {
              buttons: ConfirmButtons.create()
            }
          }
        },
        action: async ({ message, user }) => {
          if ( !message.hasOwnProperty('interaction') ) {
            Send.to(user, 'Por favor, confirma.');
            return false;
          }

          if ( !message.interaction?.confirm ) {
            await Send.to(user, 'Bien, empezemos de nuevo');
            Context.set(user, 'products', null);
            return 0;
          }

          const order = Context.get(user, 'order');

          this.orderModel.create({
            user: user._id,
            products: order.products,
          }).then(o => Context.set(user, 'order.id', o.id));

          await this.pause();

          return 50;
        }
      },
      50: {
        message: ({ user }) => {
          return {
            text: [
              `Bien. Para completar el pedido realiza el pago en el siguiente enlace:`,
              '',
              `${process.env.PAYMENT_URL}/stripe/checkout?order_id=${Context.get(user, 'order.id')}`,
            ].join('\n'),
          }
        },
        action: async ({ message, user }) => {
          const order = await this.orderModel.findOne(
            { _id: new Types.ObjectId(Context.get(user, 'order.id')) },
          ).exec();

          if ( !order?.completed ) {
            Send.to(user, 'Debes de realizar el pago para completar el pedido.');
            return false;
          }

          return 60;
        }
      },
      60: {
        message: ({ user }) => {
          return {
            text: 'El pedido está en marcha. Hasta el martes. ¡Gracias!',
          }
        },
      },
      1000: {
        message: ({ user }) => {
          return {
            text: 'Fin',
          }
        },
      },
    }
  }
}
