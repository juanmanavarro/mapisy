export class NewConfirmButtons {
  static create(labels = ['Si', 'No']) {
    return [
      {
        text: labels[0],
        data: true,
      },
      {
        text: labels[1],
        data: false,
      }
    ];
  }
}
