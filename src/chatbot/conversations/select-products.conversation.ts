import { Injectable } from '@nestjs/common';
import { Button } from '../components/button';
import { Send } from '../helpers/send';
import { Context } from './context';
import { NewConversation } from './conversation';
import { isNumber, limitTo, toEuros } from '../helpers/text';
import { ConfirmButtons } from '../components/confirm-buttons';

@Injectable()
export class SelectProductsConversation extends NewConversation  {
  steps({ products, message = 'Elige un producto', id, next }) {
    return {
      [`${id}.0`]: {
        message: () => {
          return {
            text: message,
            options: {
              buttons: products.map(v => {
                return {
                  ...Button.create(limitTo(v.name, 20), v.id),
                  description: limitTo(v.description, 72),
                };
              }),
            }
          }
        },
        action: ({ message, user }) => {
          if ( !this.validateInteraction({ message, user }) ) return false;

          Context.set(user, 'selected_product_id', message.interaction);

          return `${id}.100`;
        }
      },
      [`${id}.100`]: {
        message: ({ user }) => {
          const product_id = Context.get(user, 'selected_product_id');
          const product = products.find(p => p.id === product_id);

          Send.card(user, product.image, product.name, toEuros(product.price), {
            buttons: [
              Button.create(`Quiero 1`, 1),
              Button.create('Quiero más', 'more'),
              Button.create('Cancelar', 'cancel'),
            ],
          });

          return '';
        },
        action: ({ message, user }) => {
          if ( !this.validateInteraction({ message, user }) ) return false;

          if ( message.interaction === 'more' ) {
            return `${id}.200`;
          }

          if ( message.interaction === 'cancel' ) {
            const order = Context.get(user, 'order');
            if ( order?.products?.length ) {
              return `${id}.300`;
            }
            return `${id}.0`;
          }

          Context.set(user, 'order.products', [{
            id: Context.get(user, 'selected_product_id'),
            quantity: message.interaction,
          }]);

          return `${id}.250`;
        }
      },
      [`${id}.200`]: {
        message: () => {
          return '¿Qué cantidad?';
        },
        action: ({ message, user }) => {
          if ( isNumber(message.text) ) {
            Context.set(user, 'order.products', [{
              id: Context.get(user, 'selected_product_id'),
              quantity: message.text,
            }]);
            return `${id}.250`;
          }

          // TODO: ia number
          Context.set(user, 'order.products', [{
            id: Context.get(user, 'selected_product_id'),
            quantity: 1,
          }]);

          return `${id}.250`;
        }
      },
      [`${id}.250`]: {
        message: ({ user }) => {
          const context = Context.get(user);
          const addedProduct = context.order.products.find(p => context.selected_product_id === p.id);
          const product = products.find(p => p.id === addedProduct.id);
          return {
            text: `${addedProduct.quantity} ${product.name} añadido al carrito, ¿es correcto?`,
            options: {
              buttons: [
                Button.create('Si', true),
                Button.create('Otra cantidad', 'quantity'),
                Button.create('Quitar del carrito', 'remove'),
              ],
            }
          }
        },
        action: async ({ message, user }) => {
          if ( !this.validateInteraction({ message, user }) ) return false;

          if ( message.interaction === 'remove' ) {
            const productId = Context.get(user, 'selected_product_id');
            Context.delete(user, 'order.products', productId);

            const products = Context.get(user, 'order.products');
            return products.length ? `${id}.300` : `${id}.0`;
          }

          if ( message.interaction === 'quantity' ) {
            const productId = Context.get(user, 'selected_product_id');
            Context.delete(user, 'order.products', productId);
            return `${id}.200`;
          }

          await Send.to(user, 'Bien, producto añadido.');

          return `${id}.300`;
        }
      },
      [`${id}.300`]: {
        message: () => {
          return {
             text: `¿Quieres algún otro producto?`,
             options: {
              buttons: ConfirmButtons.create()
             }
          };
        },
        action: ({ message, user }) => {
          if ( !message.hasOwnProperty('interaction') ) {
            Send.to(user, 'Por favor, escoge una opción.');
            return false;
          }

          if ( !message.interaction?.confirm ) {
            return next;
          }

          return `${id}.0`;
        }
      },
    }
  }
}
