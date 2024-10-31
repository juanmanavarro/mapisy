import { Injectable } from '@nestjs/common';
import { Send } from '../helpers/send';
import { Context } from './context';
import { NewConversation } from './conversation';
import { ConfirmMessage } from '../components/messages/confirm';
import { DateHelper } from '../helpers/date';
import { IaService } from 'src/ia/ia.service';

@Injectable()
export class SelectTimeConversation extends NewConversation  {
  constructor(
    private readonly iaService: IaService,
  ) { super() }

  steps({ message = '¿A qué hora?', id, nextStep, prompt = null }, cb) {
    return {
      [`${id}.0`]: {
        message: () => {
          return message;
        },
        action: async ({ message, user }) => {
          // Context.set(user, `${id}.time`, response.time);
          // return `${id}.100`;
          const threadId = Context.get(user, 'thread_id');

          const { response, thread } = await this.iaService.extractTime(threadId, message.text, prompt);

          if ( response.message ) {
            Context.set(user, 'thread_id', thread.id);
            Send.to(user, response.message);
            return false;
          }

          Context.set(user, `${id}.time`, response.time);

          return `${id}.100`;
        }
      },
      [`${id}.100`]: {
        message: ({ user }) => {
          const time = Context.get(user, `${id}.time`);
          const formattedTime = DateHelper.dayjs(time, 'HH:mm:ss').format('HH:mm A');
          return ConfirmMessage.create(`${formattedTime}`,);
        },
        action: async ({ message, user }) => {
          if ( !this.validateInteraction({ message, user }) ) return false;

          if ( !message.interaction ) {
            await Send.to(user, 'Lo siento, no entendí bien.');
            Context.delete(user, `${id}.time`);
            return `${id}.0`;
          }

          Context.delete(user, 'thread_id');

          cb(user, Context.get(user, `${id}.time`));
          Context.delete(user, id);

          return nextStep;
        }
      },
    }
  }
}
