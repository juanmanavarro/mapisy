import { NewConfirmButtons } from "../new-confirm-buttons";

export class ConfirmMessage {
  static create(message) {
    return {
      text: `${message}, ¿es correcto?`,
      options: {
        buttons: NewConfirmButtons.create(),
      }
    };
  }
}
