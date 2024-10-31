import * as TelegramBot from 'node-telegram-bot-api';
import axios from "axios";
import { Send } from 'src/chatbot/helpers/send';

export class MessageService {
  static async transform(message) {
    const url = this.extractUrl(message);

    const msg: any = {
      profile: {
        name: message.from.first_name,
        username: message.from.username,
      },
      from: message.from.id,
      id: message.message_id,
      timestamp: message.date,
      platform: 'telegram',
    };

    if ( url ) {
      msg.url = url;
    } else if ( message.text ) {
      msg.text = message.text;
    } else if ( message.location ) {
      msg.location = message.location;
    } else if ( message.document ) {
      if ( message.document.mime_type.startsWith('image') ) {
        msg.image = message.document.thumbnail;
      } else {
        msg.document = message.document;
      }
    } else if ( message.voice ) {
      const res = await axios.get(message.voice, {
        responseType: 'arraybuffer',
      });
      msg.voice = Buffer.from(res.data).toString("base64");
    } else if ( message.photo ) {
      msg.image = message.photo[message.photo.length - 1];
    } else if ( message.data ) {
      msg.interaction = JSON.parse(message.data);
      msg.id = message.message.message_id;
    }

    return msg;
  }

  private static extractUrl(message) {
    if ( message.entities ) {
      const url = message.entities.find(entity => entity.type === 'url');
      if ( url ) {
        return message.text.substr(url.offset, url.length);
      } else {
        const url = message.entities.find(entity => entity.type === 'text_link');
        if ( url ) {
          return url.url;
        }
      }
    }

    return null;
  }
}

export class TelegramChannel {
  private telegram: TelegramBot;

  constructor(config) {
    this.telegram = new TelegramBot(config.token, {
      polling: true,
    });
  }

  listen(cb) {
    const events = ['voice', 'text', 'location', 'callback_query', 'photo', 'document'];

    for (const event of events) {
      this.telegram.on(event, async (msg) => {
        if ( event === 'voice' ) {
          this.telegram.sendMessage(msg.chat.id, 'Escuchando audio...');
          msg.voice = await this.telegram.getFileLink(
            msg.voice.file_id,
          )
        }

        if ( event === 'callback_query' && msg.message ) {
          this.telegram.editMessageReplyMarkup({}, {
            message_id: msg.message.message_id,
            chat_id: msg.message.chat.id
          });
        }

        const message = await MessageService.transform(msg);

        const bot = await this.telegram.getMe();
        message.chat_id = bot.id;

        if ( message.image ) {
          message.image.url = await this.telegram.getFileLink(
            message.image.file_id,
          )
        }

        cb(message);
      });
    }

    Send.on('send:text', async ({ user, message, options }) => {
      const bot = await this.telegram.getMe();
      if ( user.platform !== 'telegram' || bot.id != user.chat_id ) return;

      if ( options?.buttons ) {
        options.reply_markup = {
          inline_keyboard: options.buttons.reduce((acc, button, index) => {
            const buttonObj = {
              text: button.text,
              callback_data: button.data,
            };

            if (index % 2 === 0) {
              acc.push([buttonObj]);
            } else {
              acc[acc.length - 1].push(buttonObj);
            }

            return acc;
          }, [])
        };

        delete options.buttons;
      }

      try {
        await this.telegram.sendMessage(user.platform_user_id, message, {
          parse_mode: 'Markdown',
          ...options,
        });
      } catch (error) {
        console.log(error);
        await this.telegram.sendMessage(user.platform_user_id, 'Ha habido algún error');
      }
    });

    Send.on('send:image', async ({ user, message, options }) => {
      const bot = await this.telegram.getMe();
      if ( user.platform !== 'telegram' || bot.id != user.chat_id ) return;

      message = process.env.PWD + '/assets/' + message;

      if ( options?.buttons ) {
        options.reply_markup = {
          inline_keyboard: options.buttons.reduce((acc, button, index) => {
            const buttonObj = {
              text: button.text,
              callback_data: button.data,
            };

            if (index % 2 === 0) {
              acc.push([buttonObj]);
            } else {
              acc[acc.length - 1].push(buttonObj);
            }

            return acc;
          }, [])
        };

        delete options.buttons;
      }

      if ( options?.title ) {
        options.caption = `*${options.title}*`;
        if ( options.subtitle ) {
          options.caption += '\n\n' + options.subtitle;
        }
      }

      setTimeout(async () => {
        await this.telegram.sendPhoto(user.user_id, message, {
          parse_mode: 'Markdown',
          ...options,
        });
      }, 1000);
    });
  }
}
