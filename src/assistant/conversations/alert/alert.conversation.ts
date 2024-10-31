import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { AppGateway } from 'src/app.gateway';
import { Context } from 'src/chatbot/conversations/context';
import { NewConversation } from 'src/chatbot/conversations/conversation';
import { IaService } from 'src/ia/ia.service';

@Injectable()
export class AlertConversation extends NewConversation {
  firstStep = 0;

  constructor(
    private readonly iaService: IaService,
    private readonly appGateway: AppGateway,
  ) {
    super();
  }

  steps() {
    return {
      0: {
        message: ({ user }) => {
          return 'Hola. Este es un chat para avisar de incidencias de DANA. ¿Puedes describir la incidencia?';
        },
        action: async ({ message, user }) => {
          if ( message.text ) {
            Context.set(user, 'alert.description', message.text);
            Context.set(user, 'message', 'Entiendo. Envía la ubicación. Recuerda que este chat es para avisar de incidencias. Las incidencias no son anónimas');
          } else if ( message.location ) {
            Context.set(user, 'alert.location', message.location);
            Context.set(user, 'message', 'Por favor, describe la incidencia. Recuerda que este chat es para avisar de incidencias. Las incidencias no son anónimas');
          }

          return 100;
        }
      },
      100: {
        message: ({ user }) => {
          return Context.get(user, 'message') || 'Hola. Este es un chat para avisar de incidencias. ¿Puedes describir la incidencia?';
        },
        action: async ({ message, user }) => {
          if ( Context.get(user, 'alert.description') && !message.location ) {
            Context.set(user, 'message', 'Por favor, envía la ubicación');
            return 100;
          }

          if ( Context.get(user, 'alert.location') && !message.text ) {
            Context.set(user, 'message', 'Por favor, describe la incidencia');
            return 100;
          }

          if ( message.location ) {
            Context.set(user, 'alert.location', message.location);
            return 200;
          }

          if ( message.text ) {
            Context.set(user, 'alert.description', message.text);
            return 200;
          }

          return 100;
        }
      },
      200: {
        message: async ({ user }) => {
          const location = Context.get(user, 'alert.location');
          const description = Context.get(user, 'alert.description');

          const status = await this.iaService.deduceStatus(description);

          await axios.post(`https://nocodb.juanma.app/api/v2/tables/${process.env.NOCODB_TABLE_ID}/records`, {
            Phone: user.platform_user_id,
            description: description,
            latitude: location.latitude.toString(),
            longitude: location.longitude.toString(),
            status,
          }, {
            headers: {
              'accept': 'application/json',
              'Content-Type': 'application/json',
              'xc-token': process.env.NOCODB_API_KEY
            }
          });

          this.appGateway.send('nueva_incidencia', JSON.stringify({
            latitude: location.latitude.toString(),
            longitude: location.longitude.toString(),
            description,
            status,
          }));

          return 'Gracias por el aviso. Tu incidencia está registrada en el mapa. Puedes verla aquí https://incidenci.es, gracias.';
        }
      }
    };
  }
}
