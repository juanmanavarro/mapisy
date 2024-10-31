import { limitTo } from "../helpers/text";

export class Item {
  static create(id, title: string, description: string = '') {
    return {
      id: JSON.stringify(id),
      title: limitTo(title, 24),
      description: limitTo(description, 72)
    };
  }
}
