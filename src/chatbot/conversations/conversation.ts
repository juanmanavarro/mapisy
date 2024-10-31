import { Send } from "../helpers/send";
import { zipcodes } from "./spain-zipcodes";

export class NewConversation {
  private attempts = 0;

  isLastAttempt(maxAttempts = 3) {
    this.attempts++;
    return this.attempts >= maxAttempts;
  }

  pause(ms = 1000) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  validateInteraction({ message, user }) {
    if ( !message.hasOwnProperty('interaction') ) {
      Send.to(user, 'Por favor, escoge una opción.');
      return false;
    }

    return true;
  }

  validateText({ message, user }, response = 'No entendí, lo siento.') {
    if ( !message.hasOwnProperty('text') ) {
      Send.to(user, response);
      return false;
    }

    return true;
  }

  validateZipcode({ message, user }) {
    if ( message.text?.length !== 5 || isNaN(message.text) ) {
      Send.to(user, 'El código postal no es válido.');
      return false;
    }

    const zipcode = zipcodes.find(z => z.zipcode === message.text);

    if ( !zipcode ) {
      Send.to(user, 'El código postal no es válido.')
      return false;
    }

    return zipcode;
  }
}
