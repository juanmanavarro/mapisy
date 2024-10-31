import { Injectable } from '@nestjs/common';
import { Button } from '../components/button';
import { NewConfirmButtons } from '../components/new-confirm-buttons';
import { Send } from '../helpers/send';
import { Context } from './context';
import { NewConversation } from './conversation';
import { limitTo, toEuros } from '../helpers/text';

@Injectable()
export class SelectProductConversation extends NewConversation  {
  steps({ products, message = 'Elige un producto', id, nextStep }, cb) {
    return {
      [`${id}.0`]: {
        message: () => {
          return {
            text: message,
            options: {
              buttons: products.map(v => {
                return Button.create(limitTo(v.name, 20), v.id);
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

          const price = `${toEuros(product.price)}/día`;
          Send.card(user, product.image, product.name, price, {
            buttons: NewConfirmButtons.create(['Confirmar', 'Cancelar']),
          });
        },
        action: ({ message, user }) => {
          if ( !this.validateInteraction({ message, user }) ) return false;

          if ( !message.interaction ) return `${id}.0`;

          cb(user, Context.get(user, 'selected_product_id'));
          Context.delete(user, 'selected_product_id')

          return nextStep;
        }
      },
    }
  }
}
