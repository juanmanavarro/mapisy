export class YesNoButtons {
  static create([yesLabel, noLabel] = ['Si', 'No']) {
    return [
      {
        text: yesLabel,
        data: true,
      },
      {
        text: noLabel,
        data: false,
      }
    ];
  }
}
