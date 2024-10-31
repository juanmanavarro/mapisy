import { Injectable } from '@nestjs/common';
import { Button } from 'src/chatbot/components/button';
import { NewConversation } from 'src/chatbot/conversations/conversation';

@Injectable()
export class BaseConversation extends NewConversation {
  constructor() {
    super();
  }

  steps() {
    return {
      0: {
        message: ({ user }) => {
          return {
            text: `Hola ${user.name}, soy DialogBot el asistente virtual de DialogBot Store. Dime, ¿qué demo quieres probar?`,
            options: {
              buttons: [
                Button.create('Haz un pedido', 'order'),
                Button.create('Alquila un vehículo', 'rent'),
              ]
            }
          }
        },
      },
    }
  }
}
