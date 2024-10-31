import { limitTo } from "../helpers/text";

export class Button {
  static create(label: string, payload) {
    return {
      text: limitTo(label, 20),
      data: JSON.stringify(payload),
    };
  }
}
