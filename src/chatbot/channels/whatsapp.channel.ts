import axios from "axios";
import * as fs from 'fs';
import { Send } from 'src/chatbot/helpers/send';
import { Button } from "../components/button";
import { ConfirmButtons } from "../components/confirm-buttons";
import { limitTo, toEuros } from "../helpers/text";

export class MessageService {
  static async transform(body) {
    const message = body.entry[0].changes[0].value.messages[0];

    const url = this.extractUrl(message);

    const msg: any = {
      profile: body.entry[0].changes[0].value.contacts[0].profile,
      from: message.from,
      id: message.id,
      timestamp: message.timestamp,
      platform: 'whatsapp',
    };

    if ( url ) {
      msg.url = url;
    } else if ( message.text ) {
      msg.text = message.text.body;
    } else if ( message.location ) {
      msg.location = message.location || null;
    } else if ( message.document ) {
      msg.document = message.document || null;
    } else if ( message.voice ) {
      const res = await axios.get(message.voice, {
        headers: { Authorization: `Bearer ${process.env.WHATSAPP_ACCOUNT_TOKEN}` },
        responseType: 'arraybuffer',
      });
      msg.voice = Buffer.from(res.data).toString("base64");
    } else if ( message.interactive ) {
      if ( message.interactive.button_reply ) {
        msg.interaction = JSON.parse(message.interactive.button_reply.id);
      } else if ( message.interactive.list_reply ) {
        msg.interaction = JSON.parse(message.interactive.list_reply.id);
      }
    } else if ( message.image ) {
      msg.image = message.image;
      const url = await MediaService.getFileLink(message.image.id);
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${process.env.WHATSAPP_ACCOUNT_TOKEN}` },
        responseType: 'arraybuffer'
      });

      const encoded = Buffer.from(res.data, 'binary').toString('base64');
      message.image.url = `data:image/jpeg;base64,${encoded}`;
    }

    return msg;
  }

  private static extractUrl(message) {
    if ( message.text?.body ) {
      const regex = /\bhttps?:\/\/\S+\b/g;
      const url = message.text.body.match(regex)?.[0];
      if ( url ) {
        return url;
      }
    }

    return null;
  }
}

export class MediaService {
  static async getFileLink(id) {
    try {
      const { data } = await axios.get(`https://graph.facebook.com/v15.0/${id}`, {
        headers: { Authorization: `Bearer ${process.env.WHATSAPP_ACCOUNT_TOKEN}`}
      });
      return data.url;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  static async downloadFile(id, directory = 'uploads') {
    const { data } = await axios.get(`https://graph.facebook.com/v15.0/${id}`, {
      headers: { Authorization: `Bearer ${process.env.WHATSAPP_ACCOUNT_TOKEN}`}
    });
    const res = await axios.get(data.url, {
      headers: { Authorization: `Bearer ${process.env.WHATSAPP_ACCOUNT_TOKEN}` },
      responseType: 'arraybuffer',
      responseEncoding: 'binary',
    });

    const filePath = `./${directory}/${id}.oga`;
    await fs.createWriteStream(`./${directory}/${id}.oga`).write(res.data);
    return filePath;
  }
}

type WhatsAppConfig = {
  test_phones?: string[],
  account_id: string,
  account_token: string,
  phone_id: string,
  verify_token: string,
};

export class WhatsAppChannel {
  constructor(private config: WhatsAppConfig) {}

  async input(body, cb) {
    if ( this.config.test_phones ) {
      const phone = body.entry?.[0].changes?.[0].value.messages?.[0].from;
      if ( phone && !this.config.test_phones.includes(phone) ) {
        return;
      }
    }

    if ( body.entry?.[0].id !== this.config.account_id ) {
      return;
    }

    if ( !body.entry?.[0].changes?.[0].value.messages?.length ) {
      return;
    }

    try {
      if ( body.entry[0].changes[0].value.messages[0].audio ) {
        body.entry[0].changes[0].value.messages[0].voice = await MediaService.getFileLink(
          body.entry[0].changes[0].value.messages[0].audio.id,
        );

        if ( !body.entry[0].changes[0].value.messages[0].voice ) {
          console.error('[ERROR VOICE] no voice');
          return;
        }
      }

      const message = await MessageService.transform(body);
      message.chat_id = this.config.phone_id;

      return cb(message);
    } catch (error) {
      console.log(error);
      return;
    }
  }

  async output() {
    Send.on('send:text', async ({ user, message, options }) => {
      if ( user.platform !== 'whatsapp' ) return;

      let payload: any = {
        messaging_product: 'whatsapp',
        to: user.platform_user_id,
      };

      if ( options?.buttons ) {
        if ( options.buttons.length <= 3 ) {
          payload = {
            ...payload,
            type: "interactive",
            interactive: {
              type: "button",
              body: {
                text: message,
              },
              action: {
                buttons: options.buttons.map(button => {
                  return {
                    type: "reply",
                    reply: {
                      id: button.data,
                      title: button.text,
                    }
                  }
                }),
              }
            }
          }
        } else {
          payload = {
            ...payload,
            type: "interactive",
            interactive: {
              type: "list",
              body: {
                text: message,
              },
              action: {
                button: options.button || 'Escoge una opción',
                sections :[
                  {
                    rows: options.buttons.map(button => {
                      return {
                        id: button.data,
                        title: button.text,
                        description: button.description,
                      }
                    }),
                  },
                ]
              }
            }
          }
        }
      } else if ( options?.reply_to_message_id ) {
        payload = {
          ...payload,
          type: "text",
          ...message,
          context: {
            message_id: options.reply_to_message_id,
          },
        }
      }
      else if ( options?.list ) {
        payload = {
          ...payload,
          type: "interactive",
          interactive: {
            type: "list",
            body: {
              text: message,
            },
            action: {
              button: options.button || 'Escoge una opción',
              sections :[
                {
                  rows: options.list,
                },
              ]
            }
          }
        }
      }
      else {
        payload = {
          ...payload,
          type: "text",
          text: { body: message },
        }
      }

      try {
        const { data } = await axios.post(`https://graph.facebook.com/v15.0/${this.config.phone_id}/messages`, payload, {
          headers: {
            Authorization: `Bearer ${this.config.account_token}`,
            'Content-Type': 'application/json',
          }
        });

        return { ...data.messages[0], ...message };
      } catch (error) { console.log(error.response.data.error) }
    });

    Send.on('send:product', async ({ user, product, options }) => {
      if ( user.platform !== 'whatsapp' ) return;

      options.buttons = [
        Button.create(`Quiero 1`, 1),
        Button.create('Quiero más', 'more'),
        Button.create('Cancelar', 'cancel'),
      ];

      let payload = {
        recipient_type: 'individual',
        messaging_product: 'whatsapp',
        to: user.platform_user_id,
        type: 'interactive',
        interactive: {
          type: 'button',
          header: {
            type: 'image',
            image: {
              link: product.image,
            }
          },
          body: {
            text: `${product.name}\n${toEuros(product.price)}`,
          },
          footer: {
            text: limitTo(`${product.description}
La unidad sale a ${toEuros(product.unit_price || 0)}`, 60),
          },
          action: {
            buttons: options.buttons.map(button => {
              return {
                type: "reply",
                reply: {
                  id: button.data,
                  title: button.text,
                }
              }
            }),
          }
        }
      };

      try {
        const { data } = await axios.post(`https://graph.facebook.com/v15.0/${this.config.phone_id}/messages`, payload, {
          headers: {
            Authorization: `Bearer ${this.config.account_token}`,
            'Content-Type': 'application/json',
          }
        });

        return { ...data.messages[0] };
      } catch (error) { console.log(error.response.data.error) }
    });

    Send.on('send:image', async ({ user, message, options }) => {
      if ( user.platform !== 'whatsapp' ) return;

      const image = process.env.BACK_URL + message;

      let payload = {
        recipient_type: 'individual',
        messaging_product: 'whatsapp',
        to: user.user_id,
        type: 'interactive',
        interactive: {
          type: 'button',
          header: {
            type: 'image',
            text: 'your text',
            image: {
              link: image,
            }
          },
          body: {
            text: options.title,
          },
          footer: {
            text: options.subtitle,
          },
          action: {
            buttons: options.buttons.map(button => {
              return {
                type: "reply",
                reply: {
                  id: button.data,
                  title: button.text,
                }
              }
            }),
          }
        }
      };

      try {
        const { data } = await axios.post(`https://graph.facebook.com/v15.0/${this.config.phone_id}/messages`, payload, {
          headers: {
            Authorization: `Bearer ${this.config.account_token}`,
            'Content-Type': 'application/json',
          }
        });

        return { ...data.messages[0], ...message };
      } catch (error) { console.log(error.response.data.error) }
    });

    Send.on('send:card', async ({ user, image, title, subtitle, options }) => {
      // image = 'https://motorental-lanzarote.com/wp-content/uploads/2023/08/rent-Honda_Shadow-Lanzarote-Canary-Islands.png'

      if ( user.platform !== 'whatsapp' ) return;

      let payload = {
        recipient_type: 'individual',
        messaging_product: 'whatsapp',
        to: user.platform_user_id,
        type: 'interactive',
        interactive: {
          type: 'button',
          header: {
            type: 'image',
            text: 'your text',
            image: {
              link: image,
            }
          },
          body: {
            text: title,
          },
          footer: {
            text: subtitle,
          },
          action: {
            buttons: options.buttons?.map(button => {
              return {
                type: "reply",
                reply: {
                  id: button.data,
                  title: button.text,
                }
              }
            }),
          }
        }
      };

      try {
        const { data } = await axios.post(`https://graph.facebook.com/v15.0/${this.config.phone_id}/messages`, payload, {
          headers: {
            Authorization: `Bearer ${this.config.account_token}`,
            'Content-Type': 'application/json',
          }
        });

        return { ...data.messages[0], };
      } catch (error) { console.log(error.response.data.error) }
    });
  }

  verify(request) {
    let mode = request.query['hub.mode'];
    let token = request.query['hub.verify_token'];
    let challenge = request.query['hub.challenge'];

    if ( mode && token && mode === 'subscribe' && token === this.config.verify_token ) {
      return challenge;
    }

    return false;
  }

  async encodeImage(imageUrl) {
    try {
      const res = await axios.get(imageUrl, {
        headers: { Authorization: `Bearer ${process.env.WHATSAPP_ACCOUNT_TOKEN}` },
        responseType: 'arraybuffer'
      });

      return Buffer.from(res.data, 'binary').toString('base64');
    } catch (error) {
      console.log(error);

    }
  }
}
