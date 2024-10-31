import { Button } from "./button";

export class RatingButtons {
  static create(labels: string[], step) {
    return labels.map((l, index) => {
      return Button.create(l, { [step]: labels.length - index });
    });
  }
}
