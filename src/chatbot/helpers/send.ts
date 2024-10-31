import { EventEmitter } from "events";

export class Send extends EventEmitter {
  private static instance: Send;

  static create(): Send {
    if ( !Send.instance ) {
      Send.instance = new Send();
    }

    return Send.instance;
  }

  static on(event, cb): AsyncIterableIterator<any>{
    return Send.create().on(event, cb) as any;
  }

  static async to(user, message, options = null) {
    const messages = Array.isArray(message)
      ? message
      : [message];
    for (const message of messages) {
      const text = message.text ? message.text : message;
      options ||= message.options;
      await Send.create().emit('send:text', {
        user,
        message: text,
        options,
      });
      await new Promise(r => setTimeout(r, 1000));
    }

  }

  static imageTo(user, message, options = {}, delay = 0) {
    setTimeout(() => {
      Send.create().emit('send:image', {
        user,
        message,
        options,
      });
    }, delay);
  }

  static product(user, product, options = {}, delay = 0) {
    setTimeout(() => {
      Send.create().emit('send:product', {
        user,
        product,
        options,
      });
    }, delay);
  }

  static card(user, image, title, subtitle, options = {}, delay = 0) {
    setTimeout(() => {
      Send.create().emit('send:card', {
        user,
        image,
        title,
        subtitle,
        options,
      });
    }, delay);
  }
}
