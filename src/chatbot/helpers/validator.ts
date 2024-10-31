export class Validator {
  static isNumber(value: string | number): boolean {
    if (typeof value === 'number') {
      return !isNaN(value);
    }
    if (typeof value === 'string') {
      return !isNaN(parseFloat(value)) && isFinite(Number(value));
    }
    return false;
  }

  static isInteraction(message) {
    return message.hasOwnProperty('interaction');
  }
}
