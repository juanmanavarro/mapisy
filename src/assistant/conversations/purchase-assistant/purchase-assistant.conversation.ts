import { Injectable } from '@nestjs/common';
import { NewConversation } from 'src/chatbot/conversations/conversation';
import { ProductConversation } from './conversations/product.conversation';
import { ConversationHelper } from 'src/chatbot/helpers/conversation';
import { Context } from 'src/chatbot/conversations/context';
import { ProductsService } from 'src/wordpress/services/products.service';

@Injectable()
export class PurchaseAssistantConversation extends NewConversation {
  constructor(
    protected readonly productConversation: ProductConversation,
    private readonly productsService: ProductsService,
  ) { super() }

  async steps() {
    return {
      0: {
        action: async ({ message, user }) => {
          message.url = 'http://juanma-shop.local/product/pack-carrito/';
          if (!message.url) {
            return 100;
          }

          const url = new URL(message.url);

          if (url.hostname !== 'juanma-shop.local') {
            return 100;
          }

          const pathRegex = /^\/product\/([a-zA-Z0-9-]+)\/?$/;
          const match = url.pathname.match(pathRegex);
          if (!match) {
            return 100;
          }

          const product = await this.productsService.findOneBySlug(match[1]);

          if ( !product ) return 100;

          Context.set(user, 'product', product);

          return 'ProductConversation.0';
        }
      },
      100: {
        message: async () => {
          return 'Lo siento, no reconozco el producto.';
        },
      },
      ...await ConversationHelper.toNested(this.productConversation),
    }
  }
}
