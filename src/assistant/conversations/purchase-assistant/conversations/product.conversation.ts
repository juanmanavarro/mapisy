import { Injectable } from '@nestjs/common';
import { Context } from 'src/chatbot/conversations/context';
import { NewConversation } from 'src/chatbot/conversations/conversation';
import { ProductsService } from 'src/wordpress/services/products.service';
import { Send } from 'src/chatbot/helpers/send';
import { Button } from 'src/chatbot/components/button';
import { isNumber, toEuros } from 'src/chatbot/helpers/text';
import { NewConfirmButtons } from 'src/chatbot/components/new-confirm-buttons';
import { Summary } from '../components/summary';

@Injectable()
export class ProductConversation extends NewConversation {
  id = 'ProductConversation';

  constructor(
    private readonly productsService: ProductsService,
  ) { super() }

  steps() {
    return {
      0: {
        message: async ({ user }) => {
          const product = Context.get(user, 'product');

          await Send.card(user, product.image, product.name, toEuros(product.price), {
            buttons: [
              Button.create(`Quiero 1`, 1),
              Button.create('Quiero más', 'more'),
              Button.create('Cancelar', 'cancel'),
            ]
          }, 1000);

          return `¡Hola ${user.name}! Vamos a comprar el producto ${product.name}. Un momento...`;
        },
        action: ({ message, user }) => {
          if ( !this.validateInteraction({ message, user }) ) return false;

          if ( message.interaction === 'more' ) {
            return 'ProductConversation.200';
          }

          if ( message.interaction === 'cancel' ) {
            return 'ProductConversation.1000';
          }

          if ( message.interaction === 1 ) Context.set(user, 'quantity', message.interaction);

          return 'ProductConversation.300';
        }
      },
      200: {
        message: ({ message, user }) => {
          return `¿Qué cantidad?`;
        },
        action: ({ message, user }) => {
          if ( !isNumber(message.text) ) {
            Send.to(user, 'Por favor, indica una cantidad');
            return false;
          }

          Context.set(user, 'quantity', message.text);

          return 'ProductConversation.300';
        }
      },
      300: {
        message: ({ message, user }) => {
          const { product, quantity } = Context.get(user);

          return {
            text: [
              Summary.create({ product, quantity }),
              '',
              '¿Es correcto?'
            ].join('\n'),
            options: {
              buttons: NewConfirmButtons.create([
                'Si, ir al pago',
                'No',
              ]),
            }
          };
        },
        action: ({ message, user }) => {
          if ( !this.validateInteraction({ message, user }) ) return false;

          if ( !message.interaction ) return 'ProductConversation.0';

          return 'ProductConversation.400';
        }
      },
      400: {
        message: ({ message, user }) => {
          // save order
          return {
            text: [
              `Bien. Puedes realizar el pago en el siguiente enlace:`,
              '',
              `${process.env.PAYMENT_URL}/stripe/checkout/${Context.get(user, 'product.id')}`,
            ].join('\n'),
          }
        },
        action: ({ message, user }) => {
          return 'ProductConversation.1000';
        }
      },
      1000: {
        message: ({ message, user }) => {
          Context.debug();
          return `Fin`;
        },
      },
    }
  }
}
