import { Injectable } from '@nestjs/common';
import { Send } from '../helpers/send';
import { Context } from './context';
import { NewConversation } from './conversation';
import { ConfirmMessage } from '../components/messages/confirm';
import { DateHelper } from '../helpers/date';
import { IaService } from 'src/ia/ia.service';
import { NewConfirmButtons } from '../components/new-confirm-buttons';

@Injectable()
export class SelectDateConversation extends NewConversation  {
  constructor(
    private readonly iaService: IaService,
  ) { super() }

  steps({ message = '¿Qué día?', id, nextStep, prompt = null }, cb) {
    return {
      [`${id}.0`]: {
        message: () => {
          return message;
        },
        action: async ({ message, user }) => {
          // Context.set(user, `${id}.date`, '2024-07-20');
          // return `${id}.100`;
          const threadId = Context.get(user, 'thread_id');

          const {
            response,
            thread,
          } = await this.iaService.extractDate(threadId, message.text, prompt);

          if ( response.message ) {
            Context.set(user, 'thread_id', thread.id);
            Send.to(user, response.message);
            return false;
          }

          Context.set(user, `${id}.date`, response.date);
          Context.delete(user, 'thread_id');

          return `${id}.100`;
        }
      },
      [`${id}.100`]: {
        message: ({ user }) => {
          const date = Context.get(user, `${id}.date`);
          const formattedDate = DateHelper.format(date, 'dddd D [de] MMMM');
          return {
            text: `El ${formattedDate}, ¿es correcto?`,
            options: {
              buttons: NewConfirmButtons.create(),
            }
          }
        },
        action: async ({ message, user }) => {
          if ( !this.validateInteraction({ message, user }) ) return false;

          if ( !message.interaction ) {
            await Send.to(user, 'Lo siento, no entendí bien.');
            Context.delete(user, `${id}.date`);
            return `${id}.100`;
          }

          const date = Context.get(user, `${id}.date`);
          cb(user, date);
          Context.delete(user, id);

          return typeof nextStep === 'function' ? nextStep({ user, date }) : nextStep;
        }
      },
    }
  }
}
